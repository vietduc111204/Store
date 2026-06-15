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
import { PaymentSuccessView } from "@/features/views/PaymentSuccessView";
import { ProductDetailView } from "@/features/views/ProductDetailView";
import { ProductListView } from "@/features/views/ProductListView";
import type { CartItem, Product } from "@/types/customer";
import { readCart, writeCart } from "@/features/utils";

const CustomerPage = () => {
  const location = useLocation();
  const { categories, loading, products, promotions } = useStorefrontData(location.key);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => setCart(readCart()), [location.pathname]);
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!products.length) return;
    const productById = new Map(products.map((product) => [product.maSanPham, product]));
    const items = readCart();
    const next = items.map((item) => {
      const product = productById.get(item.product.maSanPham) || item.product;
      const stock = Math.max(0, Number(product.soLuong) || 0);
      return { ...item, product, quantity: Math.min(item.quantity, Math.max(1, stock)) };
    });

    if (JSON.stringify(next) !== JSON.stringify(items)) syncCart(next);
  }, [products]);

  useEffect(() => {
    sessionStorage.setItem("customer:lastPath", `${location.pathname}${location.search}${location.hash}`);
  }, [location.hash, location.pathname, location.search]);

  const syncCart = (items: CartItem[]) => {
    setCart(items);
    writeCart(items);
  };

  const productStock = (product: Product) => Math.max(0, Number(product.soLuong) || 0);

  const addToCart = (product: Product, quantity = 1) => {
    const stock = productStock(product);
    if (stock <= 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    const items = readCart();
    const existing = items.find((item) => item.product.maSanPham === product.maSanPham);
    const requestedQuantity = Math.max(1, quantity);
    const currentQuantity = existing?.quantity || 0;
    const nextQuantity = Math.min(stock, currentQuantity + requestedQuantity);

    if (nextQuantity === currentQuantity) {
      toast.error(`Sản phẩm chỉ còn ${stock} trong kho`);
      return;
    }

    const next = existing
      ? items.map((item) => item.product.maSanPham === product.maSanPham ? { ...item, product, quantity: nextQuantity } : item)
      : [...items, { product, quantity: nextQuantity }];
    syncCart(next);
    toast.success(nextQuantity < currentQuantity + requestedQuantity ? `Đã thêm tối đa ${stock} sản phẩm trong kho` : "Đã thêm vào giỏ hàng");
  };

  const updateQuantity = (id: number, quantity: number) => {
    const next = cart.map((item) => {
      if (item.product.maSanPham !== id) return item;
      const stock = productStock(item.product);
      const nextQuantity = Math.min(Math.max(1, quantity), Math.max(1, stock));
      if (quantity > stock) toast.error(`Sản phẩm chỉ còn ${stock} trong kho`);
      return { ...item, quantity: nextQuantity };
    });
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
  if (location.pathname === "/thanh-cong") content = <PaymentSuccessView />;

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
