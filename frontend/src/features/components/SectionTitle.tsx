import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

export const SectionTitle = ({ eyebrow, link, title }: { eyebrow: string; link?: string; title: string }) => (
  <div className="mb-8 flex items-end justify-between gap-4">
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-[#075f83]">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">{title}</h2>
    </div>
    {link ? <Link className="hidden items-center gap-2 text-sm font-bold text-[#075f83] sm:flex" to={link}>Xem tất cả <ArrowRight size={17} /></Link> : null}
  </div>
);


