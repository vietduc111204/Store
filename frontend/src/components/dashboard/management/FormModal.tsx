import { X } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import type { FormValues, ModalState } from "@/types/management";

const FormModal = ({ modal, onClose }: { modal: NonNullable<ModalState>; onClose: () => void }) => {
  const [values, setValues] = useState<FormValues>(modal.values);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await modal.onSubmit(values);
    } catch (error) {
      console.error(error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Không lưu được dữ liệu"
        : "Không lưu được dữ liệu";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateImageValue = (fieldName: string, file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setValues((current) => ({ ...current, [fieldName]: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const updateImageListValue = (fieldName: string, files?: FileList | null) => {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;

    const imageFiles = selectedFiles.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length !== selectedFiles.length) {
      toast.error("Vui lòng chỉ chọn file ảnh");
      return;
    }

    Promise.all(
      imageFiles.map((file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.readAsDataURL(file);
        })
      )
    ).then((images) => {
      setValues((current) => {
        const currentImages = current[fieldName]
          ? current[fieldName].split("\n").map((line) => line.trim()).filter(Boolean)
          : [];
        return { ...current, [fieldName]: [...currentImages, ...images].join("\n") };
      });
    });
  };

  const setFieldValue = (field: NonNullable<ModalState>["fields"][number], value: string) => {
    setValues((current) =>
      field.onValueChange ? field.onValueChange(value, current) : { ...current, [field.name]: value }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 sm:p-4">
      <form className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl" onSubmit={submit}>
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-black text-slate-950">{modal.title}</h3>
            <p className="text-sm text-slate-500">
              {modal.mode === "create" ? "Nhập thông tin mới" : "Cập nhật thông tin hiện có"}
            </p>
          </div>
          <button
            className="flex size-9 items-center justify-center rounded-lg hover:bg-slate-100"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 overflow-y-auto px-5 py-4">
          {modal.fields.map((field) => {
            const disabled = field.disabled || field.disabledWhen?.(values) || false;

            return (
            <label className="grid gap-2" key={field.name}>
              <span className="text-sm font-bold text-slate-700">{field.label}</span>
              {field.type === "file" ? (
                <div className="grid gap-3 sm:grid-cols-[96px_1fr] sm:items-center">
                  {values[field.name] ? (
                    <img
                      alt={field.label}
                      className="size-24 rounded-lg border border-slate-200 object-cover"
                      src={values[field.name]}
                    />
                  ) : (
                    <div className="hidden size-24 rounded-lg border border-dashed border-slate-200 bg-slate-50 sm:block" />
                  )}
                  <input
                    accept="image/*"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none file:mr-4 file:rounded-md file:border-0 file:bg-sky-700 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white focus:border-sky-500 disabled:bg-slate-100 disabled:text-slate-500"
                    disabled={disabled}
                    onChange={(event) => updateImageValue(field.name, event.target.files?.[0])}
                    type="file"
                  />
                </div>
              ) : field.type === "image-list" ? (
                <div className="grid gap-3">
                  {values[field.name] ? (
                    <div className="grid grid-cols-4 gap-3">
                      {values[field.name].split("\n").map((image) => image.trim()).filter(Boolean).map((image, index) => (
                        <img
                          alt={`${field.label} ${index + 1}`}
                          className="aspect-square w-full rounded-lg border border-slate-200 object-cover"
                          key={`${image}-${index}`}
                          src={image}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
                      Chưa có ảnh phụ
                    </div>
                  )}
                  <input
                    accept="image/*"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none file:mr-4 file:rounded-md file:border-0 file:bg-sky-700 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white focus:border-sky-500 disabled:bg-slate-100 disabled:text-slate-500"
                    disabled={disabled}
                    multiple
                    onChange={(event) => updateImageListValue(field.name, event.target.files)}
                    type="file"
                  />
                </div>
              ) : field.type === "select" ? (
                <select
                  className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100 disabled:text-slate-500"
                  disabled={disabled}
                  onChange={(event) => setFieldValue(field, event.target.value)}
                  value={values[field.name] || ""}
                >
                  <option value="">Chọn {field.label.toLowerCase()}</option>
                  {(field.options || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  className="min-h-28 rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100 disabled:text-slate-500"
                  disabled={disabled}
                  onChange={(event) => setFieldValue(field, event.target.value)}
                  value={values[field.name] || ""}
                />
              ) : (
                <input
                  className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100 disabled:text-slate-500"
                  disabled={disabled}
                  max={field.max}
                  min={field.min}
                  onChange={(event) => setFieldValue(field, event.target.value)}
                  step={field.step}
                  type={field.type || "text"}
                  value={values[field.name] || ""}
                />
              )}
              {field.helperText ? (
                <span className="text-xs font-medium text-slate-500">{field.helperText}</span>
              ) : null}
            </label>
          );
          })}
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 px-5 py-4">
          <button
            className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            Hủy
          </button>
          <button
            className="h-11 rounded-lg bg-sky-700 px-5 text-sm font-bold text-white hover:bg-sky-800 disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Đang lưu..." : modal.submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormModal;
