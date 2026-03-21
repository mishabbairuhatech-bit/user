import usePermission from '../hooks/usePermission';

const PermissionGate = ({ permission, permissions, requireAll = true, fallback = null, children }) => {
  const { hasPermission, hasAnyPermission } = usePermission();

  // Single permission check
  if (permission) {
    return hasPermission(permission) ? children : fallback;
  }

  // Multiple permissions check
  if (permissions) {
    const hasAccess = requireAll
      ? permissions.every((p) => hasPermission(p))
      : hasAnyPermission(...permissions);
    return hasAccess ? children : fallback;
  }

  return children;
};

export default PermissionGate;
