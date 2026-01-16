import { useEffect } from "react";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SaaS Template - Home" },
    { name: "description", content: "Welcome to the SaaS Template!" },
  ];
}

export default function Home() {
  useEffect(() => {
    console.log("[HOME] ✅ Component mounted!");
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">SaaS Template</h1>
      <p className="text-gray-600 mb-4">Testing basic React Router 7 setup (no Clerk)</p>
      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
        Test Button
      </button>
    </div>
  );
}
