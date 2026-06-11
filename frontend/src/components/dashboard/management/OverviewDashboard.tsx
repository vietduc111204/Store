import { Boxes, ClipboardList, FolderTree, Users } from "lucide-react";
import ProductDashboard from "./ProductDashboard";
import type { Category, Customer, Order, Product } from "@/types/management";

const OverviewDashboard = ({
  products,
  categories,
  customers,
  orders,
  productDashboard,
}: {
  products: Product[];
  categories: Category[];
  customers: Customer[];
  orders: Order[];
  productDashboard: React.ComponentProps<typeof ProductDashboard>;
}) => {
  const stats = [
    { label: "Sản phẩm", value: products.length, icon: Boxes },
    { label: "Danh mục", value: categories.length, icon: FolderTree },
    { label: "Khách hàng", value: customers.length, icon: Users },
    { label: "Đơn hàng", value: orders.length, icon: ClipboardList },
  ];

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={item.label}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">{item.label}</span>
                <span className="flex size-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                  <Icon size={19} />
                </span>
              </div>
              <strong className="mt-4 block text-3xl text-slate-950">{item.value}</strong>
            </article>
          );
        })}
      </section>
      <ProductDashboard {...productDashboard} />
    </div>
  );
};

export default OverviewDashboard;
