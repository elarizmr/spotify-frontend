"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Search, Library, Plus } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  if (!token) return null;

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/search", label: "Search", icon: Search },
    { href: "/library", label: "Your Library", icon: Library },
  ];

  return (
    <nav className="md:hidden h-[64px] w-full shrink-0 bg-black border-t border-[#1a1a1a] flex items-center justify-around">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
          >
            <Icon
              size={22}
              className={isActive ? "text-white" : "text-gray-400"}
              fill={isActive && label === "Home" ? "white" : "none"}
            />
            <span className={`text-[11px] font-medium ${isActive ? "text-white" : "text-gray-400"}`}>
              {label}
            </span>
          </Link>
        );
      })}

      <Link href="/create" className="flex flex-col items-center justify-center gap-1 flex-1 h-full">
        <Plus size={22} className={pathname === "/create" ? "text-white" : "text-gray-400"} />
        <span className={`text-[11px] font-medium ${pathname === "/create" ? "text-white" : "text-gray-400"}`}>
          Create
        </span>
      </Link>
    </nav>
  );
}