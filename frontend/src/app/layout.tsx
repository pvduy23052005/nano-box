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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nano-boxes.id.vn";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Nano Box - Nền tảng nhắn tin và quản lý lịch trình",
    template: "%s | Nano Box",
  },
  description:
    "Nano Box - Nền tảng nhắn tin bảo mật, trò chuyện nhóm và đồng bộ lịch trình thời gian thực.",
  applicationName: "Nano Box",
  keywords: [
    "Nano Box",
    "chat",
    "nhắn tin",
    "lịch trình",
    "realtime",
    "bảo mật",
  ],
  authors: [{ name: "Nano Box Team" }],
  creator: "Nano Box",
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/logo.svg",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: APP_URL,
    siteName: "Nano Box",
    title: "Nano Box - Nền tảng nhắn tin và quản lý lịch trình",
    description:
      "Nano Box - Nền tảng nhắn tin bảo mật, trò chuyện nhóm và đồng bộ lịch trình thời gian thực.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nano Box - Nền tảng nhắn tin và quản lý lịch trình",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nano Box - Nền tảng nhắn tin và quản lý lịch trình",
    description:
      "Nano Box - Nền tảng nhắn tin bảo mật, trò chuyện nhóm và đồng bộ lịch trình thời gian thực.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
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
