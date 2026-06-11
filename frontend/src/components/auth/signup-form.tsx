import type { ComponentProps, FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/libs/utils";
import { useAuthStore } from "@/stores/useAuthStore";

const signUpSchema = z
  .object({
    tenThanhVien: z.string().trim().min(1, "Vui lòng nhập tên khách hàng"),
    soDienThoai: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập số điện thoại")
      .regex(/^[0-9]{9,11}$/, "Số điện thoại phải có 9-11 chữ số"),
    diaChi: z.string().trim().optional(),
    email: z.string().trim().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp",
  });

type SignUpValues = z.infer<typeof signUpSchema>;
type FieldName = keyof SignUpValues;
type FormErrors = Partial<Record<FieldName, string>>;

const initialForm: SignUpValues = {
  tenThanhVien: "",
  soDienThoai: "",
  diaChi: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const fields: Array<{
  name: FieldName;
  label: string;
  type?: string;
  placeholder?: string;
}> = [
  { name: "tenThanhVien", label: "Tên khách hàng", placeholder: "Nguyễn Văn A" },
  { name: "soDienThoai", label: "Số điện thoại", placeholder: "0123456789" },
  { name: "diaChi", label: "Địa chỉ", placeholder: "Hà Nội" },
  { name: "email", label: "Email", type: "email", placeholder: "user@example.com" },
  { name: "password", label: "Mật khẩu", type: "password" },
  { name: "confirmPassword", label: "Nhập lại mật khẩu", type: "password" },
];

const inputClassName =
  "border-sky-200 bg-sky-50/70 focus-visible:border-sky-500 focus-visible:ring-sky-100";

export function SignupForm({ className, ...props }: ComponentProps<"div">) {
  const navigate = useNavigate();
  const { signUp, loading } = useAuthStore();
  const [form, setForm] = useState<SignUpValues>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (name: FieldName, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = signUpSchema.safeParse(form);
    if (!result.success) {
      const nextErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as FieldName | undefined;
        if (field) nextErrors[field] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      await signUp({
        email: result.data.email,
        password: result.data.password,
        loaiTaiKhoan: "khach_hang",
        tenThanhVien: result.data.tenThanhVien,
        soDienThoai: result.data.soDienThoai,
        diaChi: result.data.diaChi,
      });
      navigate("/signin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden border-sky-100 bg-white p-0 shadow-sm">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold text-slate-950">Đăng ký tài khoản</h1>
                <p className="text-balance text-sm text-slate-500">
                  Tạo tài khoản khách hàng mới.
                </p>
              </div>

              {fields.map((field) => (
                <Field key={field.name}>
                  <FieldLabel htmlFor={field.name}>{field.label}</FieldLabel>
                  <Input
                    id={field.name}
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    value={form[field.name]}
                    onChange={(event) => setField(field.name, event.target.value)}
                    aria-invalid={!!errors[field.name]}
                    className={inputClassName}
                  />
                  <FieldError>{errors[field.name]}</FieldError>
                  {field.name === "password" && (
                    <FieldDescription>Mật khẩu tối thiểu 6 ký tự.</FieldDescription>
                  )}
                </Field>
              ))}

              <Field>
                <Button
                  type="submit"
                  className="w-full bg-sky-600 text-white hover:bg-sky-700"
                  disabled={loading || submitting}
                >
                  {loading || submitting ? "Đang tạo..." : "Tạo tài khoản"}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Đã có tài khoản?{" "}
                <Link className="text-sky-700" to="/signin">
                  Đăng nhập
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="hidden min-h-full items-center justify-center bg-sky-50 p-8 md:flex">
            <img
              src="/placeholderSignUp.png"
              alt="Đăng ký"
              className="max-h-[560px] w-full max-w-md object-contain"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
