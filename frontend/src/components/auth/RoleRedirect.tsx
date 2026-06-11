import { Navigate } from "react-router";
import { getHomePathByRole } from "@/libs/authRoutes";
import { useAuthStore } from "@/stores/useAuthStore";

const RoleRedirect = () => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <Navigate to={getHomePathByRole(user.loaiTaiKhoan)} replace />;
};

export default RoleRedirect;
