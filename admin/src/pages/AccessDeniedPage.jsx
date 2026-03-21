import { ShieldX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccessDeniedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <ShieldX size={64} className="text-red-400 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Access Denied
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
        You don't have permission to access this page. Contact your administrator if you believe this is an error.
      </p>
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors text-sm font-medium"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default AccessDeniedPage;
