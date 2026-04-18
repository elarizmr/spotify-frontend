"use client";
import { useState, useEffect } from 'react';
import SplashScreen from "@/components/SplashScreen";
import FilterNav from "@/components/layout/FilterNav";
import RecentSection from "@/components/home/RecentSection";
import TrendingSongs from "@/components/home/TrendingSongs";
import ArtistSection from "@/components/home/ArtistSection";
import RadioSection from "@/components/home/RadioSection";
import PlaylistSection from "@/components/home/PlaylistSection";
import { usePlayerStore } from '@/components/store/usePlayerStore'; // ✅

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [showSplash, setShowSplash] = useState(false);
  const { isLeftSidebarOpen, isRightSidebarOpen } = usePlayerStore(); // ✅

  useEffect(() => {
    const shouldShow = sessionStorage.getItem('showSplash');
    if (shouldShow === 'true' || !sessionStorage.getItem('splashShown')) {
      setShowSplash(true);
      sessionStorage.removeItem('showSplash');
      sessionStorage.setItem('splashShown', 'true');
    }
  }, []);

  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />;

  return (
    <main className="min-h-screen bg-[#121212] pt-2">
      <div className="max-w-[1500px] mx-auto">
        <FilterNav onFilterChange={setActiveFilter} />
        {(activeFilter === 'All' || activeFilter === 'Music') && (
          <>
            <RecentSection />
            <TrendingSongs />
            <ArtistSection />
            <RadioSection />
            <PlaylistSection
              isLeftSidebarOpen={isLeftSidebarOpen}
              isRightSidebarOpen={isRightSidebarOpen}
            /> 
          </>
        )}
        {activeFilter === 'Podcasts' && (
          <div className="px-6 py-8 text-zinc-400 text-sm">
            Podcast bölməsi tezliklə...
          </div>
        )}
      </div>
    </main>
  );
}