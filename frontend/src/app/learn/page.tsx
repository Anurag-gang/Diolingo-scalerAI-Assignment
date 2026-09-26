"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LearnRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f7f9fa] flex items-center justify-center">
      <div className="animate-pulse text-[#58cc02] font-black text-lg">
        Loading Diolingo Learning Path...
      </div>
    </div>
  );
}
