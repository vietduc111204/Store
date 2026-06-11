import { LogOut, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuthStore } from "@/stores/useAuthStore";

export const StoreHeader = ({ cartCount }: { cartCount: number }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(new URLSearchParams(location.search).get("q") || "");
  useEffect(() => {
    setSearch(new URLSearchParams(location.search).get("q") || "");
  }, [location.search]);
  const isActive = (path: string) => location.pathname === path || (path === "/san-pham" && location.pathname.startsWith("/san-pham"));
  const nav = [
    { label: "Trang chủ", path: "/" },
    { label: "Sản phẩm", path: "/san-pham" },
    {
      label: "Danh mục yêu thích",
      path: "/khach-hang",
      state: {
        accountSection: "notifications",
        authMessage: "Vui lòng đăng nhập để xem danh mục yêu thích của bạn.",
      },
    },
  ];
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = search.trim();
    navigate(query ? `/san-pham?q=${encodeURIComponent(query)}` : "/san-pham");
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-[#f8f9ff]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-5 px-4 sm:px-6">
        <Link className="shrink-0 text-2xl font-black text-[#075f83]" to="/">SmartHome</Link>
        <nav className="hidden items-center gap-7 whitespace-nowrap text-sm font-semibold text-slate-800 md:flex">
          {nav.map((item) => (
            <Link className={isActive(item.path) ? "border-b-2 border-[#0879a8] py-5 text-[#075f83]" : "py-5 hover:text-[#075f83]"} key={item.label} state={item.state} to={item.path}>
              {item.label}
            </Link>
          ))}
        </nav>
        <form className="ml-auto hidden min-w-[280px] items-center rounded-full bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-[#0879a8]/30 xl:min-w-[340px] lg:flex" onSubmit={submitSearch}>
          <Search size={17} />
          <input
            className="ml-3 min-w-0 flex-1 bg-transparent font-semibold outline-none placeholder:text-slate-400"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm sản phẩm..."
            value={search}
          />
        </form>
        <Link className="relative hidden shrink-0 items-center gap-2 whitespace-nowrap text-sm font-bold text-slate-800 sm:flex" to="/gio-hang">
          <ShoppingCart size={20} />
          <span>Giỏ hàng</span>
          {cartCount ? <span className="absolute -right-3 -top-3 rounded-full bg-[#0879a8] px-2 py-0.5 text-xs text-white">{cartCount}</span> : null}
        </Link>
        {user ? (
          <div className="hidden shrink-0 items-center gap-3 sm:flex">
            <Link className="flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-900" to="/khach-hang">
              <User size={18} />
              Tài khoản
            </Link>
            <button className="flex items-center gap-2 whitespace-nowrap rounded-full bg-[#075f83] px-4 py-2.5 text-sm font-bold text-white shadow-sm" onClick={() => void signOut()}>
              <LogOut size={18} />
              Đăng xuất
            </button>
          </div>
        ) : (
          <Link className="hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-900 sm:flex" state={{ from: location }} to="/signin">
            <User size={18} />
            Tài khoản
          </Link>
        )}
        <button className="ml-auto rounded-lg border border-slate-200 p-2 md:hidden" onClick={() => setOpen((value) => !value)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <form className="mb-3 flex items-center rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200" onSubmit={submitSearch}>
            <Search size={18} />
            <input
              className="ml-2 min-w-0 flex-1 bg-transparent font-semibold outline-none"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm sản phẩm..."
              value={search}
            />
          </form>
          {nav.map((item) => <Link className="block rounded-lg px-3 py-3 font-semibold" key={item.label} state={item.state} to={item.path}>{item.label}</Link>)}
          <Link className="mt-2 flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-3 font-bold text-[#075f83]" to="/gio-hang"><ShoppingCart size={19} /> Giỏ hàng ({cartCount})</Link>
          {user ? (
            <Link className="mt-2 flex items-center gap-2 rounded-lg px-3 py-3 font-bold text-slate-800" to="/khach-hang"><User size={19} /> Tài khoản</Link>
          ) : (
            <Link className="mt-2 flex items-center gap-2 rounded-lg px-3 py-3 font-bold text-slate-800" state={{ from: location }} to="/signin"><User size={19} /> Tài khoản</Link>
          )}
        </div>
      ) : null}
    </header>
  );
};


