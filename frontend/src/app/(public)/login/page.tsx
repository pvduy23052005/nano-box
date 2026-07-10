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
import { Field, FieldGroup, FieldLabel } from "@/src/components/ui/field";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { LockIcon, MailIcon, EyeIcon, EyeOffIcon } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInputDto) => console.log(data);

  return (
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
        <Card className="border-border/50 bg-card/80 shadow-2xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Đăng nhập tài khoản</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Họ và tên</FieldLabel>

                  <Controller
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <MailIcon />
                        </InputGroupAddon>
                        <InputGroupInput
                          {...field}
                          id="email"
                          placeholder="example@gmail.com"
                        />
                      </InputGroup>
                    )}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field }) => (
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <LockIcon />
                        </InputGroupAddon>
                        <InputGroupInput
                          {...field}
                          id="password"
                          placeholder="Nhập mật khẩu"
                          type={showPassword ? "text" : "password"}
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
              </FieldGroup>

              <Button type="submit" className="mt-6 w-full cursor-pointer">
                Đăng nhập
              </Button>
            </form>
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
  );
}
