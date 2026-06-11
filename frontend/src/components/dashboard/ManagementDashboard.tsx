import { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { viewLabels } from "@/config/managementConfig";
import { useManagementData } from "@/hooks/useManagementData";
import type { ManagementRole, ViewKey } from "@/types/management";
import FormModal from "./management/FormModal";
import ManagementShell from "./management/ManagementShell";
import ManagementViewRenderer from "./management/ManagementViewRenderer";
import { useManagementForms } from "./management/useManagementForms";

const ManagementDashboard = ({ role }: { role: ManagementRole }) => {
  const user = useAuthStore((state) => state.user);
  const [activeView, setActiveView] = useState<ViewKey>("dashboard");

  const {
    categories,
    categoryFilter,
    customers,
    employees,
    loading,
    orders,
    productStats,
    products,
    promotions,
    query,
    removeLocalRecord,
    reloadActiveView,
    revenueStats,
    setCategoryFilter,
    setQuery,
  } = useManagementData(activeView);

  const { handlers, modal, productDashboardProps, setModal } = useManagementForms({
    categories,
    categoryFilter,
    customers,
    products,
    promotions,
    query,
    removeLocalRecord,
    reloadActiveView,
    setCategoryFilter,
    setQuery,
  });

  const activeTitle =
    activeView === "products"
      ? "Danh sách sản phẩm"
      : activeView === "reports"
        ? "Báo cáo và thống kê"
        : viewLabels[activeView];

  return (
    <ManagementShell
      activeTitle={activeTitle}
      activeView={activeView}
      loading={loading}
      role={role}
      setActiveView={setActiveView}
      userEmail={user?.email}
    >
      <ManagementViewRenderer
        activeView={activeView}
        categories={categories}
        customers={customers}
        employees={employees}
        handlers={handlers}
        orders={orders}
        productDashboardProps={productDashboardProps}
        products={products}
        productStats={productStats}
        promotions={promotions}
        query={query}
        revenueStats={revenueStats}
        setQuery={setQuery}
      />
      {modal ? <FormModal modal={modal} onClose={() => setModal(null)} /> : null}
    </ManagementShell>
  );
};

export default ManagementDashboard;
