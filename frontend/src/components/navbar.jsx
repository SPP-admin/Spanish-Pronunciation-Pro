import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import LOGO from '@/assets/images/LOGO.png';

function Navbar() {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      // 1. Clear the theme/settings from localStorage
      localStorage.removeItem("theme");
      localStorage.removeItem("app-brand-color");
      localStorage.removeItem("app-font");
      localStorage.removeItem("app-text-color");
      localStorage.removeItem("app-font-size");

      // 2. Notify the app to reset the CSS variables to defaults
      window.dispatchEvent(new Event("theme-update"));

      // 3. Sign out from Firebase/Auth
      await signOut(auth);
      
      console.log("Logged out and preferences cleared.");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
 // const handleLogout = () => signOut(auth);
  
  const isActive = (path) => location.pathname === path;

  return (
    <nav 
      className="w-full h-24 px-8 md:px-16 flex items-center justify-between transition-all duration-500 sticky top-0 z-50 border-b"
      style={{ 
       
        backgroundColor: "var(--bg-card)", 
        borderColor: "var(--border-color)",
        color: "var(--text-main)",
        boxShadow: "none",
        opacity: 1
      }}
    >
      {}
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center hover:scale-105 transition-transform">
          <img src={LOGO} alt="Logo" className="h-14 w-auto object-contain" />
        </Link>
      </div>

      {}
      <div className="hidden md:flex items-center gap-12">
        {[
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Lessons', path: '/lessons' },
          { name: 'Settings', path: '/settings' },
          { name: 'Profile', path: '/profile' },
        ].map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="text-lg font-black tracking-tighter transition-all hover:opacity-70 relative pb-1"
            style={{ color: isActive(link.path) ? "var(--brand-gold)" : "var(--text-main)" }}
          >
            {link.name}
            {isActive(link.path) && (
              <span 
                className="absolute bottom-[-4px] left-0 w-full h-[3px] rounded-full"
                style={{ backgroundColor: "var(--brand-gold)" }}
              />
            )}
          </Link>
        ))}
      </div>

      <div className="flex items-center">
        <Button 
          onClick={handleLogout}
          className="rounded-full px-8 py-6 font-black text-xs uppercase tracking-widest transition-all active:scale-95 border-none shadow-none"
          style={{ backgroundColor: "var(--brand-gold)", color: "#000000" }}
        >
          Log Out
        </Button>
      </div>
    </nav>
  );
}

export default Navbar;