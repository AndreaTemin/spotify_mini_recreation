import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { token } = useAuth();

  // If user is authenticated, render the child route (using <Outlet />)
  // Otherwise, redirect to the /login page
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;