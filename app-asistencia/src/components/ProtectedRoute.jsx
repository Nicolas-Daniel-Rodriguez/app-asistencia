import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, userRole, loading } = useAuth();

  console.log('ProtectedRoute:', { user: user?.email, userRole, loading, allowedRoles });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>;
  }

  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.log('User role not allowed, redirecting');
    return <Navigate to={userRole === 'admin' ? '/admin-dashboard' : '/employee-dashboard'} />;
  }

  console.log('Access granted to route');
  return children;
}