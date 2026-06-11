type ProfileFieldProps = {
  disabled?: boolean;
  label: string;
  onChange?: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
};

const ProfileField = ({ disabled, label, onChange, required, type = "text", value }: ProfileFieldProps) => (
  <label className="block">
    <span className="text-xs font-black uppercase text-slate-500">{label}</span>
    <input
      className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 outline-none focus:border-[#0879a8] disabled:bg-slate-100 disabled:text-slate-500"
      disabled={disabled}
      onChange={(event) => onChange?.(event.target.value)}
      required={required}
      type={type}
      value={value}
    />
  </label>
);

export default ProfileField;
