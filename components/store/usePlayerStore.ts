'use client';
import { API_URL } from "@/lib/config";
import { create } from 'zustand';

interface Song {
  _id: string;
  title: string;
  artist: string;
  artistId?: string;
  audioUrl: string;
  coverImg: string;
  plays?: number;
}

interface PlayerStore {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  playSong: (song: Song) => void;
  pauseSong: () => void;
  playNext: () => void;
  playPrev: () => void;
  setQueue: (songs: Song[]) => void;
 
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  setLeftSidebar: (open: boolean) => void;
  setRightSidebar: (open: boolean) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  queue: [],

  playSong: (song) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      const recent = JSON.parse(localStorage.getItem("recentSongs") || "[]");
      const filtered = recent.filter((s: any) => s._id !== song._id);
      const updated = [song, ...filtered].slice(0, 10);
      localStorage.setItem("recentSongs", JSON.stringify(updated));
      fetch(`${API_URL}/api/songs/${song._id}/play`, { method: 'POST' }).catch(() => {});
    }
    set({ currentSong: song, isPlaying: true });
  },

  pauseSong: () => set({ isPlaying: false }),
  setQueue: (songs) => set({ queue: songs }),

  playNext: () => {
    const { currentSong, queue } = get();
    if (!currentSong || queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s._id === currentSong._id);
    const nextSong = queue[currentIndex + 1];
    if (nextSong) set({ currentSong: nextSong, isPlaying: true });
  },

  playPrev: () => {
    const { currentSong, queue } = get();
    if (!currentSong || queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s._id === currentSong._id);
    const prevSong = queue[currentIndex - 1];
    if (prevSong) set({ currentSong: prevSong, isPlaying: true });
  },

 
  isLeftSidebarOpen: true,
  isRightSidebarOpen: false,
  setLeftSidebar: (open) => set({ isLeftSidebarOpen: open }),
  setRightSidebar: (open) => set({ isRightSidebarOpen: open }),
}));