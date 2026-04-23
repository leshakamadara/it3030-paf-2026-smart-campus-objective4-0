import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Wrench, Building, ArrowRight } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/ui/floating-particles";

export function LandingPage() {
  const { isAuthenticated } = useAuth();

  // If the user is already authenticated, don't show the landing page.
  // Send them directly to the dashboard.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-svh flex flex-col bg-[#f7f8f8] text-[#191a1b] selection:bg-[#5e6ad2] selection:text-white font-sans overflow-x-hidden">
      {/* Navigation */}
      <header className="absolute top-0 left-0 w-full z-50">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <img src="/HelaUni.png" alt="HelaUni Logo" className="h-6 w-auto object-contain" />
            <span className="text-sm font-[590] tracking-[0.02em] text-[#191a1b]">HelaUni.app</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-sm font-[510] text-[#43464b] hover:text-[#191a1b] transition-colors"
            >
              Log in
            </Link>
            <Button
              asChild
              className="h-8 rounded-full bg-[#f3f4f5] hover:bg-[#e8ebf0] text-[#191a1b] border border-[#d0d6e0] text-xs font-[510] px-4 transition-all"
            >
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative flex-1 flex flex-col items-center justify-center w-full">
        <FloatingParticles />
        
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-15 blur-[120px] rounded-full bg-gradient-to-b from-[#5e6ad2] to-transparent pointer-events-none" />

        {/* Hero Section */}
        <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="mb-6 inline-flex items-center rounded-full border border-[#d0d6e0] bg-[#ffffff] px-3 py-1 text-xs font-[510] text-[#62666d] shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#5e6ad2] mr-2"></span>
              HelaUni.app
            </div>
            
            <h1 className="max-w-3xl text-5xl sm:text-6xl md:text-7xl font-[590] tracking-[-0.044em] text-[#191a1b] leading-[1.1]">
              Engineered for the modern campus.
            </h1>
            
            <p className="mt-6 max-w-2xl text-lg sm:text-xl text-[#62666d] font-light tracking-tight leading-relaxed">
              A unified operating system for your entire university. Streamline facility bookings, 
              manage maintenance incidents, and track resource analytics—all from a single, beautiful interface.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <Button
                asChild
                className="group h-12 rounded-full bg-[#5e6ad2] hover:bg-[#7170ff] text-white px-8 text-sm font-[510] transition-all shadow-[0_0_20px_rgba(94,106,210,0.3)] hover:shadow-[0_0_30px_rgba(113,112,255,0.5)]"
              >
                <Link to="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full bg-[#ffffff] hover:bg-[#f3f4f5] border-[#d0d6e0] text-[#43464b] hover:text-[#191a1b] px-8 text-sm font-[510] transition-all shadow-sm"
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </motion.div>
        </section>


      </main>

      {/* Footer */}
      <footer className="border-t border-[#d0d6e0] py-8 px-6 text-center">
        <p className="text-xs text-[#62666d]">
          &copy; {new Date().getFullYear()} HelaUni.app - Engineered for Excellence .
        </p>
      </footer>
    </div>
  );
}
