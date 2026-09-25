"use client";
import { API_URL } from "@/lib/config";
import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (loginData: any) => {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Giriş xətası");
      }
      return res.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.id);
      sessionStorage.setItem('showSplash', 'true');
      alert(`Xoş gəldin, ${data.user.name}!`);
      router.push("/");
    },
    onError: (error: any) => {
      alert(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      mutation.mutate({ email, password });
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center pt-10 px-4">
      <div className="mb-10">
        <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.49 17.306c-.22.36-.683.475-1.042.256-2.88-1.76-6.5-2.16-10.763-1.185-.41.094-.822-.162-.916-.572-.094-.41.162-.822.572-.916 4.664-1.066 8.64-.612 11.892 1.375.36.22.475.682.257 1.042zm1.464-3.262c-.276.45-.86.594-1.31.32-3.298-2.028-8.324-2.616-12.223-1.432-.505.153-1.037-.13-1.19-.636-.153-.506.13-1.037.636-1.19 4.456-1.353 10.003-.7 13.768 1.615.45.277.594.86.32 1.312zm.126-3.415C15.085 8.164 8.487 7.945 4.65 9.11c-.63.192-1.295-.163-1.487-.794-.192-.63.163-1.296.794-1.487 4.407-1.338 11.7-1.087 16.32 1.655.567.336.755 1.07.418 1.637-.336.568-1.07.755-1.637.42z"/>
        </svg>
      </div>

      <div className="w-full max-w-[324px] flex flex-col items-center">
        <h1 className="text-white text-[32px] md:text-[48px] font-bold mb-10 text-center tracking-tighter">
          Welcome back
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <div className="flex flex-col gap-2 mb-2">
            <label className="text-white font-bold text-sm ml-1">Email or username</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email or username"
              className="bg-[#121212] border border-gray-500 rounded-md p-3 text-white focus:border-white focus:border-2 outline-none transition-all placeholder:text-gray-500"
            />
          </div>

          <div className="flex flex-col gap-2 mb-2">
            <label className="text-white font-bold text-sm ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="bg-[#121212] border border-gray-500 rounded-md p-3 text-white focus:border-white focus:border-2 outline-none transition-all placeholder:text-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-[#1ed760] text-black font-bold p-3 rounded-full hover:scale-105 transition-transform duration-200 w-full text-base mb-2 disabled:opacity-50"
          >
            {mutation.isPending ? "Logging in..." : "Continue"}
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-[#292929]"></div>
            <span className="px-4 text-white text-sm font-bold">or</span>
            <div className="flex-1 border-t border-[#292929]"></div>
          </div>

          <div className="flex flex-col gap-3">
            <button type="button" className="flex items-center justify-center gap-3 border border-gray-500 rounded-full p-3 font-bold hover:border-white transition-colors w-full group text-white">
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              Continue with Google
            </button>
            <button type="button" className="flex items-center justify-center gap-3 border border-gray-500 rounded-full p-3 font-bold hover:border-white transition-colors w-full bg-transparent text-white">
              <span className="text-blue-500 text-xl">f</span>
              Continue with Facebook
            </button>
            <button type="button" className="flex items-center justify-center gap-3 border border-gray-500 rounded-full p-3 font-bold hover:border-white transition-colors w-full text-white">
              <span className="text-2xl leading-none"></span>
              Continue with Apple
            </button>
          </div>

          <div className="mt-10 text-center border-t border-[#292929] pt-8">
            <p className="text-[#a7a7a7] text-sm font-medium">
              Don't have an account?{" "}
              <Link href="/register" className="text-white underline hover:text-[#1ed760] ml-1">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>

      <p className="text-[11px] text-[#a7a7a7] mt-12 text-center max-w-[450px]">
        This site is protected by reCAPTCHA and the Google
        <span className="underline ml-1">Privacy Policy</span> and
        <span className="underline ml-1">Terms of Service</span> apply.
      </p>
    </div>
  );
}