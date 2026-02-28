import { Navigate } from 'react-router-dom';
import { useAuth } from '@hooks';
import { Spinner } from '@components/ui';

const RootRedirect = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? '/admin/dashboard' : '/login'} replace />;
};

export default RootRedirect;
