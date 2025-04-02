import React from 'react';
// Import components as needed, ex, Card for layout
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Dashboard() {
  // Placeholder data - This will come from the backend later...
  const userData = {
    name: "Jose Luna", 
    learningSince: "January 2025", 
    lessonsCompleted: 24,
    practiceSessions: 56, 
    accuracyRate: "78%", 
    studyStreak: "12 days", 
  };
  const achievements = ["Perfect Week", "10 Day Streak", "Level 5"];
  const recentActivity = [
    { action: "Completed Lesson 5: Common Phrases", time: "2 hours ago" },
    { action: "Practice Session: Greetings", time: "Yesterday" },
    { action: "Earned Perfect Pronunciation Badge", time: "3 days ago" },
  ]; 

  return (
    <div className="container mx-auto p-4 md:p-6"> {/* Basic container */}
      <h2 className="text-3xl font-bold mb-6">Your Dashboard - Soon to be Profile page.</h2>

      {/* Layout based on Mockup (using placeholders) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* User Info Placeholder */}
        <div className="md:col-span-1 p-4 border rounded-lg shadow">
           <h3 className="text-xl font-semibold mb-2">{userData.name}</h3>
           <p className="text-sm text-muted-foreground">Learning since {userData.learningSince}</p>
        </div>

         {/* Statistics Placeholder */}
        <div className="md:col-span-1 p-4 border rounded-lg shadow">
           <h3 className="text-xl font-semibold mb-2">Statistics</h3>
           <p>Lessons Completed: {userData.lessonsCompleted}</p>
           <p>Practice Sessions: {userData.practiceSessions}</p>
           <p>Accuracy Rate: {userData.accuracyRate}</p>
           <p>Study Streak: {userData.studyStreak}</p>
        </div>

         {/* Achievements Placeholder */}
         <div className="md:col-span-1 p-4 border rounded-lg shadow">
           <h3 className="text-xl font-semibold mb-2">Achievements</h3>
           <ul>
             {achievements.map((ach, index) => <li key={index}>{ach}</li>)}
           </ul>
         </div>

         {/* Recent Activity Placeholder */}
         <div className="md:col-span-3 p-4 border rounded-lg shadow">
           <h3 className="text-xl font-semibold mb-2">Recent Activity</h3>
           <ul>
              {recentActivity.map((act, index) => (
                <li key={index} className="text-sm mb-1">
                  {act.action} - <span className="text-muted-foreground">{act.time}</span>
                </li>
              ))}
           </ul>
         </div>
      </div>
    </div>
  );
}

export default Dashboard;