"use client";
import { API_URL } from "@/lib/config";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit2, Upload, Music, Image as ImageIcon, Users, X, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type Song = {
  _id: string;
  title: string;
  artist: string;
  album: string;
  coverImg: string;
  audioUrl: string;
  releaseDate: string;
  duration: number;
  section: string;
  lyrics: string;
};

type Artist = {
  _id: string;
  name: string;
  bio: string;
  imageUrl: string;
  bannerUrl: string;
  monthlyListeners: number;
  worldRank: number | null;
  topCities: { city: string; country: string; listeners: number }[];
  galleryImages: string[];
};

const emptyForm = { title: "", artist: "", album: "", releaseDate: "", duration: "", section: "Popular", lyrics: "" };
const emptyArtistForm = {
  name: "",
  bio: "",
  monthlyListeners: "",
  worldRank: "",
  topCities: [
    { city: "", country: "", listeners: "" },
    { city: "", country: "", listeners: "" },
    { city: "", country: "", listeners: "" },
  ],
};

const SECTIONS = ["Popular", "New Releases", "Trending", "Featured"];

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

export default function AdminPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"songs" | "artists">("songs");
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [artistModal, setArtistModal] = useState<"add" | "edit" | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [artistFormData, setArtistFormData] = useState(emptyArtistForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingArtistId, setEditingArtistId] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [artistImage, setArtistImage] = useState<File | null>(null);
  const [artistBanner, setArtistBanner] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "admin") {
      setAccessDenied(true);
    }
  }, []);

  const { data: songsData } = useQuery<{ songs: Song[] }>({
    queryKey: ["songs"],
    queryFn: async () => (await fetch(`${API_URL}/api/songs`)).json(),
  });

  const { data: artistsData } = useQuery<{ artists: Artist[] }>({
    queryKey: ["artists"],
    queryFn: async () => (await fetch(`${API_URL}/api/artists`)).json(),
  });

  const songs = songsData?.songs ?? [];
  const artists = artistsData?.artists ?? [];

  const songMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = modalMode === "add"
        ? `${API_URL}/api/songs/add`
        : `${API_URL}/api/songs/${editingId}`;
      const method = modalMode === "add" ? "POST" : "PUT";
      const res = await fetch(url, { method, body: data, headers: authHeaders() });
      if (res.status === 403) { setAccessDenied(true); throw new Error("Admin deyilsiniz"); }
      if (!res.ok) throw new Error("Xəta baş verdi");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      closeModal();
    },
  });

  const deleteSongMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/api/songs/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.status === 403) setAccessDenied(true);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["songs"] }),
  });

  const artistMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = artistModal === "add"
        ? `${API_URL}/api/artists/add`
        : `${API_URL}/api/artists/${editingArtistId}`;
      const method = artistModal === "add" ? "POST" : "PUT";
      const res = await fetch(url, { method, body: data, headers: authHeaders() });
      if (res.status === 403) { setAccessDenied(true); throw new Error("Admin deyilsiniz"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artists"] });
      closeArtistModal();
    },
  });

  const deleteArtistMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/api/artists/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.status === 403) setAccessDenied(true);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["artists"] }),
  });

  const fmtDuration = (seconds: number) => {
    if (!seconds) return "--:--";
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("artist", formData.artist);
    data.append("album", formData.album);
    data.append("section", formData.section);
    data.append("lyrics", formData.lyrics);
    if (formData.releaseDate) data.append("releaseDate", formData.releaseDate);
    if (formData.duration) data.append("duration", formData.duration);
    if (audioFile) data.append("audio", audioFile);
    if (imageFile) data.append("image", imageFile);
    songMutation.mutate(data);
  };

  const handleArtistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", artistFormData.name);
    data.append("bio", artistFormData.bio);
    data.append("monthlyListeners", artistFormData.monthlyListeners);
    if (artistFormData.worldRank) data.append("worldRank", artistFormData.worldRank);
    const cities = artistFormData.topCities.filter(c => c.city && c.country);
    data.append("topCities", JSON.stringify(cities));
    if (artistImage) data.append("image", artistImage);
    if (artistBanner) data.append("banner", artistBanner);
    galleryFiles.forEach(file => data.append("gallery", file));
    artistMutation.mutate(data);
  };

  const openEditSong = (song: Song) => {
    setFormData({
      title: song.title,
      artist: song.artist,
      album: song.album || "",
      releaseDate: song.releaseDate ? song.releaseDate.split("T")[0] : "",
      duration: song.duration ? String(song.duration) : "",
      section: song.section || "Popular",
      lyrics: song.lyrics || "",
    });
    setEditingId(song._id);
    setModalMode("edit");
  };

  const openEditArtist = (artist: Artist) => {
    setArtistFormData({
      name: artist.name,
      bio: artist.bio || "",
      monthlyListeners: artist.monthlyListeners ? String(artist.monthlyListeners) : "",
      worldRank: artist.worldRank ? String(artist.worldRank) : "",
      topCities: [
        artist.topCities?.[0] ? { city: artist.topCities[0].city, country: artist.topCities[0].country, listeners: String(artist.topCities[0].listeners) } : { city: "", country: "", listeners: "" },
        artist.topCities?.[1] ? { city: artist.topCities[1].city, country: artist.topCities[1].country, listeners: String(artist.topCities[1].listeners) } : { city: "", country: "", listeners: "" },
        artist.topCities?.[2] ? { city: artist.topCities[2].city, country: artist.topCities[2].country, listeners: String(artist.topCities[2].listeners) } : { city: "", country: "", listeners: "" },
      ],
    });
    setExistingGallery(artist.galleryImages || []);
    setEditingArtistId(artist._id);
    setArtistModal("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setFormData(emptyForm);
    setAudioFile(null);
    setImageFile(null);
    setEditingId(null);
  };

  const closeArtistModal = () => {
    setArtistModal(null);
    setArtistFormData(emptyArtistForm);
    setArtistImage(null);
    setArtistBanner(null);
    setGalleryFiles([]);
    setExistingGallery([]);
    setEditingArtistId(null);
  };

  const updateCity = (index: number, field: string, value: string) => {
    const updated = [...artistFormData.topCities];
    updated[index] = { ...updated[index], [field]: value };
    setArtistFormData({ ...artistFormData, topCities: updated });
  };

  const removeGalleryFile = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
  };

  const sectionColors: Record<string, string> = {
    Popular: "bg-blue-500/20 text-blue-400",
    "New Releases": "bg-green-500/20 text-green-400",
    Trending: "bg-orange-500/20 text-orange-400",
    Featured: "bg-purple-500/20 text-purple-400",
  };

 
  if (accessDenied) {
    return (
      <div className="flex h-screen bg-[#0a0a0a] items-center justify-center flex-col gap-4">
        <div className="text-red-500 text-6xl">⛔</div>
        <h1 className="text-white text-2xl font-bold">Admin icazəsi yoxdur</h1>
        <p className="text-zinc-400">Bu səhifəyə giriş üçün admin hesabı lazımdır.</p>
        <button
          onClick={() => router.push("/")}
          className="bg-[#1db954] text-black font-bold px-6 py-3 rounded-full hover:scale-105 transition mt-2"
        >
          Ana səhifəyə qayıt
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      <audio ref={audioRef} />

      {/* SIDEBAR */}
      <aside className="w-64 bg-black border-r border-zinc-800 p-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 text-[#1db954] font-bold text-xl">
          <div className="bg-[#1db954] p-1 rounded-full text-black">
            <Music size={20} />
          </div>
          Spotify Admin
        </div>
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("songs")}
            className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition ${activeTab === "songs" ? "bg-zinc-900 text-[#1db954]" : "text-zinc-400 hover:text-white"}`}
          >
            <Music size={18} /> Mahnılar
          </button>
          <button
            onClick={() => setActiveTab("artists")}
            className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition ${activeTab === "artists" ? "bg-zinc-900 text-[#1db954]" : "text-zinc-400 hover:text-white"}`}
          >
            <Users size={18} /> Artistlər
          </button>
        </nav>
        <div className="mt-auto">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition w-full"
          >
            <LogOut size={18} /> Çıx
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              {activeTab === "songs" ? "Mahnıları İdarə Et" : "Artistləri İdarə Et"}
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              {activeTab === "songs" ? `Sistemdə cəmi ${songs.length} mahnı var` : `Sistemdə cəmi ${artists.length} artist var`}
            </p>
          </div>
          <button
            onClick={() => activeTab === "songs" ? setModalMode("add") : setArtistModal("add")}
            className="bg-[#1db954] text-black font-bold px-6 py-3 rounded-full hover:scale-105 transition flex items-center gap-2"
          >
            <Plus size={20} /> {activeTab === "songs" ? "Yeni Mahnı" : "Yeni Artist"}
          </button>
        </div>

        {activeTab === "songs" ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase border-b border-zinc-800">
                  <th className="p-4">Mahnı</th>
                  <th className="p-4">Sənətçi</th>
                  <th className="p-4">Albom</th>
                  <th className="p-4">Section</th>
                  <th className="p-4">Müddət</th>
                  <th className="p-4">Tarix</th>
                  <th className="p-4 text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {songs.map((song) => (
                  <tr key={song._id} className="border-b border-zinc-800/50 hover:bg-white/5 transition group">
                    <td className="p-4 flex items-center gap-3">
                      <img src={song.coverImg || "/placeholder.png"} className="w-10 h-10 rounded object-cover" />
                      <span className="font-medium">{song.title}</span>
                    </td>
                    <td className="p-4 text-zinc-400 text-sm">{song.artist}</td>
                    <td className="p-4 text-zinc-400 text-sm">{song.album || "--"}</td>
                    <td className="p-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sectionColors[song.section] || "bg-zinc-700 text-zinc-300"}`}>
                        {song.section || "Popular"}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400 text-sm">{fmtDuration(song.duration)}</td>
                    <td className="p-4 text-zinc-400 text-sm">
                      {song.releaseDate ? new Date(song.releaseDate).getFullYear() : "--"}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => openEditSong(song)} className="p-2 hover:text-[#1db954]"><Edit2 size={16} /></button>
                        <button onClick={() => deleteSongMutation.mutate(song._id)} className="p-2 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {artists.map((artist) => (
              <div key={artist._id} className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800 hover:bg-zinc-800/50 transition group flex flex-col items-center text-center gap-4">
                <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl ring-4 ring-transparent group-hover:ring-[#1db954] transition">
                  <img src={artist.imageUrl} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-lg">{artist.name}</h3>
                <p className="text-zinc-500 text-sm uppercase tracking-widest">Artist</p>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => openEditArtist(artist)} className="p-2 hover:text-[#1db954]"><Edit2 size={16} /></button>
                  <button onClick={() => deleteArtistMutation.mutate(artist._id)} className="p-2 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MAHNİ MODAL */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-lg flex flex-col gap-5 my-8">
            <h2 className="text-2xl font-bold mb-2">{modalMode === "add" ? "Yeni Mahnı" : "Redaktə Et"}</h2>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Mahnı adı" required className="bg-zinc-800 p-3 rounded-lg outline-none focus:ring-1 ring-[#1db954] text-sm" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <input placeholder="Sənətçi" required className="bg-zinc-800 p-3 rounded-lg outline-none focus:ring-1 ring-[#1db954] text-sm" value={formData.artist} onChange={e => setFormData({ ...formData, artist: e.target.value })} />
            </div>
            <input placeholder="Albom" className="bg-zinc-800 p-3 rounded-lg outline-none focus:ring-1 ring-[#1db954] text-sm" value={formData.album} onChange={e => setFormData({ ...formData, album: e.target.value })} />
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Section</label>
              <div className="grid grid-cols-4 gap-2">
                {SECTIONS.map(s => (
                  <button key={s} type="button" onClick={() => setFormData({ ...formData, section: s })}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold transition border ${formData.section === s ? "bg-[#1db954] text-black border-[#1db954]" : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Buraxılış tarixi" type="date" className="bg-zinc-800 p-3 rounded-lg outline-none focus:ring-1 ring-[#1db954] text-sm text-zinc-400" value={formData.releaseDate} onChange={e => setFormData({ ...formData, releaseDate: e.target.value })} />
              <input placeholder="Müddət (saniyə)" type="number" className="bg-zinc-800 p-3 rounded-lg outline-none focus:ring-1 ring-[#1db954] text-sm" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Mahnının Sözləri (Lyrics)</label>
              <textarea
                placeholder={`LRC formatında yaz:\n[00:00.76]Bye-bye\n[00:03.04]Boy, bye\n\nYoxsa sadə mətn yaz (sinxronizasiya olmaz)`}
                rows={8}
                className="bg-zinc-800 p-3 rounded-lg outline-none focus:ring-1 ring-[#1db954] text-sm resize-none leading-relaxed font-mono"
                value={formData.lyrics}
                onChange={e => setFormData({ ...formData, lyrics: e.target.value })}
              />
              <p className="text-zinc-500 text-xs">💡 Sinxronizasiya üçün LRC format istifadə et. lyricsify.com saytında hazır LRC tapa bilərsən.</p>
            </div>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 p-4 rounded-xl hover:border-[#1db954] cursor-pointer transition">
                <div className="flex items-center gap-2 text-zinc-400 text-sm"><Upload size={18} /> {audioFile ? audioFile.name : "Audio Faylı Seç (.mp3)"}</div>
                <input type="file" accept="audio/*" hidden onChange={e => setAudioFile(e.target.files?.[0] || null)} />
              </label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 p-4 rounded-xl hover:border-[#1db954] cursor-pointer transition">
                <div className="flex items-center gap-2 text-zinc-400 text-sm"><ImageIcon size={18} /> {imageFile ? imageFile.name : "Cover Şəkli Seç"}</div>
                <input type="file" accept="image/*" hidden onChange={e => setImageFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            <div className="flex gap-3 mt-4">
              <button type="button" onClick={closeModal} className="flex-1 p-3 rounded-full font-bold hover:bg-white/5 transition border border-zinc-700">Ləğv Et</button>
              <button type="submit" className="flex-1 bg-[#1db954] text-black p-3 rounded-full font-bold hover:scale-105 transition">{songMutation.isPending ? "Yüklənir..." : "Yadda Saxla"}</button>
            </div>
          </form>
        </div>
      )}

      {/* ARTİST MODAL */}
      {artistModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <form onSubmit={handleArtistSubmit} className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-lg flex flex-col gap-5 my-8">
            <h2 className="text-2xl font-bold">{artistModal === "add" ? "Yeni Artist Əlavə Et" : "Artisti Redaktə Et"}</h2>
            <input
              placeholder="Artistin adı" required
              className="bg-zinc-800 p-3 rounded-lg outline-none focus:ring-1 ring-[#1db954] text-sm"
              value={artistFormData.name} onChange={e => setArtistFormData({ ...artistFormData, name: e.target.value })}
            />
            <textarea
              placeholder="Bio (artistin haqqında məlumat)"
              rows={4}
              className="bg-zinc-800 p-3 rounded-lg outline-none focus:ring-1 ring-[#1db954] text-sm resize-none"
              value={artistFormData.bio} onChange={e => setArtistFormData({ ...artistFormData, bio: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-zinc-400 text-xs uppercase tracking-wider">Monthly Listeners</label>
                <input type="number" placeholder="məs: 106718754"
                  className="bg-zinc-800 p-3 rounded-lg outline-none focus:ring-1 ring-[#1db954] text-sm"
                  value={artistFormData.monthlyListeners} onChange={e => setArtistFormData({ ...artistFormData, monthlyListeners: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-zinc-400 text-xs uppercase tracking-wider">Dünya Sıralaması</label>
                <input type="number" placeholder="məs: 4"
                  className="bg-zinc-800 p-3 rounded-lg outline-none focus:ring-1 ring-[#1db954] text-sm"
                  value={artistFormData.worldRank} onChange={e => setArtistFormData({ ...artistFormData, worldRank: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-zinc-400 text-xs uppercase tracking-wider">Top Şəhərlər</label>
              {artistFormData.topCities.map((city, i) => (
                <div key={i} className="grid grid-cols-3 gap-2">
                  <input placeholder={`Şəhər ${i + 1}`} className="bg-zinc-800 p-2.5 rounded-lg outline-none focus:ring-1 ring-[#1db954] text-sm" value={city.city} onChange={e => updateCity(i, "city", e.target.value)} />
                  <input placeholder="Ölkə (AZ)" className="bg-zinc-800 p-2.5 rounded-lg outline-none focus:ring-1 ring-[#1db954] text-sm" value={city.country} onChange={e => updateCity(i, "country", e.target.value)} />
                  <input placeholder="Dinləyici" type="number" className="bg-zinc-800 p-2.5 rounded-lg outline-none focus:ring-1 ring-[#1db954] text-sm" value={city.listeners} onChange={e => updateCity(i, "listeners", e.target.value)} />
                </div>
              ))}
            </div>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 p-5 rounded-xl hover:border-[#1db954] cursor-pointer transition">
              <div className="flex flex-col items-center gap-2 text-zinc-400 text-sm">
                <ImageIcon size={24} />
                {artistImage ? artistImage.name : "Profil Şəklini Seç"}
              </div>
              <input type="file" accept="image/*" hidden onChange={e => setArtistImage(e.target.files?.[0] || null)} />
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 p-5 rounded-xl hover:border-[#1db954] cursor-pointer transition">
              <div className="flex flex-col items-center gap-2 text-zinc-400 text-sm">
                <ImageIcon size={24} />
                {artistBanner ? artistBanner.name : "Banner Şəklini Seç (Arxa fon)"}
              </div>
              <input type="file" accept="image/*" hidden onChange={e => setArtistBanner(e.target.files?.[0] || null)} />
            </label>
            <div className="flex flex-col gap-3">
              <label className="text-zinc-400 text-xs uppercase tracking-wider">Qalereya Şəkilləri (Slayder üçün)</label>
              {existingGallery.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {existingGallery.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <img src={url} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              {galleryFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {galleryFiles.map((file, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryFile(i)}
                        className="absolute top-0.5 right-0.5 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-zinc-700 p-4 rounded-xl hover:border-[#1db954] cursor-pointer transition text-zinc-400 text-sm">
                <Upload size={18} />
                Şəkil(lər) seç (çoxlu seçmək olar)
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={e => {
                    const files = Array.from(e.target.files || []);
                    setGalleryFiles(prev => [...prev, ...files]);
                  }}
                />
              </label>
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={closeArtistModal} className="flex-1 p-3 rounded-full font-bold hover:bg-white/5 transition border border-zinc-700">Ləğv Et</button>
              <button type="submit" className="flex-1 bg-[#1db954] text-black p-3 rounded-full font-bold hover:scale-105 transition">
                {artistMutation.isPending ? "Yüklənir..." : "Yadda Saxla"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}