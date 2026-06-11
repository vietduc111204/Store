import { Boxes, LogOut } from "lucide-react";
import { Link } from "react-router";
import type { ManagementRole, ViewKey } from "@/types/management";
import { cx } from "./shared";
import { createManagementMenu, roleLabels, viewLabels } from "@/config/managementConfig";

type Props = {
  activeTitle: string;
  activeView: ViewKey;
  children: React.ReactNode;
  loading: boolean;
  role: ManagementRole;
  setActiveView: (view: ViewKey) => void;
  userEmail?: string;
};

const ManagementShell = ({
  activeTitle,
  activeView,
  children,
  loading,
  role,
  setActiveView,
  userEmail,
}: Props) => {
  const menu = createManagementMenu(role);

  return (
    <main className="min-h-svh bg-slate-50 text-slate-950">
      <div className="grid min-h-svh lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="flex min-h-svh flex-col border-r border-slate-200 bg-white px-5 py-8">
          <div className="mb-10 flex items-center gap-3 px-5">
            <div className="text-sky-700">
              <Boxes size={36} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-normal">SmartHome</h1>
              <p className="text-sm font-semibold text-slate-700">{roleLabels[role]}</p>
            </div>
          </div>

          <nav className="space-y-2">
            {menu.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  className={cx(
                    "flex h-12 w-full items-center gap-4 rounded-lg px-5 text-left text-base font-semibold",
                    activeView === item.key
                      ? "bg-sky-100 text-slate-700"
                      : "text-slate-800 hover:bg-slate-50"
                  )}
                  key={item.key}
                  onClick={() => setActiveView(item.key)}
                  type="button"
                >
                  <Icon size={21} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-slate-200 pt-8">
            <Link
              className="flex h-12 items-center gap-4 rounded-lg px-5 text-base font-semibold text-slate-800 hover:bg-slate-50"
              to="/logout"
            >
              <LogOut size={20} />
              Đăng xuất
            </Link>
          </div>
        </aside>

        <section className="min-w-0 px-8 py-8">
          <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3 text-sm">
                <span className="text-slate-600">Trang chủ</span>
                <span className="text-slate-400">›</span>
                <span className="font-bold text-sky-700">{viewLabels[activeView]}</span>
              </div>
              <h2 className="text-3xl font-black tracking-normal text-slate-950">{activeTitle}</h2>
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-6 py-3 text-base font-semibold shadow-sm">
              {userEmail || roleLabels[role]}
            </div>
          </header>

          <div className="space-y-7">
            {loading ? (
              <div className="rounded-lg border border-slate-200 bg-white p-8 text-center font-semibold text-slate-600">
                Đang tải dữ liệu...
              </div>
            ) : null}
            {children}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ManagementShell;
