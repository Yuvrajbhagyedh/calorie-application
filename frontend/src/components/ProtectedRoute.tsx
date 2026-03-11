import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactElement;
  role?: Role;
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { user, hydrated, initialize } = useAuthStore();

  if (!hydrated) {
    initialize();
    return null;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

