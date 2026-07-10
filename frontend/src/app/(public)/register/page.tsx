"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/components/ui/input-group";
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  UserIcon,
} from "lucide-react";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/src/components/ui/field";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { RegisterInputDto } from "@/src/types/graphql/graphql";
import { useRegister } from "@/src/features/auth/hooks/useRegister";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/src/components/ui/spinner";
import { handleFormError } from "@/src/core/utils/handleFormError";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RegisterFormValue,
  registerSchema,
} from "@/src/features/auth/schemas/register";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { register, isLoading } = useRegister();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValue>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (registerData: RegisterInputDto) => {
    try {
      const result = await register(registerData);
      if (result?.success) {
        toast.success(result.message || "Đăng ký tài khoản thành công!");
        router.push("/login");
      }
    } catch (error) {
      handleFormError(error, setError);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="size-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 size-[250px] rounded-full bg-primary/5 blur-[80px]" />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full max-w-md">
        <Card className="border-border/50 shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Đăng ký tài khoản</CardTitle>
            <CardDescription>
              Điền thông tin để đăng ký tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor="name">Họ và tên</FieldLabel>

                  <Controller
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <InputGroup>
                        <InputGroupAddon>
                          <UserIcon />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="name"
                          aria-invalid={!!errors.name}
                          placeholder="Nguyễn văn A"
                          {...field}
                        />
                      </InputGroup>
                    )}
                  />
                  {errors.name && (
                    <FieldError>{errors.name.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>

                  <Controller
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <InputGroup>
                        <InputGroupAddon>
                          <MailIcon />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="email"
                          aria-invalid={!!errors.email}
                          placeholder="example@gmail.com"
                          {...field}
                        />
                      </InputGroup>
                    )}
                  />
                  {errors.email && (
                    <FieldError>{errors.email.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.password}>
                  <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field }) => (
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <LockIcon />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="password"
                          aria-invalid={!!errors.password}
                          type={showPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu"
                          {...field}
                        />

                        <InputGroupAddon align="inline-end">
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="cursor-pointer hover:text-foreground transition-colors"
                          >
                            {showPassword ? (
                              <EyeIcon className="size-4" />
                            ) : (
                              <EyeOffIcon className="size-4" />
                            )}
                          </button>
                        </InputGroupAddon>
                      </InputGroup>
                    )}
                  />
                  {errors.password && (
                    <FieldError>{errors.password.message}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.confirmPassword}>
                  <FieldLabel htmlFor="confirmPassword">
                    Xác nhận Mật khẩu
                  </FieldLabel>
                  <Controller
                    control={control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <LockIcon />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="confirmPassword"
                          aria-invalid={!!errors.confirmPassword}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Nhập lại mật khẩu"
                          {...field}
                        />

                        <InputGroupAddon align="inline-end">
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="cursor-pointer hover:text-foreground transition-colors"
                          >
                            {showConfirmPassword ? (
                              <EyeIcon className="size-4" />
                            ) : (
                              <EyeOffIcon className="size-4" />
                            )}
                          </button>
                        </InputGroupAddon>
                      </InputGroup>
                    )}
                  />
                  {errors.confirmPassword && (
                    <FieldError>{errors.confirmPassword.message}</FieldError>
                  )}
                </Field>
              </FieldGroup>

              <Button type="submit" className="mt-6 w-full cursor-pointer">
                {isLoading ? <Spinner /> : "Tạo tài khoản"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center gap-2">
            Bạn đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Đăng nhập
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
