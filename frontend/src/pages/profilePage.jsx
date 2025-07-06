import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrophiesCard } from "@/components/trophies"; 
import { useProfile } from '@/profileContext.jsx';
import { achievements } from '../achievements.js';

function ProfilePage({user}) {

  const { profile } = useProfile();
  const localAchievements = structuredClone(achievements);

  // Match achievements to database achiemvents.
    for (const key in localAchievements) {
      if(profile?.achievements[key]?.completed == true) {
        localAchievements[key].unlocked = true;
        localAchievements[key].completionDate = profile.achievements[key].completion_date
      } else localAchievements[key].unlocked = false;
    }

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
                {profile.accuracyRate}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Achievements and Activity */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <TrophiesCard trophies={localAchievements} />

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {profile.activities.map((act, index) => (
                  <li key={index} className="text-sm">
                    {act}
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