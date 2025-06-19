import React from 'react';
import api from "../api.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrophiesCard } from "@/components/trophies"; 
import { useEffect } from 'react';
import { useState } from 'react';

function ProfilePage({user, profile, achievements, activities}) {

  const [userData, setUserData] = useState({
    lessonsCompleted: 0,
    practiceSessions: 0, 
    accuracyRate: 0, 
    studyStreak: 0,  
  })
    
// Trying out a mock achievements list
  const allAchievements = [
    {
      id: 1,
      name: "Perfect Week",
      description: "Complete a lesson every day for 7 days.",
      unlocked: achievements[0] ?? false,
    },
    {
      id: 2,
      name: "14 Day Streak",
      description: "Maintain a 14-day practice streak.",
      unlocked: achievements[1] ?? false,
    },
    {
      id: 3,
      name: "Vowel Virtuoso",
      description: "Complete all vowel lessons.",
      unlocked: achievements[2] ?? false,
    },
    {
      id: 4,
      name: "Consonant Champion",
      description: "Complete all consonant lessons.",
      unlocked: achievements[3] ?? false,
    },
    {
      id: 5,
      name: "Speedy Speaker",
      description: "Complete a lesson in under 2 minutes",
      unlocked: achievements[4] ?? false,
    },
    {
      id: 6,
      name: "Max level",
      description: "Reach max level in any lesson category.",
      unlocked: achievements[5] ?? false,
    },
  ];

    const [recentActivity, setRecentActivity] = useState(['']);
    /*
    useEffect(() => {
      const getData = async () => {
        if (!user) return;
        try {
          const fetchedData = await api.get(`/getUserStatistics?uid=${user.uid}`)
          let userStats = fetchedData.data.user_stats
          setUserData(prev => ({
            ...prev,
            lessonsCompleted: userStats.completed_lessons ?? prev.lessonsCompleted,
            accuracyRate: userStats.accuracy_rate ?? prev.accuracyRate,
            practiceSessions: userStats.practice_sessions ?? prev.practiceSessions,
            studyStreak: userStats.study_streak ?? prev.studyStreak
          }));
          console.log(fetchedData.data)
    
        }
        catch (error) {
          console.log(error)
        }
      }
    
      if(user) getData();
    }, [user]);

    useEffect(() => {
        const getActivities = async () => {
            if(!user) return;
            try {
                const fetchedData = await api.get(`/getActivityHistory?uid=${user.uid}`)
                let activities = fetchedData.data.activity_history
                console.log(activities)
                setRecentActivity(activities)
            }
            catch (error) {
             console.log(error)
            }
        }

        if(user) getActivities();
    }, [user]);
        */



  // Profile Page
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Info and Stats */}
        <div className="col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{user.displayName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Learning Since:</span>{" "}
                {user.metadata.creationTime}
              </p>
              <p>
                <span className="font-semibold">Study Streak:</span>{" "}
                {profile.studyStreak}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Lessons Completed:</span>{" "}
                {profile.lessonsCompleted}
              </p>
              <p>
                <span className="font-semibold">Practice Sessions:</span>{" "}
                {profile.practiceSessions}
              </p>
              <p>
                <span className="font-semibold">Accuracy Rate:</span>{" "}
                {profile.accuracyRate}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Achievements and Activity */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <TrophiesCard trophies={allAchievements} />

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {activities.map((act, index) => (
                  <li key={index} className="text-sm">
                    {activities[index]}
                    <span className="text-xs text-muted-foreground block">
                      {act.time}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;