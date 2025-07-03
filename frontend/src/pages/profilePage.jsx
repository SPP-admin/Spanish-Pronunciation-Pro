import React, { useState, useEffect } from 'react';
import api from "../api.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrophiesCard } from "@/components/trophies"; 
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "@/firebase.js"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  // Profile picture states
  const [profilePic, setProfilePic] = useState(user.photoURL || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "User")}&background=0D8ABC&color=fff`);
  const [previewPic, setPreviewPic] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreviewPic(reader.result);
    reader.readAsDataURL(file);

    // Upload to Firebase
    setUploading(true);
    try {
      const fileRef = ref(storage, `profilePictures/${user.uid}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      // Update Firebase profile
      await updateProfile(auth.currentUser, { photoURL: url });

      // Update app state
      setProfilePic(url);
      setUploading(false);
    } catch (error) {
      toast.error("Failed to upload profile picture.");
      setUploading(false);
    }
  };
  

  // Profile Page
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile picture, User Info and Stats */}
        <div className="col-span-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-col items-center">
              {/* Profile Picture */}
              <div className="mb-4 flex flex-col items-center">
                <img
                  src={previewPic || profilePic}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-400"
                />
                <label className="mt-2 cursor-pointer text-blue-600 text-xs font-medium hover:underline">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePicChange}
                    disabled={uploading}
                  />
                </label>
                {uploading && <span className="text-xs text-gray-500">Uploading...</span>}
              </div>
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