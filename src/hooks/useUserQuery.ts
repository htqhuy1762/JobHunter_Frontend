import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callCreateUser, callDeleteUser, callFetchUser, callUpdateUser } from '@/config/api';
import { IUser } from '@/types/backend';
import { message, notification } from 'antd';

// Query key factory - để quản lý cache dễ dàng
export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    list: (query: string) => [...userKeys.lists(), query] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
};

/**
 * Hook để fetch danh sách users với pagination
 */
export const useUsers = (query: string) => {
    return useQuery({
        queryKey: userKeys.list(query),
        queryFn: async () => {
            const res = await callFetchUser(query);
            return res.data;
        },
        staleTime: 5 * 60 * 1000, // 5 phút
    });
};

/**
 * Hook để create user
 */
export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (user: IUser) => callCreateUser(user),
        onSuccess: () => {
            // Invalidate và refetch danh sách users
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            message.success('Tạo mới User thành công');
        },
        onError: (error: any) => {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể tạo user'
            });
        }
    });
};

/**
 * Hook để update user
 */
export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (user: IUser) => callUpdateUser(user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            message.success('Cập nhật User thành công');
        },
        onError: (error: any) => {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể cập nhật user'
            });
        }
    });
};

/**
 * Hook để delete user
 */
export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => callDeleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            message.success('Xóa User thành công');
        },
        onError: (error: any) => {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể xóa user'
            });
        }
    });
};
