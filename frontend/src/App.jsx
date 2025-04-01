import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"; // Import Shadcn Button
import LoginPage from './pages/LoginPage.jsx'; // Import LoginPage component
import LessonsPage from './pages/LessonsPage.jsx'; // Import LessonsPage component


function HomePage() {
  return (
    <div>
      <h1>Spanish Pronunciation Pro</h1>

{/* --- Navigation Area --- */}
<nav style={{ marginBottom: '20px' }}>

  <Button asChild variant = "default"
  className = "bg-brand-blue text-white hover:bg-brand-blue-hover">
   
    <Link to="/login">Go to Login Page</Link>
  </Button>

  <Button asChild variant = "default"
  className = "bg-brand-blue text-white hover:bg-brand-blue-hover">
    <Link to="/lessons">Go to Lessons Page</Link>
  </Button>

</nav>
      <h2>Home Page</h2>
      <p>This is the initial page. Click the button below to go to Login.</p>
    </div>
  );
}

function App() {
  return (
    <div>

      {/* --- Route Display Area --- */}
      <Routes>
        {/* Route for the initial page */}
        <Route path="/" element={<HomePage />} />
        {/* Route for the login page */}
        <Route path="/login" element={<LoginPage />} />
        {/* Remove other routes like /lessons for now if desired */}
        <Route path="/lessons" element={<LessonsPage />} />
      </Routes>
    </div>
  );
}
export default App;