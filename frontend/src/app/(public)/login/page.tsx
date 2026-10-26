"use client";

import {
  Card,
  CardContent,
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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/src/components/ui/field";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { LockIcon, MailIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { LoginFormValue, loginSchema } from "@/src/features/auth/schemas/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginInputDto } from "@/src/types/graphql/graphql";
import { useLogin } from "@/src/features/auth/hooks/useLogin";
import { handleFormError } from "@/src/core/utils/handleFormError";
import { useRouter } from "next/navigation";
import { Spinner } from "@/src/components/ui/spinner";
import { toast } from "sonner";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();
  const { login, loginWithGoogle, isLoading } = useLogin();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValue>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (input: LoginInputDto) => {
    try {
      const result = await login(input);
      if (result?.success) router.push("/");
    } catch (error) {
      handleFormError(error, setError);
    }
  };

  const handleLoginWithGoogle = async (response: CredentialResponse) => {
    const id_token = response.credential;
    if (!id_token) {
      return toast.error("Không thể đăng nhập với Google");
    }
    try {
      const result = await loginWithGoogle(id_token);
      if (result?.success) router.push("/");
    } catch {
      toast.error("Đăng nhập với Google thất bại");
    }
  };

  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
    >
      <div className="flex h-screen items-center justify-center">
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
          <Card className="border-border/50 bg-card/80 shadow-2xl backdrop-blur-sm relative z-10">
            <CardHeader>
              <CardTitle>Đăng nhập tài khoản</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>

                    <Controller
                      control={control}
                      name="email"
                      render={({ field }) => (
                        <InputGroup className="h-10">
                          <InputGroupAddon align="inline-start">
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
                        <InputGroup className="h-10">
                          <InputGroupAddon align="inline-start">
                            <LockIcon />
                          </InputGroupAddon>
                          <InputGroupInput
                            id="password"
                            aria-invalid={!!errors.password}
                            placeholder="Nhập mật khẩu"
                            type={showPassword ? "text" : "password"}
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
                </FieldGroup>

                <Button
                  type="submit"
                  className="mt-6 w-full cursor-pointer h-10"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner /> Đang đăng nhập...
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-center">
                <div className="w-full h-px bg-border flex-1" />
                <span className="px-3 text-sm text-muted-foreground bg-transparent">
                  Hoặc
                </span>
                <div className="w-full h-px bg-border flex-1" />
              </div>

              <div className="mt-4 flex justify-center">
                <GoogleLogin
                  onSuccess={handleLoginWithGoogle}
                  onError={() => {
                    toast.error("Đăng nhập với Google thất bại");
                  }}
                  useOneTap
                />
              </div>
            </CardContent>

            <CardFooter className="justify-center gap-2">
              Bạn chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline cursor-pointer"
              >
                Đăng ký
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
