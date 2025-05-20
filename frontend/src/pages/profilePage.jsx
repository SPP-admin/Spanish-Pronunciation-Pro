import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function ProfilePage() {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* User Info Card */}
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Name: {userData.name}</p>
                    <p>Learning Since: {userData.learningSince}</p>
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
                                {act.action} - <span className="text-muted-foreground">{act.time}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}

export default ProfilePage;