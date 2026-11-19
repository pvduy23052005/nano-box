"use client";

import LogoSpinner from "./LogoSpinner";

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <LogoSpinner size="lg" showText={true} />
    </div>
  );
}
