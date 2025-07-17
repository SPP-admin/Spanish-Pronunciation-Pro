import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrophiesCard } from "@/components/trophies";
import { useProfile } from '@/profileContext.jsx';
import { achievements } from '../achievements.js';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { storage } from '../firebase.js';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { useState } from 'react';
import { Camera } from 'lucide-react';


function ProfilePage({user}) {

  const { profile, setProfile } = useProfile();
  const cleanAchievments = achievements.map(({condition, ...rest}) => rest);
  const localAchievements = structuredClone(cleanAchievments);
  const [image, setImage] = useState(user?.photoURL);

  // Match achievements to databases.
    for (const key in localAchievements) {
      if(profile?.achievements[key]?.completed == true) {
        localAchievements[key].unlocked = true;
        localAchievements[key].completionDate = profile.achievements[key].completion_date
      } else localAchievements[key].unlocked = false;
    }

  const handleProfile = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);

      await uploadBytes(storageRef, file);

      const downloadURL = await getDownloadURL(storageRef);

      await updateProfile(user, {
        photoURL: downloadURL,
      });

      setImage(downloadURL); // Update local
      setProfile({ ...profile, photoURL: downloadURL }, user.uid);
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };

  // Profile Page
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Info and Stats */}
       <div className="col-span-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-col items-center text-center">
              {/*Updated Profile Picture Area */}
              <label htmlFor="profile-pic-upload" className="cursor-pointer group relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={image || "https://github.com/shadcn.png"} alt={`${user.displayName}'s profile picture`} />
                  <AvatarFallback>{user.displayName ? user.displayName.charAt(0) : 'U'}</AvatarFallback>
                </Avatar>
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </label>
              <input id="profile-pic-upload" className="hidden" type="file" onChange={handleProfile}/>
              <p className="mt-2 text-sm font-medium text-muted-foreground">Click image to change</p>
              {/*Profile Picture Area */}
              <CardTitle className="mt-2">{user.displayName}</CardTitle>
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
                <span className="font-semibold">Combos Completed:</span>{" "}
                {profile.comboCount}
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