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
  // Placeholder data - This will come from the backend later...
  const [userData, setUserData] = useState({
    name: " ", 
    learningSince: " ", 
    lessonsCompleted: 0,
    practiceSessions: 0, 
    accuracyRate: 0, 
    studyStreak: 0,  
  })

  const achievements = ["Perfect Week", "10 Day Streak", "Level 5"];
  const recentActivity = [
    { action: "Completed Lesson 5: Common Phrases", time: "2 hours ago" },
    { action: "Practice Session: Greetings", time: "Yesterday" },
    { action: "Earned Perfect Pronunciation Badge", time: "3 days ago" },
  ]; 

  useEffect(() => {
  const getData = async () => {

    if (!user) return;
    try {
      const fetchedData = await api.get(`/getUserStatistics?uid=${user.uid}`)
      let userStats = fetchedData.data
      setUserData(prevData => ({
        ...prevData,
        lessonsCompleted: userStats.completed_lessons,
        accuracyRate: userStats.accuracy_rate,
        practiceSessions: userStats.practice_sessions,
        studyStreak: userStats.study_streak,  
      }));
      console.log(userStats)

    }
    catch (error) {
      console.log(error)
    }
  }

  if(user) getData();
}, [user]);

  return (
    <div>
      <h1>Dashboard</h1>
      <section>
        <h2>Your Progress</h2>
        <p>Lessons completed: {userData.lessonsCompleted}/{totalLessons}</p>
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