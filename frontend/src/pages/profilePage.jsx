import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaTrophy } from 'react-icons/fa';


// Trophy component to display individual achievements
function Trophy({ trophy }) {
  const isUnlocked = trophy.unlocked;
  const iconColor = isUnlocked ? 'text-yellow-400' : 'text-muted-foreground/30';
  const textColor = isUnlocked ? 'text-foreground' : 'text-muted-foreground/50';

  return (
    <div className="flex items-center space-x-4 p-4 bg-background/50 rounded-lg">
      <FaTrophy className={`text-3xl ${iconColor}`} />
      <div className={textColor}>
        <h3 className="font-bold">{trophy.name}</h3>
        <p className="text-sm">{trophy.description}</p>
      </div>
    </div>
  );
}

// TrophiesCard component to display a list of achievements 
function TrophiesCard({ trophies }) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trophies.map((trophy) => (
            <Trophy key={trophy.id} trophy={trophy} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
// Will probably move these into a separate file later
// but for now, keeping them here for simplicity

// --- Main Profile Page ---

function ProfilePage() {
    // --- MOCK DATA ---
    const userData = {
        name: "Jose Luna",
        learningSince: "January 2025",
        lessonsCompleted: 24,
        practiceSessions: 56,
        accuracyRate: "78%",
        studyStreak: "12 days",
    };

    // Trying out a mock achievements list
    const allAchievements = [
      { id: 1, name: "Perfect Week", description: "Complete a lesson every day for 7 days.", unlocked: true },
      { id: 2, name: "14 Day Streak", description: "Maintain a 14-day practice streak.", unlocked: true },
      { id: 3, name: "Vowel Virtuoso", description: "Complete all vowel lessons.", unlocked: true },
      { id: 4, name: "Consonant Champion", description: "Complete all consonant lessons.", unlocked: false },
      { id: 5, name: "Speedy Speaker", description: "Complete a lesson in under 2 minutes", unlocked: false },
      { id: 6, name: "Max level", description: "Reach max level in any lesson category.", unlocked: true },
    ];
    
    // Recent activity list
    const recentActivity = [
        { action: "Completed Lesson 5: Common Phrases", time: "2 hours ago" },
        { action: "Practice Session: Greetings", time: "Yesterday" },
        { action: "Earned Perfect Week Badge", time: "3 days ago" },
    ];

    // --- Render Profile Page ---
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
                <p><span className="font-semibold">Learning Since:</span> {userData.learningSince}</p>
                <p><span className="font-semibold">Study Streak:</span> {userData.studyStreak}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="font-semibold">Lessons Completed:</span> {userData.lessonsCompleted}</p>
                <p><span className="font-semibold">Practice Sessions:</span> {userData.practiceSessions}</p>
                <p><span className="font-semibold">Accuracy Rate:</span> {userData.accuracyRate}</p>
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
                      <span className="text-xs text-muted-foreground block">{act.time}</span>
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