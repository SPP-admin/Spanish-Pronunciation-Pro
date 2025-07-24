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
  const avalibleCombos = 62;
  const progressValue = (profile.comboCount / avalibleCombos) * 100;

  const cleanAchievments = achievements.map(({condition, ...rest}) => rest);
  const localAchievements = structuredClone(cleanAchievments);

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
  .sort((a,b) => new Date(b.completionDate) - new Date(a.completionDate))
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
              Combos completed: {profile.comboCount}/{avalibleCombos}
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
            {/* Changed "Practice Pronunciation" to "View Profile" as per the new requirement */}
            <Button asChild>
              <Link to="/profile">View Profile</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.activities && profile.activities.length > 0 ? ( //
              <ul className="space-y-2 text-sm text-muted-foreground">
                  {profile.activities.map((activity, index) => ( //
                    <li key={index} className="text-sm"> {/* */}
                      {activity} {/* */}
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent activity. Start practicing to see your progress here!
              </p>
            )}
          </CardContent>
        </Card>
        <div>
          {recentAchievements && recentAchievements.length > 0 ? ( //
            <TrophiesCard trophies={recentAchievements} />
          ) : (
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No achievements unlocked yet. Keep practicing to earn your first trophy!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;