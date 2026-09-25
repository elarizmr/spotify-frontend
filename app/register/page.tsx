"use client";
import { API_URL } from "@/lib/config";
import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function Register() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    birthDay: "",
    birthMonth: "", 
    birthYear: "",
    gender: "",
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const hasLetter = /[a-zA-Z]/.test(formData.password);
  const hasNumberOrSpecial = /[0-9!@#$%^&*(),.?":{}|<>]/.test(formData.password);
  const hasMinLength = formData.password.length >= 10;

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Qeydiyyat xətası");
      return res.json();
    },
    onSuccess: () => {
      router.push("/login");
    },
  });

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center pt-8 px-4 font-sans selection:bg-[#1ed760] selection:text-black">
    
      <div className="mb-6">
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.49 17.306c-.22.36-.683.475-1.042.256-2.88-1.76-6.5-2.16-10.763-1.185-.41.094-.822-.162-.916-.572-.094-.41.162-.822.572-.916 4.664-1.066 8.64-.612 11.892 1.375.36.22.475.682.257 1.042zm1.464-3.262c-.276.45-.86.594-1.31.32-3.298-2.028-8.324-2.616-12.223-1.432-.505.153-1.037-.13-1.19-.636-.153-.506.13-1.037.636-1.19 4.456-1.353 10.003-.7 13.768 1.615.45.277.594.86.32 1.312zm.126-3.415C15.085 8.164 8.487 7.945 4.65 9.11c-.63.192-1.295-.163-1.487-.794-.192-.63.163-1.296.794-1.487 4.407-1.338 11.7-1.087 16.32 1.655.567.336.755 1.07.418 1.637-.336.568-1.07.755-1.637.42z" />
        </svg>
      </div>

  
      {step > 1 && (
        <div className="w-full max-w-[420px] bg-[#404040] h-0.5 mb-10">
          <div
            className="bg-[#1ed760] h-full transition-all duration-500"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          ></div>
        </div>
      )}

      <div className="w-full max-w-[324px] flex-1">
        
        {step === 1 && (
             <div className="flex flex-col gap-6">
             <h1 className="text-[40px] md:text-[48px] font-bold text-center leading-[1.1] tracking-[-0.04em] max-w-[300px] mx-auto">
               Sign up to start listening
             </h1>
             <div className="flex flex-col gap-2">
               <label className="text-sm font-bold">Email address</label>
               <input
                 type="email"
                 placeholder="name@domain.com"
                 className="bg-[#121212] border border-[#878787] rounded-[4px] p-3 focus:border-[#1ed760] focus:ring-1 focus:ring-[#1ed760] outline-none text-sm placeholder-[#757575]"
                 value={formData.email}
                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
               />
             </div>
             <button
               onClick={() => formData.email && nextStep()}
               className="bg-[#1ed760] text-black font-bold p-[14px] rounded-full hover:scale-105 transition-all active:scale-95"
             >
               Next
             </button>
             <div className="flex items-center my-4">
               <div className="flex-1 border-t border-[#292929]"></div>
               <span className="px-4 text-xs font-bold text-[#a7a7a7]">or</span>
               <div className="flex-1 border-t border-[#292929]"></div>
             </div>
 
             <div className="flex flex-col gap-3">
               <button className="flex items-center justify-center gap-3 border border-[#878787] rounded-full p-[12px] font-bold hover:border-white transition-all text-sm">
                <svg viewBox="0 0 48 48" className="w-6 h-6" fill="currentColor">
  <path d="M44.5 20H24v8.5h11.8C34.6 33.9 29.9 37 24 37
           c-7.2 0-13-5.8-13-13s5.8-13 13-13
           c3.1 0 5.9 1.1 8.1 3.1l6-6C34.6 4.7 29.6 2.5 24 2.5
           12.7 2.5 3.5 11.7 3.5 23S12.7 43.5 24 43.5
           44.5 34.3 44.5 23c0-1-.1-2-.3-3z"/>
</svg>
                 Sign up with Google
               </button>
               <button className="flex items-center justify-center gap-3 border border-[#878787] rounded-full p-[12px] font-bold hover:border-white transition-all text-sm">
                 <svg viewBox="0 0 384 512" className="w-6 h-6" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 21.8-88.5 21.8-11.4 0-51.1-20.8-82.3-20.1-42 .6-80.8 24.4-102.3 61.9-44.5 77-11.5 191.8 31.3 253.5 21 30 45.9 63.5 77.2 62.6 31.3-.9 42.9-20.1 81.3-20.1s49.1 20.1 81.6 19.3c32.5-.8 54.4-30.2 75.3-60.7 24.1-35.2 34-69.4 34.4-71.1-.9-.3-66.2-25.4-66.4-101.3zM290.7 92.1c34.6-41.7 32.6-78.5 31.2-92.1-30 1.9-63.1 21.3-84.3 45.3-18.7 21.3-35.3 54.9-29.5 87.8 33.7 2.6 64-18.4 82.6-41z" /></svg>
                 Sign up with Apple
               </button>
             </div>
 
             <p className="text-center mt-8 text-[#a7a7a7] text-sm">
               Already have an account? <Link href="/login" className="text-white underline font-bold ml-1">Log in</Link>
             </p>
           </div>
        )}

        {step === 2 && (
             <div className="flex flex-col gap-6 animate-fadeIn">
             <div className="flex items-center gap-4 text-[#a7a7a7]">
               <button onClick={prevStep} className="hover:text-white transition-colors">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
               </button>
               <div className="flex flex-col">
                 <span className="text-xs font-bold text-[#a7a7a7]">Step 1 of 3</span>
                 <span className="text-white font-bold">Create a password</span>
               </div>
             </div>
             <div className="flex flex-col gap-2 relative">
               <label className="text-sm font-bold">Password</label>
               <div className="relative">
                 <input
                   type={showPassword ? "text" : "password"}
                   className="w-full bg-[#121212] border border-[#878787] rounded-[4px] p-3 pr-10 focus:border-[#1ed760] outline-none text-sm"
                   value={formData.password}
                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                 />
                 <button 
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a7a7a7] hover:text-white transition-colors"
                 >
                   {showPassword ? (
                     <svg role="img" height="20" width="20" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>
                     </svg>
                   ) : (
                     <svg role="img" height="20" width="20" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M11.83 9L15 12.17V12a3 3 0 00-3-3h-.17zm.05 4.5l-1.38-1.38A3.04 3.04 0 0012 15a3 3 0 003-3 3.04 3.04 0 00-.12-.45l1.38 1.38c.15.34.24.7.24 1.07 0 1.66-1.34 3-3-3-.37 0-.73-.09-1.07-.24l1.33 1.33c.12.02.24.04.37.04 5 0 9.27-3.11 11-7.5a11.79 11.79 0 00-3.95-4.88L19.14 8.7a8.6 8.6 0 012.8 3.3c-1.62 3.69-5.28 6.5-9.94 6.5-.5 0-.98-.04-1.46-.11l1.33-1.33V12c0-.37.09-.73.24-1.07zm-7.44-8L3 6.94l2.58 2.58a11.72 11.72 0 00-3.58 3.48c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l2.42 2.42 1.41-1.41L4.39 4.5zM12 7c.5 0 .98.04 1.46.11L11.83 8.73A3.012 3.012 0 009 11.56L7.39 9.95A8.6 8.6 0 0112 7z"></path>
                     </svg>
                   )}
                 </button>
               </div>
               <div className="mt-4 space-y-2 text-[13px]">
                 <p className="font-bold text-white">Your password must contain at least</p>
                 <p className="flex items-center gap-2">
                   {hasLetter ? (
                     <span className="flex items-center justify-center min-w-[16px] h-[16px] bg-[#1ed760] rounded-full text-black text-[9px] font-bold">✓</span>
                   ) : (
                     <span className="inline-block min-w-[16px] h-[16px] border border-[#878787] rounded-full"></span>
                   )}
                   <span>1 letter</span>
                 </p>
                 <p className="flex items-center gap-2">
                   {hasNumberOrSpecial ? (
                     <span className="flex items-center justify-center min-w-[16px] h-[16px] bg-[#1ed760] rounded-full text-black text-[9px] font-bold">✓</span>
                   ) : (
                     <span className="inline-block min-w-[16px] h-[16px] border border-[#878787] rounded-full"></span>
                   )}
                   <span>1 number or special character (example: # ? ! &)</span>
                 </p>
                 <p className="flex items-center gap-2">
                   {hasMinLength ? (
                     <span className="flex items-center justify-center min-w-[16px] h-[16px] bg-[#1ed760] rounded-full text-black text-[9px] font-bold">✓</span>
                   ) : (
                     <span className="inline-block min-w-[16px] h-[16px] border border-[#878787] rounded-full"></span>
                   )}
                   <span>10 characters</span>
                 </p>
               </div>
             </div>
             <button
               onClick={() => hasMinLength && hasLetter && hasNumberOrSpecial && nextStep()}
               className="bg-[#1ed760] text-black font-bold p-[14px] rounded-full hover:scale-105 transition-all mt-4 disabled:opacity-50"
               disabled={!(hasMinLength && hasLetter && hasNumberOrSpecial)}
             >
               Next
             </button>
           </div>
        )}

        
        {step === 3 && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="flex items-center gap-4 text-[#a7a7a7]">
              <button onClick={prevStep}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg></button>
              <div className="flex flex-col"><span className="text-xs font-bold text-[#a7a7a7]">Step 2 of 3</span><span className="text-white font-bold">Tell us about yourself</span></div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold">Name</label>
              <p className="text-xs text-[#a7a7a7]">This name will appear on your profile</p>
              <input className="bg-[#121212] border border-[#878787] rounded-[4px] p-3 outline-none focus:border-[#1ed760] text-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold">Date of birth</label>
              <p className="text-xs text-[#a7a7a7]">Why do we need your date of birth? <span className="underline cursor-pointer">Learn more.</span></p>
              <div className="flex gap-2 mt-1">
                
                <input 
                  placeholder="dd" 
                  className="w-[70px] bg-[#121212] border border-[#878787] rounded-[4px] p-3 text-sm outline-none focus:border-[#1ed760] placeholder-[#757575]" 
                  value={formData.birthDay} 
                  onChange={(e) => setFormData({ ...formData, birthDay: e.target.value })} 
                />
                
              
                <select 
                  className="flex-1 bg-[#121212] border border-[#878787] rounded-[4px] p-3 text-sm outline-none focus:border-[#1ed760] appearance-none" 
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1em'
                  }}
                  value={formData.birthMonth} 
                  onChange={(e) => setFormData({ ...formData, birthMonth: e.target.value })}
                >
                  <option value="" disabled hidden>Month</option>
                  {months.map(m => <option key={m} value={m} className="bg-[#282828] text-white">{m}</option>)}
                </select>

               
                <input 
                  placeholder="yyyy" 
                  className="w-[90px] bg-[#121212] border border-[#878787] rounded-[4px] p-3 text-sm outline-none focus:border-[#1ed760] placeholder-[#757575]" 
                  value={formData.birthYear} 
                  onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })} 
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold">Gender</label>
              <p className="text-xs text-[#a7a7a7]">We use your gender to help personalize our content recommendations and ads for you.</p>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {["Man", "Woman", "Non-binary", "Something else", "Prefer not to say"].map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" name="gender" className="accent-[#1ed760] w-4 h-4" checked={formData.gender === g} onChange={() => setFormData({ ...formData, gender: g })} />
                    {g}
                  </label>
                ))}
              </div>
            </div>
            <button onClick={nextStep} className="bg-[#1ed760] text-black font-bold p-[14px] rounded-full mt-4 hover:scale-105 transition-all">Next</button>
          </div>
        )}

        {step === 4 && (
           <div className="flex flex-col gap-6 animate-fadeIn">
           <div className="flex items-center gap-4 text-[#a7a7a7]">
             <button onClick={prevStep}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg></button>
             <div className="flex flex-col"><span className="text-xs font-bold">Step 3 of 3</span><span className="text-white font-bold">Terms & Conditions</span></div>
           </div>
           <div className="space-y-3">
             <label className="bg-[#242424] p-4 rounded-[4px] flex gap-3 cursor-pointer text-[13px]">
               <input type="checkbox" className="accent-[#1ed760] w-4 h-4 mt-0.5" />
               <span>Please send me news and offers from Spotify</span>
             </label>
             <label className="bg-[#242424] p-4 rounded-[4px] flex gap-3 cursor-pointer text-[13px]">
               <input type="checkbox" className="accent-[#1ed760] w-4 h-4 mt-0.5" />
               <span>Share my registration data with Spotify's content providers for marketing purposes.</span>
             </label>
           </div>

           <div className="flex flex-col gap-4 mt-2">
             <p className="text-[11px] text-white leading-relaxed">
               Spotify is a personalised service.
             </p>
             <p className="text-[11px] text-white leading-relaxed">
               By clicking on sign-up, you agree to Spotify's{" "}
               <span className="text-[#1ed760] underline cursor-pointer hover:no-underline">Terms and Conditions of Use</span>.
             </p>
             <p className="text-[11px] text-white leading-relaxed">
               By clicking on sign-up, you agree to the{" "}
               <span className="text-[#1ed760] underline cursor-pointer hover:no-underline">Spotify Privacy Policy</span>.
             </p>
           </div>

           <button onClick={() => mutation.mutate(formData)} className="bg-[#1ed760] text-black font-bold p-[16px] rounded-full mt-4 hover:scale-105 transition-all">Sign up</button>
         </div>
        )}
      </div>

   
      <div className="w-full max-w-[324px] py-8">
        <p className="text-[10px] text-[#a7a7a7] text-center leading-tight">
          This site is protected by reCAPTCHA and the Google <br />
          <span className="underline cursor-pointer">Privacy Policy</span> and <span className="underline cursor-pointer">Terms of Service</span> apply.
        </p>
      </div>
    </div>
  );
}