import {
  BadgePercent,
  BarChart3,
  FolderTree,
  Gauge,
  Package,
  ShoppingCart,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ManagementRole, ViewKey } from "@/types/management";

export const roleLabels: Record<ManagementRole, string> = {
  nhan_vien: "Nhân viên",
  quan_ly: "Quản lý",
};

export const viewLabels: Record<ViewKey, string> = {
  dashboard: "Bảng điều khiển",
  categories: "Quản lý danh mục",
  products: "Quản lý sản phẩm",
  customers: "Quản lý khách hàng",
  employees: "Quản lý nhân viên",
  orders: "Quản lý đơn hàng",
  promotions: "Quản lý khuyến mãi",
  reports: "Báo cáo và thống kê",
};

export type ManagementMenuItem = {
  key: ViewKey;
  label: string;
  icon: LucideIcon;
};

export const createManagementMenu = (role: ManagementRole): ManagementMenuItem[] => [
  { key: "dashboard", label: viewLabels.dashboard, icon: Gauge },
  { key: "categories", label: viewLabels.categories, icon: FolderTree },
  { key: "products", label: viewLabels.products, icon: Package },
  { key: "customers", label: viewLabels.customers, icon: Users },
  ...(role === "quan_ly" ? [{ key: "employees" as const, label: viewLabels.employees, icon: UserCog }] : []),
  { key: "orders", label: viewLabels.orders, icon: ShoppingCart },
  { key: "promotions", label: viewLabels.promotions, icon: BadgePercent },
  ...(role === "quan_ly" ? [{ key: "reports" as const, label: viewLabels.reports, icon: BarChart3 }] : []),
];
