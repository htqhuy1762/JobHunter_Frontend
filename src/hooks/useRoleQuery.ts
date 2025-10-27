import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callCreateRole, callDeleteRole, callFetchRole, callFetchRoleById, callUpdateRole } from '@/config/api';
import { IRole } from '@/types/backend';
import { message, notification } from 'antd';

// Query keys factory
export const roleKeys = {
    all: ['roles'] as const,
    lists: () => [...roleKeys.all, 'list'] as const,
    list: (query: string) => [...roleKeys.lists(), query] as const,
    details: () => [...roleKeys.all, 'detail'] as const,
    detail: (id: string) => [...roleKeys.details(), id] as const,
};

// Fetch roles with pagination and filters
export const useRoles = (query: string) => {
    return useQuery({
        queryKey: roleKeys.list(query),
        queryFn: async () => {
            const res = await callFetchRole(query);
            return res.data; // Return data directly
        },
    });
};

// Fetch single role by ID
export const useRole = (id: string) => {
    return useQuery({
        queryKey: roleKeys.detail(id),
        queryFn: () => callFetchRoleById(id),
        enabled: !!id,
    });
};

// Create role mutation
export const useCreateRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (role: IRole) => callCreateRole(role),
        onSuccess: () => {
            message.success('Tạo mới Role thành công');
            // Invalidate all role lists to refetch
            queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
        },
        onError: (error: any) => {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể tạo role',
            });
        },
    });
};

// Update role mutation
export const useUpdateRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ role, id }: { role: IRole; id: string }) =>
            callUpdateRole(role, id),
        onSuccess: () => {
            message.success('Cập nhật Role thành công');
            // Invalidate all role queries
            queryClient.invalidateQueries({ queryKey: roleKeys.all });
        },
        onError: (error: any) => {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể cập nhật role',
            });
        },
    });
};

// Delete role mutation
export const useDeleteRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => callDeleteRole(id),
        onSuccess: () => {
            message.success('Xóa Role thành công');
            // Invalidate all role lists
            queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
        },
        onError: (error: any) => {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể xóa role',
            });
        },
    });
};
