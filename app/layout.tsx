'use client';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import Providers from '@/components/Providers';
import PlayerBar from '@/components/layout/Playerbar';
import NowPlayingSidebar from '@/components/Nowplayingsidebar';
import { usePlayerStore } from '@/components/store/usePlayerStore';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const { setLeftSidebar, setRightSidebar, currentSong } = usePlayerStore();

  useEffect(() => {
    setLeftSidebar(!sidebarCollapsed);
  }, [sidebarCollapsed]);

  useEffect(() => {
    setRightSidebar(sidebarOpen);
  }, [sidebarOpen]);

  const isPlainPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/admin';

  // /library sehifesinde ozunun mobil basligi var, umumi Header-in
  // mobil sethri (56px) bununla ust-uste dusmesin deye gizlenir.
  const hideHeaderOnMobile = pathname === '/library';

  return (
    <html lang="en">
      <body className="bg-black text-white h-screen w-screen overflow-hidden font-sans flex flex-col p-2 gap-2">
        <Providers>
          {isPlainPage ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          ) : (
            <>
              <div
                className={
                  hideHeaderOnMobile
                    ? 'hidden md:block h-[64px] w-full shrink-0'
                    : 'h-[64px] w-full shrink-0'
                }
              >
                <Header />
              </div>

              <div className="flex-1 flex gap-2 overflow-hidden min-h-0">
                <div className="hidden md:flex">
                  <Sidebar
                    isCollapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(prev => !prev)}
                    isExpanded={sidebarExpanded}
                    onExpandToggle={() => setSidebarExpanded(prev => !prev)}
                  />
                </div>

                {!sidebarExpanded && (
                  <div className="flex-1 bg-[#121212] rounded-lg overflow-hidden flex flex-col relative">
                    <main className="flex-1 overflow-y-auto custom-scrollbar">
                      <div className="min-h-full">
                        {children}
                        <Footer />
                      </div>
                    </main>
                  </div>
                )}

                <div className="hidden md:flex">
                  <NowPlayingSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    onOpen={() => setSidebarOpen(true)}
                  />
                </div>
              </div>

              <div className={currentSong ? "h-[90px] w-full shrink-0 bg-black" : "h-0 md:h-[90px] w-full shrink-0 bg-black overflow-hidden"}>
                <PlayerBar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
              </div>

              <BottomNav />
            </>
          )}
        </Providers>
      </body>
    </html>
  );
}