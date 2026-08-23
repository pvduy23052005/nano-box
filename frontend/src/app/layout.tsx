import "./globals.css";
import { cn } from "@/src/lib/utils";
import { Geist, Geist_Mono } from "next/font/google";
import { ApolloProvider } from "@/src/core/apolloProvider";
import { Toaster } from "sonner";
import { Metadata } from "next";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <ApolloProvider>{children}</ApolloProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
