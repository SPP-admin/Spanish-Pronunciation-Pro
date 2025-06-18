import React from 'react';
import api from "../api.js";
import App from '@/App';
import { useEffect } from 'react';
import { useState } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Import components as needed, ex, Card for layout
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Dashboard({user}) {
  const lessonsCompleted = 26;
  const totalLessons = 100;
  const progressValue = (lessonsCompleted / totalLessons) * 100;

  const achievements = ["Perfect Week", "10 Day Streak", "Level 5"];
  const recentActivity = [
    { action: "Completed Lesson 5: Common Phrases", time: "2 hours ago" },
    { action: "Practice Session: Greetings", time: "Yesterday" },
    { action: "Earned Perfect Pronunciation Badge", time: "3 days ago" },
  ]; 

  return (
    <div>
      <h1>Dashboard</h1>
      <section>
        <h2>Your Progress</h2>
        <p>Lessons completed: {lessonsCompleted}/{totalLessons}</p>
        <Progress value={progressValue} className="w-[60%] max-w-xs" />
      </section>

      <section>
        <h2>Quick Actions</h2>
        <Button asChild>
          <Link to="/lessons">Continue Lessons</Link>
        </Button>
        <Button asChild>
          <Link to="/lessonsPractice">Practice Pronunciation</Link>
        </Button>
      </section>

      <section>
        <h2>Recent Activity</h2>
        <ul>
          <li>Lesson 5 completed - 2 days ago</li>
          <li>Practiced pronunciation - 1 day ago</li>
        </ul>
      </section>

      <section>
        <h2>Achievements </h2>
        <p> 3-day practice streak!<br/></p>
      </section>
    </div>
  );
}

export default Dashboard;