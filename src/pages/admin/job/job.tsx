import DataTable from "@/components/client/data-table";
import { IJob } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProFormSelect } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, Tag } from "antd";
import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import queryString from 'query-string';
import { useNavigate } from "react-router-dom";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfIn } from "spring-filter-query-builder";
import { useJobs, useDeleteJob } from "@/hooks/useJobQuery";

// Helper function
const buildQuery = (params: any, sort: any, filter: any) => {
    const clone = { ...params };
    let parts = [];
    if (clone.name) parts.push(`name ~ '${clone.name}'`);
    if (clone.salary) parts.push(`salary ~ '${clone.salary}'`);
    if (clone?.level?.length) {
        parts.push(`${sfIn("level", clone.level).toString()}`);
    }

    clone.filter = parts.join(' and ');
    if (!clone.filter) delete clone.filter;

    clone.page = clone.current;
    clone.size = clone.pageSize;

    delete clone.current;
    delete clone.pageSize;
    delete clone.name;
    delete clone.salary;
    delete clone.level;

    let temp = queryString.stringify(clone);

    let sortBy = "";
    if (sort && sort.name) {
        sortBy = sort.name === 'ascend' ? "sort=name,asc" : "sort=name,desc";
    }
    if (sort && sort.salary) {
        sortBy = sort.salary === 'ascend' ? "sort=salary,asc" : "sort=salary,desc";
    }
    if (sort && sort.level) {
        sortBy = sort.level === 'ascend' ? "sort=level,asc" : "sort=level,desc";
    }
    if (sort && sort.createdAt) {
        sortBy = sort.createdAt === 'ascend' ? "sort=createdAt,asc" : "sort=createdAt,desc";
    }
    if (sort && sort.updatedAt) {
        sortBy = sort.updatedAt === 'ascend' ? "sort=updatedAt,asc" : "sort=updatedAt,desc";
    }

    //mặc định sort theo updatedAt
    if (Object.keys(sortBy).length === 0) {
        temp = `${temp}&sort=updatedAt,desc`;
    } else {
        temp = `${temp}&${sortBy}`;
    }

    temp += "&populate=companyId&fields=companyId.id, companyId.name, companyId.logo";
    return temp;
}

const JobPage = () => {
    const [queryParams, setQueryParams] = useState({ current: 1, pageSize: 10 });
    const [sortParams, setSortParams] = useState({});
    const [filterParams, setFilterParams] = useState({});

    const tableRef = useRef<ActionType>();
    const navigate = useNavigate();

    // TanStack Query
    const query = buildQuery(queryParams, sortParams, filterParams);
    const { data, isLoading, refetch } = useJobs(query);
    const deleteJobMutation = useDeleteJob();

    // Extract data
    const jobs = data?.result || [];
    const meta = data?.meta || { page: 1, pageSize: 10, total: 0 };

    const handleDeleteJob = async (id: string | undefined) => {
        if (id) {
            await deleteJobMutation.mutateAsync(id);
        }
    }

    const reloadTable = () => {
        refetch();
    }

    const columns: ProColumns<IJob>[] = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (
                    <>
                        {(index + 1) + (meta.page - 1) * (meta.pageSize)}
                    </>)
            },
            hideInSearch: true,
        },
        {
            title: 'Tên Job',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Công ty',
            dataIndex: ["company", "name"],
            sorter: true,
            hideInSearch: true,
        },
        {
            title: 'Mức lương',
            dataIndex: 'salary',
            sorter: true,
            render(dom, entity, index, action, schema) {
                const str = "" + entity.salary;
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ</>
            },
        },
        {
            title: 'Level',
            dataIndex: 'level',
            renderFormItem: (item, props, form) => (
                <ProFormSelect
                    showSearch
                    mode="multiple"
                    allowClear
                    valueEnum={{
                        INTERN: 'INTERN',
                        FRESHER: 'FRESHER',
                        JUNIOR: 'JUNIOR',
                        MIDDLE: 'MIDDLE',
                        SENIOR: 'SENIOR',
                    }}
                    placeholder="Chọn level"
                />
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            render(dom, entity, index, action, schema) {
                return <>
                    <Tag color={entity.active ? "lime" : "red"} >
                        {entity.active ? "ACTIVE" : "INACTIVE"}
                    </Tag>
                </>
            },
            hideInSearch: true,
        },

        {
            title: 'createdAt',
            dataIndex: 'createdAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.createdAt ? dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'updatedAt',
            dataIndex: 'updatedAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.updatedAt ? dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {

            title: 'Actions',
            hideInSearch: true,
            width: 50,
            render: (_value, entity, _index, _action) => (
                <Space>
                    < Access
                        permission={ALL_PERMISSIONS.JOBS.UPDATE}
                        hideChildren
                    >
                        <EditOutlined
                            style={{
                                fontSize: 20,
                                color: '#ffa500',
                            }}
                            type=""
                            onClick={() => {
                                navigate(`/admin/job/upsert?id=${entity.id}`)
                            }}
                        />
                    </Access >
                    <Access
                        permission={ALL_PERMISSIONS.JOBS.DELETE}
                        hideChildren
                    >
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa job"}
                            description={"Bạn có chắc chắn muốn xóa job này ?"}
                            onConfirm={() => handleDeleteJob(entity.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <span style={{ cursor: "pointer", margin: "0 10px" }}>
                                <DeleteOutlined
                                    style={{
                                        fontSize: 20,
                                        color: '#ff4d4f',
                                    }}
                                />
                            </span>
                        </Popconfirm>
                    </Access>
                </Space >
            ),

        },
    ];

    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.JOBS.GET_PAGINATE}
            >
                <DataTable<IJob>
                    actionRef={tableRef}
                    headerTitle="Danh sách Jobs"
                    rowKey="id"
                    loading={isLoading}
                    columns={columns}
                    dataSource={jobs}
                    manualRequest={true}
                    scroll={{ x: true }}
                    pagination={
                        {
                            current: meta.page,
                            pageSize: meta.pageSize,
                            showSizeChanger: true,
                            total: meta.total,
                            onChange: (page, pageSize) => {
                                setQueryParams({ current: page, pageSize });
                            },
                            showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
                        }
                    }
                    rowSelection={false}
                    toolBarRender={(_action, _rows): any => {
                        return (
                            <Button
                                icon={<PlusOutlined />}
                                type="primary"
                                onClick={() => navigate('upsert')}
                            >
                                Thêm mới
                            </Button>
                        );
                    }}
                />
            </Access>
        </div >
    )
}

export default JobPage;