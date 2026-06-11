import type { AccountType } from "@/types/user";

export const roleHomePath: Record<AccountType, string> = {
  khach_hang: "/khach-hang",
  nhan_vien: "/nhan-vien",
  quan_ly: "/quan-ly",
};

export const getHomePathByRole = (role: AccountType) => roleHomePath[role] || "/signin";

const customerPaths = ["/", "/san-pham", "/gio-hang", "/khach-hang"];

export const isCustomerPath = (path: string) =>
  customerPaths.some((customerPath) => {
    const pathname = path.split(/[?#]/)[0];
    return pathname === customerPath || (customerPath !== "/" && pathname.startsWith(`${customerPath}/`));
  });
