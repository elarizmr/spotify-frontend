"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsMenuOpen(false);
    router.push("/");
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-black mt-2 relative w-full flex flex-col justify-center">
      <div className={`h-[64px] items-center justify-between px-4 w-full ${isLoggedIn ? 'hidden md:flex' : 'flex'}`}>

        {/* Sol: geri/irəli düymələri */}
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

     
        <div className="flex items-center gap-3 w-[560px]">
          <button
            onClick={() => router.push('/')}
            className="bg-[#242424] w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-white hover:scale-105 transition"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
              <path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1-1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33z" />
            </svg>
          </button>

          <div className="flex items-center bg-[#242424] hover:bg-[#2a2a2a] w-full rounded-full px-4 py-3 border border-transparent hover:border-[#444] transition group cursor-text">
            <svg viewBox="0 0 24 24" className="text-gray-400 group-focus-within:text-white w-6 h-6 mr-3 shrink-0" fill="currentColor">
              <path d="M10.533 1.27893C5.35215 1.27893 1.12598 5.41887 1.12598 10.5579C1.12598 15.697 5.35215 19.8369 10.533 19.8369C12.767 19.8369 14.8235 19.0671 16.4402 17.7794L20.7929 22.132C21.1834 22.5226 21.8166 22.5226 22.2071 22.132C22.5976 21.7415 22.5976 21.1083 22.2071 20.7178L17.8634 16.3741C19.183 14.7872 19.94 12.7682 19.94 10.5579C19.94 5.41887 15.7138 1.27893 10.533 1.27893ZM3.12598 10.5579C3.12598 6.46392 6.38793 3.27893 10.533 3.27893C14.678 3.27893 17.94 6.46392 17.94 10.5579C17.94 14.6519 14.678 17.8369 10.533 17.8369C6.38793 17.8369 3.12598 14.6519 3.12598 10.5579Z" />
            </svg>
            <input
              type="text"
              placeholder="What do you want to play?"
              className="bg-transparent outline-none text-white placeholder-gray-400 w-full text-base font-medium"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            <div className="flex items-center gap-3 border-l border-gray-500 pl-3 ml-2">
              <svg viewBox="0 0 24 24" className="text-gray-400 hover:text-white w-6 h-6 cursor-pointer shrink-0" fill="currentColor">
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 24a3 3 0 0 1-3-3h6a3 3 0 0 1-3 3zm10-7v2H2v-2l2-2V8a8.003 8.003 0 0 1 7-7.937V0h2v.063A8.003 8.003 0 0 1 20 8v7l2 2z"/></svg>
              </button>
              <div
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-8 h-8 rounded-full bg-[#A594F9] text-black flex items-center justify-center font-bold text-xs border-[3px] border-black ring-1 ring-[#1f1f1f] cursor-pointer hover:scale-105 transition"
              >
                E
              </div>
              {isMenuOpen && (
                <div ref={menuRef} className="absolute top-[50px] right-0 w-[190px] bg-[#282828] shadow-2xl rounded p-1 z-[100]">
                  <ul className="text-sm font-medium text-[#eaeaea]">
                    <li className="p-3 hover:bg-[#3e3e3e] cursor-pointer flex justify-between items-center rounded-sm">
                      Account <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </li>
                    <li className="p-3 hover:bg-[#3e3e3e] cursor-pointer rounded-sm">Profile</li>
                    <li className="p-3 hover:bg-[#3e3e3e] cursor-pointer rounded-sm">Settings</li>
                    <div className="h-[1px] bg-[#404040] my-1"></div>
                    <li onClick={handleLogout} className="p-3 hover:bg-[#3e3e3e] cursor-pointer rounded-sm">Log out</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link href="/register">
                <button className="text-gray-400 font-bold hover:text-white hover:scale-105 transition text-base">Sign up</button>
              </Link>
              <Link href="/login">
                <button className="bg-white text-black px-8 py-3.5 rounded-full font-bold text-base hover:scale-105 transition">Log in</button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {isLoggedIn && (
        <div className="flex md:hidden h-[60px] items-center gap-2 px-4 w-full overflow-x-auto no-scrollbar py-2 relative">
          <div
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="shrink-0 w-[32px] h-[32px] rounded-full bg-[#A594F9] text-black flex items-center justify-center font-medium text-[15px] cursor-pointer"
          >
            E
          </div>
          {isMenuOpen && (
            <div className="absolute top-[50px] left-[16px] w-[190px] bg-[#282828] shadow-2xl rounded p-1 z-[100]">
              <ul className="text-sm font-medium text-[#eaeaea]">
                <li className="p-3 hover:bg-[#3e3e3e] cursor-pointer flex justify-between items-center rounded-sm">
                  Account <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </li>
                <li className="p-3 hover:bg-[#3e3e3e] cursor-pointer rounded-sm">Profile</li>
                <li className="p-3 hover:bg-[#3e3e3e] cursor-pointer rounded-sm">Settings</li>
                <div className="h-[1px] bg-[#404040] my-1"></div>
                <li onClick={handleLogout} className="p-3 hover:bg-[#3e3e3e] cursor-pointer rounded-sm">Log out</li>
              </ul>
            </div>
          )}
          <button className="shrink-0 bg-[#1ed760] text-black px-[16px] py-[6px] rounded-full font-medium text-[14px] transition">All</button>
          <button className="shrink-0 bg-[#333333] text-white px-[16px] py-[6px] rounded-full font-medium text-[14px] transition">Music</button>
          <button className="shrink-0 bg-[#333333] text-white px-[16px] py-[6px] rounded-full font-medium text-[14px] transition">Podcasts</button>
        </div>
      )}
    </header>
  );
}