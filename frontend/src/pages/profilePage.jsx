import React from 'react';
import api from "../api.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect } from 'react';
import { useState } from 'react';

function ProfilePage({user, profile}) {

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
      unlocked: true,
    },
    {
      id: 2,
      name: "14 Day Streak",
      description: "Maintain a 14-day practice streak.",
      unlocked: true,
    },
    {
      id: 3,
      name: "Vowel Virtuoso",
      description: "Complete all vowel lessons.",
      unlocked: true,
    },
    {
      id: 4,
      name: "Consonant Champion",
      description: "Complete all consonant lessons.",
      unlocked: false,
    },
    {
      id: 5,
      name: "Speedy Speaker",
      description: "Complete a lesson in under 2 minutes",
      unlocked: false,
    },
    {
      id: 6,
      name: "Max level",
      description: "Reach max level in any lesson category.",
      unlocked: true,
    },
  ];
  
    const [recentActivity, setRecentActivity] = useState(['']);

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
    }, [user.id]);

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
    }, [user.id]);



  // Profile Page
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Info and Stats */}
        <div className="col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{userData.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Learning Since:</span>{" "}
                {userData.learningSince}
              </p>
              <p>
                <span className="font-semibold">Study Streak:</span>{" "}
                {userData.studyStreak}
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
                {userData.lessonsCompleted}
              </p>
              <p>
                <span className="font-semibold">Practice Sessions:</span>{" "}
                {userData.practiceSessions}
              </p>
              <p>
                <span className="font-semibold">Accuracy Rate:</span>{" "}
                {userData.accuracyRate}
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
                {recentActivity.map((act, index) => (
                  <li key={index} className="text-sm">
                    {act.action}
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