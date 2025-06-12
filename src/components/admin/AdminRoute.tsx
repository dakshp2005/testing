import { Navigate } from "react-router-dom";
import { useAdmin } from "../../hooks/useAdmin";
import LoadingSpinner from "../ui/LoadingSpinner";

interface AdminRouteProps {
  children: React.ReactNode;
}

function AdminRoute({ children }: AdminRouteProps) {
  const { isAdmin, isLoading } = useAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/learn\" replace />;
  }

  return <>{children}</>;
}

export default AdminRoute;
