import { useAuthStore } from "@/stores/useAuthStore";
import type { AccountType } from "@/types/user";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { getHomePathByRole } from "@/libs/authRoutes";

type ProtectedRouteProps = {
  allowedRoles?: AccountType[];
};

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const { accessToken, user, loading, refresh, fetchMe } = useAuthStore();
  const [starting, setStarting] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        if (!accessToken) {
          await refresh();
        } else if (!user) {
          await fetchMe();
        }
        setAllowed(true);
      } catch {
        setAllowed(false);
      } finally {
        setStarting(false);
      }
    };

    init();
  }, []);

  const currentUser = useAuthStore.getState().user;

  if (starting || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Đang tải trang...
      </div>
    );
  }

  if (!allowed || !currentUser) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.loaiTaiKhoan)) {
    return <Navigate to={getHomePathByRole(currentUser.loaiTaiKhoan)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
