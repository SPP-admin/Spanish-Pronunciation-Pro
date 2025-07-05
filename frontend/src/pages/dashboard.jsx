import React from 'react';
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
import { useProfile } from '@/profileContext.jsx';
import { achievements } from '../achievements.js';

function Dashboard({user}) {

  const { profile } = useProfile();
  const totalLessons = 62;
  const progressValue = (profile.lessonsCompleted / totalLessons) * 100;
  const localAchievements = structuredClone(achievements);

  // Match achievements to database achievements
    for (const key in localAchievements) {
      if(profile?.achievements[key]?.completed == true) {
        localAchievements[key].unlocked = true;
        localAchievements[key].completionDate = profile.achievements[key].completion_date
      } else localAchievements[key].unlocked = false;
    }
    
  // Sort by date and take the first 2 most recent.
  const recentAchievements = Object.values(localAchievements)
  .filter(localAchievement => localAchievement?.unlocked === true)
  .sort((a,b) => b.completionDate - a.completionDate)
  .slice(0,2);


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
                {profile.activities.map((activity, index) => (
                  <li key={index} className="text-sm">
                    {activity}
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