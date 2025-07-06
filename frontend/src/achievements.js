
  const vowelLesson = 0;
  const consonantLesson = 4;

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
      condition: (userStats) => userStats.studyStreak >= 14
    },
    {
      id: 2,
      name: "Vowel Virtuoso",
      description: "Complete all vowel lessons.",
      unlocked: false,
      completionDate: 0,
      condition: (userStats) => userStats.lessons[vowelLesson]?.completed == true
    },
    {
      id: 3,
      name: "Consonant Champion",
      description: "Complete all consonant lessons.",
      unlocked: false,
      completionDate: 0,
      condition: (userStats) => userStats.lessons[consonantLesson]?.completed == true
    },
    {
      id: 4,
      name: "Speedy Speaker",
      description: "Complete a lesson in under 2 minutes",
      unlocked: false,
      completionDate: 0,
      condition: (userStats) => false
    },
    {
      id: 5,
      name: "Max level",
      description: "Reach max level in any lesson category.",
      unlocked: false,
      completionDate: 0,
      condition: (userStats) => false
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