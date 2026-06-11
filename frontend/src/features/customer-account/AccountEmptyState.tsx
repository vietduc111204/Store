import { Bell } from "lucide-react";

const AccountEmptyState = ({ text, title }: { text: string; title: string }) => (
  <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
    <div className="flex size-20 items-center justify-center rounded-full bg-sky-50 text-[#0879a8] ring-8 ring-sky-100/70">
      <Bell size={30} />
    </div>
    <h2 className="mt-6 text-lg font-black text-slate-950">{title}</h2>
    <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">{text}</p>
  </div>
);

export default AccountEmptyState;
