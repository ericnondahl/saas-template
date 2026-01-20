import { Header } from "./Header";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { Benefits } from "./Benefits";
import { CTA } from "./CTA";
import { Footer } from "./Footer";

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100">
      <Header />
      <main>
        <Hero />
        <Features />
        <Benefits />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
