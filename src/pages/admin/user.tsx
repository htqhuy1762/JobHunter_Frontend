import DataTable from "@/components/client/data-table";
import { IUser } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import queryString from 'query-string';
import ModalUser from "@/components/admin/user/modal.user";
import ViewDetailUser from "@/components/admin/user/view.user";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfLike } from "spring-filter-query-builder";
import { useUsers, useDeleteUser } from "@/hooks/useUserQuery";

// Helper function để build query string - di chuyển ra ngoài component!
const buildQuery = (params: any, sort: any, filter: any) => {
    const q: any = {
        page: params.current,
        size: params.pageSize,
        filter: ""
    }

    const clone = { ...params };
    if (clone.name) q.filter = `${sfLike("name", clone.name)}`;
    if (clone.email) {
        q.filter = clone.name ?
            q.filter + " and " + `${sfLike("email", clone.email)}`
            : `${sfLike("email", clone.email)}`;
    }

    if (!q.filter) delete q.filter;
    let temp = queryString.stringify(q);

    let sortBy = "";
    if (sort && sort.name) {
        sortBy = sort.name === 'ascend' ? "sort=name,asc" : "sort=name,desc";
    }
    if (sort && sort.email) {
        sortBy = sort.email === 'ascend' ? "sort=email,asc" : "sort=email,desc";
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

const UserPage = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IUser | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [queryParams, setQueryParams] = useState({ current: 1, pageSize: 10 });
    const [sortParams, setSortParams] = useState({});
    const [filterParams, setFilterParams] = useState({});

    const tableRef = useRef<ActionType>();

    // TanStack Query - thay thế Redux!
    const query = buildQuery(queryParams, sortParams, filterParams);
    const { data, isLoading, refetch } = useUsers(query);
    const deleteUserMutation = useDeleteUser();

    // Extract data từ response
    const users = data?.result || [];
    const meta = data?.meta || { page: 1, pageSize: 10, total: 0 };

    const handleDeleteUser = async (id: string | undefined) => {
        if (id) {
            await deleteUserMutation.mutateAsync(id);
        }
    }

    const reloadTable = () => {
        refetch(); // TanStack Query refetch - đơn giản hơn nhiều!
    }

    const columns: ProColumns<IUser>[] = [
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
            title: 'Email',
            dataIndex: 'email',
            sorter: true,
        },

        {
            title: 'Role',
            dataIndex: ["role", "name"],
            sorter: true,
            hideInSearch: true
        },

        {
            title: 'Company',
            dataIndex: ["company", "name"],
            sorter: true,
            hideInSearch: true
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
                        permission={ALL_PERMISSIONS.USERS.UPDATE}
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
                        permission={ALL_PERMISSIONS.USERS.DELETE}
                        hideChildren
                    >
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa user"}
                            description={"Bạn có chắc chắn muốn xóa user này ?"}
                            onConfirm={() => handleDeleteUser(entity.id)}
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
                permission={ALL_PERMISSIONS.USERS.GET_PAGINATE}
            >
                <DataTable<IUser>
                    actionRef={tableRef}
                    headerTitle="Danh sách Users"
                    rowKey="id"
                    loading={isLoading}
                    columns={columns}
                    dataSource={users}
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
            </Access>
            <ModalUser
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
            <ViewDetailUser
                onClose={setOpenViewDetail}
                open={openViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div >
    )
}

export default UserPage;