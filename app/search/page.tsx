import { Suspense } from "react";
import SearchPage from "./SearchPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121212]" />}>
      <SearchPage />
    </Suspense>
  );
}