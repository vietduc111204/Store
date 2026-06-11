import { ShoppingCart } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { toast } from "sonner";
import { StoreFooter } from "@/features/components/StoreFooter";
import { StoreHeader } from "@/features/components/StoreHeader";
import { useStorefrontData } from "@/features/useStorefrontData";
import { CartView } from "@/features/views/CartView";
import { CustomerAccountView } from "@/features/views/CustomerAccountView";
import { HomeView } from "@/features/views/HomeView";
import { ProductDetailView } from "@/features/views/ProductDetailView";
import { ProductListView } from "@/features/views/ProductListView";
import type { CartItem, Product } from "@/types/customer";
import { readCart, writeCart } from "@/features/utils";

const CustomerPage = () => {
  const { categories, loading, products, promotions } = useStorefrontData();
  const location = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => setCart(readCart()), [location.pathname]);
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  useEffect(() => {
    sessionStorage.setItem("customer:lastPath", `${location.pathname}${location.search}${location.hash}`);
  }, [location.hash, location.pathname, location.search]);

  const syncCart = (items: CartItem[]) => {
    setCart(items);
    writeCart(items);
  };

  const addToCart = (product: Product, quantity = 1) => {
    const items = readCart();
    const existing = items.find((item) => item.product.maSanPham === product.maSanPham);
    const next = existing
      ? items.map((item) => item.product.maSanPham === product.maSanPham ? { ...item, product, quantity: item.quantity + quantity } : item)
      : [...items, { product, quantity }];
    syncCart(next);
    toast.success("Đã thêm vào giỏ hàng");
  };

  const updateQuantity = (id: number, quantity: number) => {
    const next = cart.map((item) => item.product.maSanPham === id ? { ...item, quantity: Math.max(1, quantity) } : item);
    syncCart(next);
  };

  const removeItem = (id: number) => syncCart(cart.filter((item) => item.product.maSanPham !== id));
  const clearCart = () => syncCart([]);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  let content: ReactNode = <HomeView categories={categories} onAdd={addToCart} products={products} />;
  if (location.pathname === "/san-pham") content = <ProductListView categories={categories} onAdd={addToCart} products={products} />;
  if (location.pathname.startsWith("/san-pham/")) content = <ProductDetailView onAdd={addToCart} products={products} />;
  if (location.pathname === "/gio-hang") content = <CartView cart={cart} onClear={clearCart} onQuantity={updateQuantity} onRemove={removeItem} promotions={promotions} />;
  if (location.pathname === "/khach-hang") content = <CustomerAccountView />;

  return (
    <div className="min-h-screen bg-[#f8f9ff] font-sans text-slate-900">
      <StoreHeader cartCount={cartCount} />
      {loading ? <div className="flex min-h-[420px] items-center justify-center font-bold text-slate-500">Đang tải cửa hàng...</div> : content}
      <StoreFooter />
      <Link className="fixed bottom-5 right-5 rounded-full bg-[#0879a8] p-4 text-white shadow-lg sm:hidden" to="/gio-hang"><ShoppingCart /></Link>
    </div>
  );
};

export default CustomerPage;
