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
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldGroup, FieldLabel } from "@/src/components/ui/field";
import { RegisterInputDto } from "@/src/types/graphql/graphql";
import { useRegister } from "@/src/features/auth/hooks/useRegister";

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const { register, isLoading } = useRegister();

  const onSubmit = async (registerData: RegisterInputDto) => {
    const result = await register({
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
    });
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
                <Field>
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
                          placeholder="Nguyễn văn A"
                          {...field}
                        />
                      </InputGroup>
                    )}
                  />
                </Field>

                <Field>
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
                          placeholder="example@gmail.com"
                          {...field}
                        />
                      </InputGroup>
                    )}
                  />
                </Field>

                <Field>
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
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">Mật khẩu</FieldLabel>
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
                </Field>
              </FieldGroup>

              <Button type="submit" className="mt-6 w-full cursor-pointer">
                Tạo tài khoản
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center gap-2">
            Bạn đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium hover:text-muted-foreground"
            >
              Đăng nhập
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
