import DataTable from "@/components/client/data-table";
import { IPermission } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import queryString from 'query-string';
import ViewDetailPermission from "@/components/admin/permission/view.permission";
import ModalPermission from "@/components/admin/permission/modal.permission";
import { colorMethod } from "@/config/utils";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { usePermissions, useDeletePermission } from "@/hooks/usePermissionQuery";

// Helper function
const buildQuery = (params: any, sort: any, filter: any) => {
    const clone = { ...params };

    let parts = [];
    if (clone.name) parts.push(`name ~ '${clone.name}'`);
    if (clone.apiPath) parts.push(`apiPath ~ '${clone.apiPath}'`);
    if (clone.method) parts.push(`method ~ '${clone.method}'`);
    if (clone.module) parts.push(`module ~ '${clone.module}'`);

    clone.filter = parts.join(' and ');
    if (!clone.filter) delete clone.filter;

    clone.page = clone.current;
    clone.size = clone.pageSize;

    delete clone.current;
    delete clone.pageSize;
    delete clone.name;
    delete clone.apiPath;
    delete clone.method;
    delete clone.module;

    let temp = queryString.stringify(clone);

    let sortBy = "";
    const fields = ["name", "apiPath", "method", "module", "createdAt", "updatedAt"];

    if (sort) {
        for (const field of fields) {
            if (sort[field]) {
                sortBy = `sort=${field},${sort[field] === 'ascend' ? 'asc' : 'desc'}`;
                break;
            }
        }
    }

    //mặc định sort theo updatedAt
    if (Object.keys(sortBy).length === 0) {
        temp = `${temp}&sort=updatedAt,desc`;
    } else {
        temp = `${temp}&${sortBy}`;
    }

    return temp;
}

const PermissionPage = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IPermission | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [queryParams, setQueryParams] = useState({ current: 1, pageSize: 10 });
    const [sortParams, setSortParams] = useState({});
    const [filterParams, setFilterParams] = useState({});

    const tableRef = useRef<ActionType>();

    // TanStack Query
    const query = buildQuery(queryParams, sortParams, filterParams);
    const { data, isLoading, refetch } = usePermissions(query);
    const deletePermissionMutation = useDeletePermission();

    // Extract data
    const permissions = data?.result || [];
    const meta = data?.meta || { page: 1, pageSize: 10, total: 0 };

    const handleDeletePermission = async (id: string | undefined) => {
        if (id) {
            await deletePermissionMutation.mutateAsync(id);
        }
    }

    const reloadTable = () => {
        refetch();
    }

    const columns: ProColumns<IPermission>[] = [
        {
            title: 'Id',
            dataIndex: 'id',
            width: 50,
            render: (text, record, index, action) => {
                return (
                    <a href="#" onClick={() => {
                        setOpenViewDetail(true);
                        setDataInit(record);
                    }}>
                        {record.id}
                    </a>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'API',
            dataIndex: 'apiPath',
            sorter: true,
        },
        {
            title: 'Method',
            dataIndex: 'method',
            sorter: true,
            render(dom, entity, index, action, schema) {
                return (
                    <p style={{ paddingLeft: 10, fontWeight: 'bold', marginBottom: 0, color: colorMethod(entity?.method as string) }}>{entity?.method || ''}</p>
                )
            },
        },
        {
            title: 'Module',
            dataIndex: 'module',
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
                    <Access
                        permission={ALL_PERMISSIONS.PERMISSIONS.UPDATE}
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
                    </Access>
                    <Access
                        permission={ALL_PERMISSIONS.PERMISSIONS.DELETE}
                        hideChildren
                    >
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa permission"}
                            description={"Bạn có chắc chắn muốn xóa permission này ?"}
                            onConfirm={() => handleDeletePermission(entity.id)}
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
                </Space>
            ),

        },
    ];

    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE}
            >
                <DataTable<IPermission>
                    actionRef={tableRef}
                    headerTitle="Danh sách Permissions (Quyền Hạn)"
                    rowKey="id"
                    loading={isLoading}
                    columns={columns}
                    dataSource={permissions}
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
            <ModalPermission
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />

            <ViewDetailPermission
                onClose={setOpenViewDetail}
                open={openViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    )
}

export default PermissionPage;