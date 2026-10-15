import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@tiptap/pm",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "sonner",
    ],
  },
};

export default nextConfig;
