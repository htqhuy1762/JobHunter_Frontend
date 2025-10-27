
import DataTable from "@/components/client/data-table";
import { ISkill } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import queryString from 'query-string';
import { sfLike } from "spring-filter-query-builder";
import ModalSkill from "@/components/admin/skill/modal.skill";
import { useSkills, useDeleteSkill } from "@/hooks/useSkillQuery";

// Helper function để build query string
const buildQuery = (params: any, sort: any, filter: any) => {
    const clone = { ...params };
    const q: any = {
        page: params.current,
        size: params.pageSize,
        filter: ""
    }

    if (clone.name) q.filter = `${sfLike("name", clone.name)}`;
    if (!q.filter) delete q.filter;

    let temp = queryString.stringify(q);

    let sortBy = "";
    if (sort && sort.name) {
        sortBy = sort.name === 'ascend' ? "sort=name,asc" : "sort=name,desc";
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

    return temp;
}

const SkillPage = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<ISkill | null>(null);
    const [queryParams, setQueryParams] = useState({ current: 1, pageSize: 10 });
    const [sortParams, setSortParams] = useState({});
    const [filterParams, setFilterParams] = useState({});

    const tableRef = useRef<ActionType>();

    // TanStack Query
    const query = buildQuery(queryParams, sortParams, filterParams);
    const { data, isLoading, refetch } = useSkills(query);
    const deleteSkillMutation = useDeleteSkill();

    // Extract data từ response
    const skills = data?.result || [];
    const meta = data?.meta || { page: 1, pageSize: 10, total: 0 };

    const handleDeleteSkill = async (id: string | undefined) => {
        if (id) {
            await deleteSkillMutation.mutateAsync(id);
        }
    }

    const reloadTable = () => {
        refetch();
    }

    const columns: ProColumns<ISkill>[] = [
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
            title: 'Name',
            dataIndex: 'name',
            sorter: true,
        },

        {
            title: 'Created By',
            dataIndex: 'createdBy',
            hideInSearch: true,
        },

        {
            title: 'Updated By',
            dataIndex: 'lastModifiedBy',
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

                    <EditOutlined
                        style={{
                            fontSize: 20,
                            color: '#ffa500',
                        }}
                        type=""
                        onClick={() => {
                            setOpenModal(true);
                            setDataInit(entity);
                        }}
                    />

                    <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa skill"}
                        description={"Bạn có chắc chắn muốn xóa skill này ?"}
                        onConfirm={() => handleDeleteSkill(entity.id)}
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
                </Space>
            ),

        },
    ];

    return (
        <div>
            <DataTable<ISkill>
                actionRef={tableRef}
                headerTitle="Danh sách Skill"
                rowKey="id"
                loading={isLoading}
                columns={columns}
                dataSource={skills}
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
                            onClick={() => setOpenModal(true)}
                        >
                            Thêm mới
                        </Button>
                    );
                }}
            />
            <ModalSkill
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    )
}

export default SkillPage;