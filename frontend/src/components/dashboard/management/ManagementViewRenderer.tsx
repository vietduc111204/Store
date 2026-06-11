import type {
  Category,
  Customer,
  Employee,
  Order,
  Product,
  ProductStats,
  RevenueStats,
  ViewKey,
} from "@/types/management";
import CategoryDashboard from "./CategoryDashboard";
import CustomerDashboard from "./CustomerDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import OrderDashboard from "./OrderDashboard";
import OverviewDashboard from "./OverviewDashboard";
import ProductDashboard from "./ProductDashboard";
import PromotionDashboard from "./PromotionDashboard";
import ReportDashboard from "./ReportDashboard";
import type { Promotion } from "@/types/management";

type ProductDashboardProps = React.ComponentProps<typeof ProductDashboard>;

type Props = {
  activeView: ViewKey;
  categories: Category[];
  customers: Customer[];
  employees: Employee[];
  orders: Order[];
  productDashboardProps: ProductDashboardProps;
  products: Product[];
  productStats: ProductStats;
  promotions: Promotion[];
  query: string;
  revenueStats: RevenueStats;
  setQuery: (query: string) => void;
  handlers: {
    cancelOrder: (order: Order) => void;
    openCategoryForm: (category?: Category) => void;
    openCustomerForm: (customer?: Customer) => void;
    openEmployeeForm: (employee?: Employee) => void;
    openOrderForm: (order?: Order) => void;
    openPromotionForm: (promotion?: Promotion) => void;
    removeCategory: (category: Category) => void;
    removeCustomer: (customer: Customer) => void;
    removeEmployee: (employee: Employee) => void;
    removePromotion: (promotion: Promotion) => void;
    updateOrderStatus: (order: Order, status: string) => void;
  };
};

const ManagementViewRenderer = ({
  activeView,
  categories,
  customers,
  employees,
  handlers,
  orders,
  productDashboardProps,
  products,
  productStats,
  promotions,
  query,
  revenueStats,
  setQuery,
}: Props) => (
  <>
    {activeView === "dashboard" ? (
      <OverviewDashboard
        categories={categories}
        customers={customers}
        orders={orders}
        productDashboard={productDashboardProps}
        products={products}
      />
    ) : null}

    {activeView === "categories" ? (
      <CategoryDashboard
        categories={categories}
        onCreate={() => handlers.openCategoryForm()}
        onDelete={handlers.removeCategory}
        onEdit={handlers.openCategoryForm}
        onQueryChange={setQuery}
        query={query}
      />
    ) : null}

    {activeView === "products" ? <ProductDashboard {...productDashboardProps} /> : null}

    {activeView === "customers" ? (
      <CustomerDashboard
        customers={customers}
        onCreate={() => handlers.openCustomerForm()}
        onDelete={handlers.removeCustomer}
        onEdit={handlers.openCustomerForm}
        onQueryChange={setQuery}
        query={query}
      />
    ) : null}

    {activeView === "employees" ? (
      <EmployeeDashboard
        employees={employees}
        onCreate={() => handlers.openEmployeeForm()}
        onDelete={handlers.removeEmployee}
        onEdit={handlers.openEmployeeForm}
        onQueryChange={setQuery}
        query={query}
      />
    ) : null}

    {activeView === "orders" ? (
      <OrderDashboard
        onCancel={handlers.cancelOrder}
        onCreate={() => handlers.openOrderForm()}
        onEdit={handlers.openOrderForm}
        onQueryChange={setQuery}
        onStatusChange={handlers.updateOrderStatus}
        orders={orders}
        query={query}
      />
    ) : null}

    {activeView === "promotions" ? (
      <PromotionDashboard
        onCreate={() => handlers.openPromotionForm()}
        onDelete={handlers.removePromotion}
        onEdit={handlers.openPromotionForm}
        onQueryChange={setQuery}
        promotions={promotions}
        query={query}
      />
    ) : null}

    {activeView === "reports" ? (
      <ReportDashboard productStats={productStats} revenueStats={revenueStats} />
    ) : null}
  </>
);

export default ManagementViewRenderer;
