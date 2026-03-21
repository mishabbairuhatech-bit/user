import useAuth from './useAuth';

export default function usePermission() {
  const { permissions, hasPermission, hasAnyPermission } = useAuth();

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    isSuperAdmin: permissions.includes('*'),
  };
}
