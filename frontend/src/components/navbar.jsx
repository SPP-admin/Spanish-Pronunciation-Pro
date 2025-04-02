import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"; // For potential profile icon/link

function Navbar() {
  return (
    <nav className="bg-card text-card-foreground shadow-sm py-2 px-4 md:px-6 border-b"> 
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo/Brand */}
        <Link to="/" className="text-xl font-bold text-primary"> {/* Using primary color from theme */}
        ¡Pronunciemos!
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-4 md:space-x-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Home</Link>
          <Link to="/lessons" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Lessons</Link>
          <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Progress</Link> 
          <Link to="/profile" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Profile</Link> 
        </div>
      </div>
    </nav>
  );
}

export default Navbar;