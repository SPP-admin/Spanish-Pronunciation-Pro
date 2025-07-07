
  const vowelLesson = 0;
  const consonantLesson = 1;
  const uniqueLesson = 2;
  const speccialLesson = 3;
  const accentLesson = 4;
  const regionalLesson = 5;

  export const achievements = [
    {
      id: 0,
      name: "Perfect Week",
      description: "Complete a lesson every day for 7 days.",
      unlocked: false,
      completionDate: 0,
      condition: (userStats) => userStats.studyStreak >= 7
    },
    {
      id: 1,
      name: "14 Day Streak",
      description: "Maintain a 14-day practice streak.",
      unlocked: false,
      completionDate: 0,
      condition: (userStats) => userStats?.studyStreak >= 14
    },
    {
      id: 2,
      name: "Vowel Virtuoso",
      description: "Complete all vowel lessons.",
      unlocked: false,
      completionDate: 0,
      condition: (userStats) => userStats?.lessons[vowelLesson]?.completed == true
    },
    {
      id: 3,
      name: "Consonant Champion",
      description: "Complete all consonant lessons.",
      unlocked: false,
      completionDate: 0,
      condition: (userStats) => userStats?.lessons[consonantLesson]?.completed == true
    },
    {
      id: 4,
      name: "Accent Mark Master",
      description: "Complete all accent mark lessons.",
      unlocked: false,
      completionDate: 0,
      condition: (userStats) => userStats?.lessons[accentLesson]?.completed == true
    },
    {
      id: 5,
      name: "Precise Pronunciation",
      description: "Achieve an accuracy rate of over 90%",
      unlocked: false,
      completionDate: 0,
      condition: (userStats) => userStats?.accuracyRate >= 90
    },
  ];

  // Checks the achievement conditions to see if the user is eligible to earn an achievement.
  export const achievementChecker = (userStats, achievements) => {
    const grantedAchievements = []
    
    for (const achievement in achievements) {
      if(achievements[achievement].condition(userStats) == true && !userStats?.achievements[achievement]) {
        grantedAchievements.push(achievement)
      }
    }
    return grantedAchievements;
  }
