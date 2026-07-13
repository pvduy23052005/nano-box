import { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "p"
  | "blockquote"
  | "code";

interface TypographyProps {
  variant: TypographyVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<TypographyVariant, string> = {
  h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground",
  h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-foreground",
  h3: "scroll-m-20 text-2xl font-semibold tracking-tight text-foreground",
  h4: "scroll-m-20 text-xl font-semibold tracking-tight text-foreground",
  p: "leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground",
  blockquote: "mt-6 border-l-2 pl-6 italic text-muted-foreground",
  code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-foreground",
};

export function Typography({ variant, children, className }: TypographyProps) {
  const Component =
    variant === "blockquote" || variant === "code" ? variant : variant;

  return (
    <Component className={cn(variantStyles[variant], className)}>
      {children}
    </Component>
  );
}
