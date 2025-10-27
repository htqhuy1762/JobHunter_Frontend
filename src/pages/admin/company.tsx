import ModalCompany from "@/components/admin/company/modal.company";
import DataTable from "@/components/client/data-table";
import { ICompany } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import queryString from 'query-string';
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfLike } from "spring-filter-query-builder";
import { useCompanies, useDeleteCompany } from "@/hooks/useCompanyQuery";

// Helper function
const buildQuery = (params: any, sort: any, filter: any) => {
    const clone = { ...params };
    const q: any = {
        page: params.current,
        size: params.pageSize,
        filter: ""
    }

    if (clone.name) q.filter = `${sfLike("name", clone.name)}`;
    if (clone.address) {
        q.filter = clone.name ?
            q.filter + " and " + `${sfLike("address", clone.address)}`
            : `${sfLike("address", clone.address)}`;
    }

    if (!q.filter) delete q.filter;

    let temp = queryString.stringify(q);

    let sortBy = "";
    if (sort && sort.name) {
        sortBy = sort.name === 'ascend' ? "sort=name,asc" : "sort=name,desc";
    }
    if (sort && sort.address) {
        sortBy = sort.address === 'ascend' ? "sort=address,asc" : "sort=address,desc";
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

const CompanyPage = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<ICompany | null>(null);
    const [queryParams, setQueryParams] = useState({ current: 1, pageSize: 10 });
    const [sortParams, setSortParams] = useState({});
    const [filterParams, setFilterParams] = useState({});

    const tableRef = useRef<ActionType>();

    // TanStack Query
    const query = buildQuery(queryParams, sortParams, filterParams);
    const { data, isLoading, refetch } = useCompanies(query);
    const deleteCompanyMutation = useDeleteCompany();

    // Extract data
    const companies = data?.result || [];
    const meta = data?.meta || { page: 1, pageSize: 10, total: 0 };

    const handleDeleteCompany = async (id: string | undefined) => {
        if (id) {
            await deleteCompanyMutation.mutateAsync(id);
        }
    }

    const reloadTable = () => {
        refetch();
    }

    const columns: ProColumns<ICompany>[] = [
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
            title: 'Address',
            dataIndex: 'address',
            sorter: true,
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
                        permission={ALL_PERMISSIONS.COMPANIES.UPDATE}
                        hideChildren
                    >
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
                    </Access >
                    <Access
                        permission={ALL_PERMISSIONS.COMPANIES.DELETE}
                        hideChildren
                    >
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa company"}
                            description={"Bạn có chắc chắn muốn xóa company này ?"}
                            onConfirm={() => handleDeleteCompany(entity.id)}
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
                permission={ALL_PERMISSIONS.COMPANIES.GET_PAGINATE}
            >
                <DataTable<ICompany>
                    actionRef={tableRef}
                    headerTitle="Danh sách Công Ty"
                    rowKey="id"
                    loading={isLoading}
                    columns={columns}
                    dataSource={companies}
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
                            <Access
                                permission={ALL_PERMISSIONS.COMPANIES.CREATE}
                                hideChildren
                            >
                                <Button
                                    icon={<PlusOutlined />}
                                    type="primary"
                                    onClick={() => setOpenModal(true)}
                                >
                                    Thêm mới
                                </Button>
                            </Access>
                        );
                    }}
                />
            </Access>
            <ModalCompany
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div >
    )
}

export default CompanyPage;