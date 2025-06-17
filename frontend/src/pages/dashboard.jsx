import React from 'react';
import api from "../api.js";
import App from '@/App';
import { useEffect } from 'react';
import { useState } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrophiesCard } from "@/components/trophies";

function Dashboard({user, profile, activities}) {
  const totalLessons = 100;
  const progressValue = (profile.lessonsCompleted / totalLessons) * 100;

  // MOCK achievements for the dashboard
  const recentAchievements = [
    {
      id: 1,
      name: "Perfect Week",
      description: "Complete a lesson every day for 7 days.",
      unlocked: true,
    },
    {
      id: 2,
      name: "14 Day Streak",
      description: "Maintain a 14-day practice streak.",
      unlocked: true,
    },
  ];

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Lessons completed: {profile.lessonsCompleted}/{totalLessons}
            </p>
            <Progress value={progressValue} className="w-[60%] max-w-xs mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button asChild>
              <Link to="/lessons">Continue Lessons</Link>
            </Button>
            <Button asChild>
              <Link to="/lessonsPractice">Practice Pronunciation</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
                {activities.map((act, index) => (
                  <li key={index} className="text-sm">
                    {activities[index]}
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
        
        <TrophiesCard trophies={recentAchievements} />
      </div>
    </div>
  );
}

export default Dashboard;