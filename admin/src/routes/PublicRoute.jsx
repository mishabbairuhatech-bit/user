import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks';
import { Spinner } from '@components/ui';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect to the page they were trying to access or dashboard
    const from = location.state?.from?.pathname || '/admin/dashboard';
    return <Navigate to={from} replace />;
  }

  return children;
};

export default PublicRoute;
