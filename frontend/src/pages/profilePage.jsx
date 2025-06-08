import React from 'react';
import api from "../api.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect } from 'react';
import { useState } from 'react';

function ProfilePage({user, profile}) {

  const [userData, setUserData] = useState({
    name: " ", 
    learningSince: " ", 
    lessonsCompleted: 0,
    practiceSessions: 0, 
    accuracyRate: 0, 
    studyStreak: 0,  
  })
    
    const achievements = ["Perfect Week", "10 Day Streak", "Level 5"];
    const [recentActivity, setRecentActivity] = useState(['']);

    useEffect(() => {
      const getData = async () => {
        console.log(user)
    
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



    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* User Info Card */}
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Name: {profile.name}</p>
                    <p>Learning Since: {profile.creationDate}</p>
                </CardContent>
            </Card>

            {/* Statistics Card */}
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Lessons Completed: {userData.lessonsCompleted}</p>
                    <p>Practice Sessions: {userData.practiceSessions}</p>
                    <p>Accuracy Rate: {userData.accuracyRate}</p>
                    <p>Study Streak: {userData.studyStreak}</p>
                </CardContent>
            </Card>

            {/* Achievements Card */}
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul>
                        {achievements.map((ach, index) => <li key={index}>{ach}</li>)}
                    </ul>
                </CardContent>
            </Card>

            {/* Recent Activity Card */}
            <Card className="md:col-span-3">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul>
                        {recentActivity.map((act, index) => (
                            <li key={index} className="text-sm mb-1">
                                {act} <span className="text-muted-foreground"></span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}

export default ProfilePage;