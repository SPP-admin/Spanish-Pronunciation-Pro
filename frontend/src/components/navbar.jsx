import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { auth } from "@/firebase"; // Adjust path to your firebase config
import { signOut } from "firebase/auth";


import LOGO from '@/assets/images/LOGO.png';

function Navbar() {
  const location = useLocation();

  const handleLogout = () => {
    signOut(auth);
  };

  // Helper to determine if a link is active to apply the gold underline
  const isActive = (path) => location.pathname === path;

  return (
    <nav 
      className="w-full h-24 px-8 md:px-16 flex items-center justify-between transition-colors duration-500 sticky top-0 z-50 backdrop-blur-md border-b"
      style={{ 
        backgroundColor: "var(--bg-alt)", 
        borderColor: "var(--border-color)",
        color: "var(--text-main)" 
      }}
    >
      {/* 1. Logo Section */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center">
          <img 
            src={LOGO}  // Ensure your logo path is correct
            alt="UCF Logo" 
            className="h-16 w-auto object-contain"
          />
        </Link>
      </div>

      {/* 2. Navigation Links */}
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
            className={`text-xl font-black tracking-tight transition-all hover:opacity-80 relative pb-1`}
            style={{ 
              color: isActive(link.path) ? "var(--brand-gold)" : "var(--text-main)" 
            }}
          >
            {link.name}
            {/* Active Underline Indicator */}
            {isActive(link.path) && (
              <span 
                className="absolute bottom-0 left-0 w-full h-1 rounded-full"
                style={{ backgroundColor: "var(--brand-gold)" }}
              />
            )}
          </Link>
        ))}
      </div>

      {/* 3. Action Section */}
      <div className="flex items-center">
        <Button 
          onClick={handleLogout}
          className="rounded-full px-8 py-2 font-black text-sm uppercase tracking-widest transition-transform active:scale-95 shadow-lg"
          style={{ 
            backgroundColor: "var(--brand-gold)", 
            color: "#000000" // Always black text on the gold button for readability
          }}
        >
          Log Out
        </Button>
      </div>
    </nav>
  );
}

export default Navbar;