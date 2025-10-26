import { useEffect, useState } from 'react';
import { Result } from "antd";
import { useAppSelector } from '@/redux/hooks';
import { hasAdminAccess } from '@/config/utils';

interface IProps {
    hideChildren?: boolean;
    children: React.ReactNode;
    permission: { method: string, apiPath: string, module: string };
}

const Access = (props: IProps) => {
    const { permission, hideChildren = false } = props;
    
    // ✅ FIX: Default FALSE (deny by default - more secure)
    const [allow, setAllow] = useState<boolean>(false);

    const permissions = useAppSelector(state => state.account.user.role.permissions);
    const userRole = useAppSelector(state => state.account.user.role.name);

    useEffect(() => {
        // ✅ FIX: Admin có full quyền, bypass permission check
        if (hasAdminAccess(userRole)) {
            setAllow(true);
            return;
        }
        
        // ✅ FIX: Kiểm tra permissions array (dù empty hay không)
        if (!permissions || permissions.length === 0) {
            setAllow(false);
            return;
        }

        // ✅ FIX: Flexible permission matching
        const check = permissions.find(item => {
            // Case-insensitive comparison
            const methodMatch = item.method?.toUpperCase() === permission.method?.toUpperCase();
            const moduleMatch = item.module?.toUpperCase() === permission.module?.toUpperCase();
            
            // Flexible API path matching để handle backend trả về khác format
            // Backend có thể trả: /api/v1/companies/** hoặc /api/v1/companies/{id}
            const normalizedItemPath = item.apiPath?.replace(/\/\*\*$/, '').replace(/\/\{[^}]+\}$/, '');
            const normalizedPermPath = permission.apiPath?.replace(/\/\*\*$/, '').replace(/\/\{[^}]+\}$/, '');
            
            const apiPathMatch = 
                item.apiPath === permission.apiPath  // Exact match
                || normalizedItemPath === normalizedPermPath;  // Normalized match

            return methodMatch && moduleMatch && apiPathMatch;
        });

        setAllow(!!check);
        
    }, [permissions, userRole, permission]);

    // Check ACL setting (có thể tắt ACL trong development)
    const aclDisabled = import.meta.env.VITE_ACL_ENABLE === 'false';

    return (
        <>
            {(allow || aclDisabled) ?
                <>{props.children}</>
                :
                <>
                    {hideChildren === false ?
                        <Result
                            status="403"
                            title="Truy cập bị từ chối"
                            subTitle="Xin lỗi, bạn không có quyền hạn (permission) truy cập thông tin này"
                        />
                        :
                        null
                    }
                </>
            }
        </>
    );
};

export default Access;