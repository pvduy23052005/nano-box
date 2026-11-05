import "./globals.css";
import { cn } from "@/src/lib/utils";
import { Roboto, Geist_Mono } from "next/font/google";
import { ApolloProvider } from "@/src/core/apolloProvider";
import { Toaster } from "sonner";
import { Metadata } from "next";

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nano Box",
  description: "Nhắn tin và quản lý lịch trình",
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        roboto.variable,
        geistMono.variable,
        "font-sans",
      )}
    >
      <body className="min-h-full flex flex-col">
        <ApolloProvider>{children}</ApolloProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
