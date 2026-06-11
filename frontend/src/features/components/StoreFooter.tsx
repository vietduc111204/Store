export const StoreFooter = () => (
  <footer className="border-t border-slate-200 bg-[#eef4ff]">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
      <div>
        <h3 className="text-xl font-black text-[#075f83]">SmartHome</h3>
        <p className="mt-5 text-sm leading-7 text-slate-600">Kiến tạo cuộc sống thông minh và an tâm tuyệt đối cho mọi gia đình Việt.</p>
      </div>
      <FooterGroup title="Liên kết nhanh" items={["Sản phẩm mới", "Về chúng tôi", "Hỗ trợ khách hàng"]} />
      <FooterGroup title="Chính sách" items={["Chính sách bảo hành", "Vận chuyển & Giao hàng", "Đổi trả sản phẩm", "Bảo mật thông tin"]} />
      <FooterGroup title="Liên hệ" items={["Bùi Việt Đức", "Lạng Sơn"]} />
    </div>
    <div className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">© 2026 SmartHome Inc. Bảo lưu mọi quyền.</div>
  </footer>
);

const FooterGroup = ({ title, items }: { title: string; items: string[] }) => (
  <div>
    <h4 className="text-sm font-black uppercase tracking-wide text-slate-900">{title}</h4>
    <div className="mt-5 grid gap-3 text-sm text-slate-600">{items.map((item) => <span key={item}>{item}</span>)}</div>
  </div>
);


