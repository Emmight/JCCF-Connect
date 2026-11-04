
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, type AdminRole } from "./AuthContext";

type ProtectedRouteProps = {
  allowedRoles?: AdminRole[];
};

export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8f6]">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#e1eee5] border-t-[#087443]" />
          <p className="mt-4 text-sm text-gray-500">
            Verifying your session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
