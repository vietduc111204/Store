import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/libs/axios";
import type {
  Category,
  Customer,
  Employee,
  Order,
  Product,
  ProductStats,
  Promotion,
  RevenueStats,
  ViewKey,
} from "@/types/management";

export const useManagementData = (activeView: ViewKey) => {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({});
  const [productStats, setProductStats] = useState<ProductStats>({});

  const loadCategories = async (q = "") => {
    const res = await api.get<Category[]>("/danh-muc/tim-kiem", { params: { q } });
    setCategories(res.data);
    return res.data;
  };

  const loadProducts = async (q = "") => {
    const res = await api.get<Product[]>("/san-pham/tim-kiem", { params: { q } });
    setProducts(res.data);
    return res.data;
  };

  const loadCustomers = async (q = "") => {
    const res = await api.get<Customer[]>("/tai-khoan/khach-hang/tim-kiem", { params: { q } });
    setCustomers(res.data);
    return res.data;
  };

  const loadEmployees = async (q = "") => {
    const res = await api.get<Employee[]>("/tai-khoan/nhan-vien/tim-kiem", { params: { q } });
    setEmployees(res.data);
    return res.data;
  };

  const loadOrders = async (q = "") => {
    const res = await api.get<Order[]>("/don-hang/tim-kiem", { params: { q } });
    setOrders(res.data);
    return res.data;
  };

  const loadPromotions = async (q = "") => {
    const res = await api.get<Promotion[]>("/khuyen-mai/tim-kiem", { params: { q } });
    setPromotions(res.data);
    return res.data;
  };

  const loadReports = async () => {
    const [revenueRes, productRes] = await Promise.all([
      api.get<RevenueStats>("/thong-ke/doanh-thu"),
      api.get<ProductStats>("/thong-ke/san-pham"),
    ]);
    setRevenueStats(revenueRes.data);
    setProductStats(productRes.data);
  };

  const reloadActiveView = async (q = query) => {
    setLoading(true);
    try {
      let resultCount: number | null = null;
      if (activeView === "dashboard") {
        await Promise.all([loadProducts(), loadCategories(), loadCustomers(), loadOrders()]);
      }
      if (activeView === "categories") resultCount = (await loadCategories(q)).length;
      if (activeView === "products") {
        const [productRows] = await Promise.all([loadProducts(q), loadCategories(), loadPromotions()]);
        resultCount = productRows.length;
      }
      if (activeView === "customers") resultCount = (await loadCustomers(q)).length;
      if (activeView === "employees") resultCount = (await loadEmployees(q)).length;
      if (activeView === "orders") {
        const [orderRows] = await Promise.all([loadOrders(q), loadProducts(), loadPromotions(), loadCustomers()]);
        resultCount = orderRows.length;
      }
      if (activeView === "promotions") {
        const [promotionRows] = await Promise.all([loadPromotions(q), loadProducts()]);
        resultCount = promotionRows.length;
      }
      if (activeView === "reports") await loadReports();
      if (q.trim() && resultCount === 0) toast.info("Không tìm thấy dữ liệu");
    } catch (error) {
      console.error(error);
      toast.error("Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const removeLocalRecord = (view: ViewKey, id: number) => {
    if (view === "categories") {
      setCategories((current) => current.filter((category) => category.maDanhMuc !== id));
    }
    if (view === "products") {
      setProducts((current) => current.filter((product) => product.maSanPham !== id));
    }
    if (view === "customers") {
      setCustomers((current) => current.filter((customer) => customer.maThanhVien !== id));
    }
    if (view === "employees") {
      setEmployees((current) => current.filter((employee) => employee.maNhanVien !== id));
    }
    if (view === "promotions") {
      setPromotions((current) => current.filter((promotion) => promotion.maKhuyenMai !== id));
    }
    if (view === "orders") {
      setOrders((current) => current.filter((order) => order.maDonHang !== id));
    }
  };

  useEffect(() => {
    setQuery("");
    void reloadActiveView("");
  }, [activeView]);

  useEffect(() => {
    if (activeView === "dashboard" || activeView === "reports") return;

    const timeoutId = window.setTimeout(() => {
      void reloadActiveView(query);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  return {
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
  };
};
