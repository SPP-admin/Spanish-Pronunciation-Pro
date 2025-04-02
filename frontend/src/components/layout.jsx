import React from 'react';
import { Outlet } from 'react-router-dom'; // Import Outlet
import Navbar from './Navbar.jsx'; 

function Layout() {
  return (
    <div className="flex flex-col min-h-screen"> {/* Or your main layout container styling */}
      <Navbar /> {/* Render the Navbar at the top */}
      <main className="flex-grow container mx-auto p-4 md:p-6"> {/* Added flex-grow and basic padding */}
        {/* Outlet renders the matched child route's component */}
        <Outlet />
      </main>
      {/* You could also add a Footer component here if needed */}
      {/* <Footer /> */}
    </div>
  );
}

export default Layout;