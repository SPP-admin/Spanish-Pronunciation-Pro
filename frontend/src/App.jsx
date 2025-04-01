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
  {/* Single Button to navigate to the Login Page */}
  <Button asChild variant = "default"
  className = "bg-brand-blue text-white hover:bg-brand-blue-hover">
    {/* Make sure 'to' matches the path in your Route definition */}
    <Link to="/login">Go to Login Page</Link>
  </Button>
  {/* Add more buttons for other pages as needed */}
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
      {/* Define where the matched route component should render */}
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