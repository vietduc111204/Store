import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/stores/useAuthStore";

const LogOutPage = () => {
  const navigate = useNavigate();
  const signOut = useAuthStore((state) => state.signOut);

  useEffect(() => {
    const logout = async () => {
      await signOut();
      navigate("/signin", { replace: true });
    };

    logout();
  }, [navigate, signOut]);

  return (
    <div className="flex min-h-svh items-center justify-center">
      Đang đăng xuất...
    </div>
  );
};

export default LogOutPage;
