import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    callCreateCompany,
    callDeleteCompany,
    callFetchCompany,
    callFetchCompanyById,
    callUpdateCompany
} from '@/config/api';
import { ICompany } from '@/types/backend';
import { message, notification } from 'antd';

export const companyKeys = {
    all: ['companies'] as const,
    lists: () => [...companyKeys.all, 'list'] as const,
    list: (query: string) => [...companyKeys.lists(), query] as const,
    details: () => [...companyKeys.all, 'detail'] as const,
    detail: (id: string) => [...companyKeys.details(), id] as const,
};

/**
 * Hook để fetch danh sách companies
 */
export const useCompanies = (query: string) => {
    return useQuery({
        queryKey: companyKeys.list(query),
        queryFn: async () => {
            const res = await callFetchCompany(query);
            return res.data;
        },
    });
};

/**
 * Hook để fetch company by ID
 */
export const useCompany = (id: string) => {
    return useQuery({
        queryKey: companyKeys.detail(id),
        queryFn: async () => {
            const res = await callFetchCompanyById(id);
            return res.data;
        },
        enabled: !!id, // Chỉ fetch khi có id
    });
};

/**
 * Hook để create company
 */
export const useCreateCompany = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ name, address, description, logo }: {
            name: string;
            address: string;
            description: string;
            logo: string
        }) => callCreateCompany(name, address, description, logo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
            message.success('Tạo mới Company thành công');
        },
        onError: (error: any) => {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể tạo company'
            });
        }
    });
};

/**
 * Hook để update company
 */
export const useUpdateCompany = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, name, address, description, logo }: {
            id: string;
            name: string;
            address: string;
            description: string;
            logo: string
        }) => callUpdateCompany(id, name, address, description, logo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
            message.success('Cập nhật Company thành công');
        },
        onError: (error: any) => {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể cập nhật company'
            });
        }
    });
};

/**
 * Hook để delete company
 */
export const useDeleteCompany = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => callDeleteCompany(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
            message.success('Xóa Company thành công');
        },
        onError: (error: any) => {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể xóa company'
            });
        }
    });
};
