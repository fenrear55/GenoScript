"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dna, Users, UserPlus, Pill } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Patients", icon: Users },
    { href: "/new", label: "Add Patient", icon: UserPlus },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0A2540] text-white shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00C9A7]">
            <Dna className="h-5 w-5 text-[#00513F]" />
          </div>
          <span className="text-xl font-bold tracking-tight">GenoScript</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#00C9A7] text-[#00513F]"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
