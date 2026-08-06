import { ReactNode, ElementType } from "react";
import { cn } from "@/src/lib/utils";

type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "p"
  | "blockquote"
  | "code"
  | "lead"
  | "large"
  | "small"
  | "muted"
  | "caption";

interface TypographyProps {
  variant: TypographyVariant;
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

const variantStyles: Record<TypographyVariant, string> = {
  h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground",
  h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-foreground",
  h3: "scroll-m-20 text-2xl font-semibold tracking-tight text-foreground",
  h4: "scroll-m-20 text-xl font-semibold tracking-tight text-foreground",
  p: "leading-7 [&:not(:first-child)]:mt-6 text-foreground",
  blockquote: "mt-6 border-l-2 pl-6 italic text-muted-foreground",
  code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-foreground",

  lead: "text-xl text-muted-foreground font-normal",
  large: "text-lg font-semibold text-foreground",
  small: "text-sm font-medium leading-none text-foreground",
  muted: "text-sm text-muted-foreground",
  caption: "text-xs text-muted-foreground leading-none",
};

const variantElementMap: Record<TypographyVariant, ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  p: "p",
  blockquote: "blockquote",
  code: "code",
  lead: "p",
  large: "div",
  small: "small",
  muted: "p",
  caption: "span",
};

export function Typography({
  variant,
  children,
  className,
  as,
}: TypographyProps) {
  const Component = as || variantElementMap[variant] || "span";

  return (
    <Component className={cn(variantStyles[variant], className)}>
      {children}
    </Component>
  );
}
