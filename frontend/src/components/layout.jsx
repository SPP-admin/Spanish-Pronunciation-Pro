import React, { useState } from 'react';
import { Outlet } from 'react-router-dom'; 
import Navbar from './navbar.jsx';

function Layout() {
  const [profilePic, setProfilePic] = useState(
    `https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff`
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar profilePic={profilePic} />
      <main className="flex-grow container mx-auto p-4 md:p-6"> 
        <Outlet context={{ profilePic, setProfilePic }} />
      </main>
    </div>
  );
}

export default Layout;