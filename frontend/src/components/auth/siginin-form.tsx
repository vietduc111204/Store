import type { ComponentProps, FormEvent } from "react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
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
import { getHomePathByRole, isCustomerPath } from "@/libs/authRoutes";
import { cn } from "@/libs/utils";
import { useAuthStore } from "@/stores/useAuthStore";

const signInSchema = z.object({
  email: z.string().trim().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type SignInValues = z.infer<typeof signInSchema>;
type FormErrors = Partial<Record<keyof SignInValues, string>>;

const initialForm: SignInValues = {
  email: "",
  password: "",
};

const inputClassName =
  "border-sky-200 bg-sky-50/70 focus-visible:border-sky-500 focus-visible:ring-sky-100";

type SignInLocationState = {
  from?: {
    hash?: string;
    pathname?: string;
    search?: string;
    state?: {
      authMessage?: string;
      [key: string]: unknown;
    } | null;
  };
};

export function SigninForm({ className, ...props }: ComponentProps<"div">) {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as SignInLocationState | null;
  const authMessage = locationState?.from?.state?.authMessage;
  const { signIn, loading } = useAuthStore();
  const [form, setForm] = useState<SignInValues>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (field: keyof SignInValues, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = signInSchema.safeParse(form);
    if (!result.success) {
      const nextErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignInValues | undefined;
        if (field) nextErrors[field] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const account = await signIn(result.data.email, result.data.password);
      const fromPath = locationState?.from?.pathname
        ? `${locationState.from.pathname}${locationState.from.search || ""}${locationState.from.hash || ""}`
        : sessionStorage.getItem("customer:lastPath");
      const returnPath = account.loaiTaiKhoan === "khach_hang" && fromPath && isCustomerPath(fromPath)
        ? fromPath
        : getHomePathByRole(account.loaiTaiKhoan);

      sessionStorage.removeItem("customer:lastPath");
      navigate(returnPath, { replace: true, state: locationState?.from?.state });
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
                <Link to="/" className="mx-auto block w-fit text-center">
                  <img src="/logo.svg" alt="logo" />
                </Link>

                <h1 className="text-2xl font-bold text-slate-950">Chào mừng quay lại</h1>
              </div>

              {authMessage ? (
                <div className="rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-center text-sm font-semibold text-sky-900">
                  {authMessage}
                </div>
              ) : null}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={form.email}
                  onChange={(event) => setField("email", event.target.value)}
                  aria-invalid={!!errors.email}
                  className={inputClassName}
                />
                <FieldError>{errors.email}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(event) => setField("password", event.target.value)}
                  aria-invalid={!!errors.password}
                  className={inputClassName}
                />
                <FieldError>{errors.password}</FieldError>
              </Field>

              <Button
                type="submit"
                className="w-full bg-sky-600 text-white hover:bg-sky-700"
                disabled={loading || submitting}
              >
                {loading || submitting ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>

              <FieldDescription className="text-center">
                Chưa có tài khoản?{" "}
                <Link className="text-sky-700" to="/signup">
                  Đăng ký
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="hidden min-h-full items-center justify-center bg-sky-50 p-8 md:flex">
            <img
              src="/placeholder.png"
              alt="Đăng nhập"
              className="max-h-[560px] w-full max-w-md object-contain"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
