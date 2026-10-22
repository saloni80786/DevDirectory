import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* Wraps private pages. Guests are sent to /login and the attempted location is kept in
   router state, so Login can send them back to the exact page afterwards. */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
