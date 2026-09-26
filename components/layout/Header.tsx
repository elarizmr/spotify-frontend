"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Menu, X, Search } from "lucide-react";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setIsMobileMenuOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const AccountMenuItems = () => (
    <ul className="text-sm font-medium text-[#eaeaea]">
      <li className="p-3 hover:bg-[#3e3e3e] cursor-pointer flex justify-between items-center rounded-sm">
        Account
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </li>
      <li className="p-3 hover:bg-[#3e3e3e] cursor-pointer rounded-sm">Profile</li>
      <li className="p-3 hover:bg-[#3e3e3e] cursor-pointer rounded-sm">Settings</li>
      <div className="h-[1px] bg-[#404040] my-1"></div>
      <li onClick={handleLogout} className="p-3 hover:bg-[#3e3e3e] cursor-pointer rounded-sm">
        Log out
      </li>
    </ul>
  );

  return (
    <header className="bg-black mt-2 relative w-full flex flex-col justify-center">
      {/* ============ DESKTOP BAR (md ve yuxari) ============ */}
      <div className="hidden md:flex h-[64px] items-center justify-between px-4 w-full">
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white hover:bg-[#2a2a2a] transition"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => router.forward()}
            className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white hover:bg-[#2a2a2a] transition"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="flex items-center gap-3 w-full max-w-[560px]">
          <button
            onClick={() => router.push("/")}
            className="bg-[#242424] w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-white hover:scale-105 transition"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
              <path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1-1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33z" />
            </svg>
          </button>

          <div className="flex items-center bg-[#242424] hover:bg-[#2a2a2a] w-full rounded-full px-4 py-3 border border-transparent hover:border-[#444] transition group cursor-text">
            <svg
              viewBox="0 0 24 24"
              className="text-gray-400 group-focus-within:text-white w-6 h-6 mr-3 shrink-0"
              fill="currentColor"
            >
              <path d="M10.533 1.27893C5.35215 1.27893 1.12598 5.41887 1.12598 10.5579C1.12598 15.697 5.35215 19.8369 10.533 19.8369C12.767 19.8369 14.8235 19.0671 16.4402 17.7794L20.7929 22.132C21.1834 22.5226 21.8166 22.5226 22.2071 22.132C22.5976 21.7415 22.5976 21.1083 22.2071 20.7178L17.8634 16.3741C19.183 14.7872 19.94 12.7682 19.94 10.5579C19.94 5.41887 15.7138 1.27893 10.533 1.27893ZM3.12598 10.5579C3.12598 6.46392 6.38793 3.27893 10.533 3.27893C14.678 3.27893 17.94 6.46392 17.94 10.5579C17.94 14.6519 14.678 17.8369 10.533 17.8369C6.38793 17.8369 3.12598 14.6519 3.12598 10.5579Z" />
            </svg>
            <input
              type="text"
              placeholder="What do you want to play?"
              className="bg-transparent outline-none text-white placeholder-gray-400 w-full text-base font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            <div className="flex items-center gap-3 border-l border-gray-500 pl-3 ml-2">
              <svg
                viewBox="0 0 24 24"
                className="text-gray-400 hover:text-white w-6 h-6 cursor-pointer shrink-0"
                fill="currentColor"
              >
                <path d="M15 15.5c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2z"></path>
                <path d="M1.513 9.37A1 1 0 0 1 2.291 9h19.418a1 1 0 0 1 .979 1.208l-2.339 11a1 1 0 0 1-.978.792H4.63a1 1 0 0 1-.978-.792l-2.339-11a1 1 0 0 1 .199-.838zM2.291 7A3 3 0 0 0 .5 11.22l2.339 11A3 3 0 0 0 5.774 24h12.452a3 3 0 0 0 2.935-2.376l2.339-11A3 3 0 0 0 21.709 7H2.291z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-1 justify-end">
          {isLoggedIn ? (
            <div className="flex items-center gap-3 relative">
              <button className="text-gray-400 hover:text-white p-2 transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 24a3 3 0 0 1-3-3h6a3 3 0 0 1-3 3zm10-7v2H2v-2l2-2V8a8.003 8.003 0 0 1 7-7.937V0h2v.063A8.003 8.003 0 0 1 20 8v7l2 2z" />
                </svg>
              </button>
              <div
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-8 h-8 rounded-full bg-[#A594F9] text-black flex items-center justify-center font-bold text-xs border-[3px] border-black ring-1 ring-[#1f1f1f] cursor-pointer hover:scale-105 transition"
              >
                E
              </div>
              {isMenuOpen && (
                <div
                  ref={menuRef}
                  className="absolute top-[50px] right-0 w-[190px] bg-[#282828] shadow-2xl rounded p-1 z-[100]"
                >
                  <AccountMenuItems />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link href="/register">
                <button className="text-gray-400 font-bold hover:text-white hover:scale-105 transition text-base">
                  Sign up
                </button>
              </Link>
              <Link href="/login">
                <button className="bg-white text-black px-8 py-3.5 rounded-full font-bold text-base hover:scale-105 transition">
                  Log in
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ============ MOBILE TOP BAR (md-den kicik) ============ */}
      <div className="flex md:hidden h-[56px] items-center justify-between px-3 w-full">
        <button
          onClick={() => router.push("/")}
          className="bg-[#242424] w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-white"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1-1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33z" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <div
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 rounded-full bg-[#A594F9] text-black flex items-center justify-center font-bold text-xs cursor-pointer"
            >
              E
            </div>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Menyunu ac"
            className="w-9 h-9 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white hover:bg-[#2a2a2a] transition"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Login olmuş istifadeci ucun account dropdown - mobil */}
      {isLoggedIn && isMenuOpen && (
        <div
          ref={menuRef}
          className="md:hidden absolute top-[50px] right-3 w-[190px] bg-[#282828] shadow-2xl rounded p-1 z-[100]"
        >
          <AccountMenuItems />
        </div>
      )}

      {/* ============ HAMBURGER / MOBILE FULLSCREEN MENYU ============ */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden fixed inset-0 bg-black z-[200] flex flex-col animate-in fade-in"
        >
          <div className="flex items-center justify-between px-4 h-[56px] border-b border-[#2a2a2a]">
            <span className="text-white font-bold text-lg">Menyu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Menyunu bagla"
              className="w-9 h-9 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white hover:bg-[#2a2a2a] transition"
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
            <div className="flex items-center bg-[#242424] rounded-full px-4 py-3">
              <Search size={20} className="text-gray-400 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="What do you want to play?"
                className="bg-transparent outline-none text-white placeholder-gray-400 w-full text-base font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  router.back();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 h-11 rounded-full bg-[#1a1a1a] flex items-center justify-center gap-2 text-white"
              >
                <ChevronLeft size={20} /> Geri
              </button>
              <button
                onClick={() => {
                  router.forward();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 h-11 rounded-full bg-[#1a1a1a] flex items-center justify-center gap-2 text-white"
              >
                Ireli <ChevronRight size={20} />
              </button>
            </div>

            <div className="h-[1px] bg-[#2a2a2a] my-2" />

            {isLoggedIn ? (
              <ul className="text-base font-medium text-[#eaeaea] flex flex-col gap-1">
                <li className="p-3 hover:bg-[#2a2a2a] cursor-pointer rounded-sm">Account</li>
                <li className="p-3 hover:bg-[#2a2a2a] cursor-pointer rounded-sm">Profile</li>
                <li className="p-3 hover:bg-[#2a2a2a] cursor-pointer rounded-sm">Settings</li>
                <li
                  onClick={handleLogout}
                  className="p-3 hover:bg-[#2a2a2a] cursor-pointer rounded-sm text-red-400"
                >
                  Log out
                </li>
              </ul>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full text-left p-3 text-gray-300 font-bold hover:bg-[#2a2a2a] rounded-sm transition">
                    Sign up
                  </button>
                </Link>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full bg-white text-black py-3 rounded-full font-bold transition">
                    Log in
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}