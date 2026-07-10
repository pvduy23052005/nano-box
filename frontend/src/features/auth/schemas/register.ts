import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
    email: z
      .string()
      .min(1, "Email không được để trống")
      .email("Email không đúng định dạng"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không trùng khớp",
    path: ["confirmPassword"],
  });

export type RegisterFormValue = z.infer<typeof registerSchema>;
