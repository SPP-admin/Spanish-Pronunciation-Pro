import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // Adjust path if needed

const Layout = ({ user }) => {
  return (
    /* OUTER WRAPPER: Matches the background-color variable site-wide */
    <div className="relative w-full min-h-screen transition-colors duration-500 overflow-x-hidden"
         style={{ backgroundColor: "var(--bg-main)" }}>
      
      {/* THE GLOBAL YELLOW SHADING
          - 'fixed' keeps them in the corners even when you scroll
          - 'z-0' keeps them behind the content
          - 'transition-opacity' makes the theme switch smooth
      */}
      <div className="fixed top-[-20%] left-[-15%] w-[1200px] h-[1000px] blur-[250px] rounded-full pointer-events-none opacity-20 dark:opacity-35 transition-all duration-700 z-0" 
           style={{ backgroundColor: "var(--brand-gold)" }} />
      
      <div className="fixed bottom-[-15%] right-[-15%] w-[1000px] h-[900px] blur-[230px] rounded-full pointer-events-none opacity-10 dark:opacity-20 transition-all duration-700 z-0" 
           style={{ backgroundColor: "var(--brand-gold)" }} />

      {/* CONTENT LAYER: Navbar + Page Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar user={user} />
        <main className="flex-grow w-full">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
};

export default Layout;