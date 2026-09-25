'use client';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Providers from '@/components/Providers';
import PlayerBar from '@/components/layout/Playerbar';
import NowPlayingSidebar from '@/components/Nowplayingsidebar';
import { usePlayerStore } from '@/components/store/usePlayerStore'; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const { setLeftSidebar, setRightSidebar } = usePlayerStore(); 

 
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
              <div className="h-[64px] w-full shrink-0">
                <Header />
              </div>

              <div className="flex-1 flex gap-2 overflow-hidden min-h-0">
                <Sidebar
                  isCollapsed={sidebarCollapsed}
                  onToggle={() => setSidebarCollapsed(prev => !prev)}
                  isExpanded={sidebarExpanded}
                  onExpandToggle={() => setSidebarExpanded(prev => !prev)}
                />

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

                <NowPlayingSidebar
                  isOpen={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                  onOpen={() => setSidebarOpen(true)}
                />
              </div>

              <div className="h-[90px] w-full shrink-0 bg-black">
                <PlayerBar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
              </div>
            </>
          )}
        </Providers>
      </body>
    </html>
  );
}