
  const vowelTopic = 0;
  const consonantTopic = 1;
  const uniqueTopic = 2;
  const specialTopic = 3;
  const accentTopic = 4;
  const regionalTopic = 5;

  export const achievements = [
    {
      id: 0,
      name: "Perfect Week",
      description: "Complete a combo every day for 7 days.",
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
      description: "Complete all vowel combos.",
      unlocked: false,
      completionDate: 0,
      condition: (userStats) => userStats?.completedTopics[vowelTopic] == true
    },
    {
      id: 3,
      name: "Consonant Champion",
      description: "Complete all consonant combos.",
      unlocked: false,
      completionDate: 0,
      condition: (userStats) => userStats?.completedTopics[consonantTopic] == true
    },
    {
      id: 4,
      name: "Accent Mark Master",
      description: "Complete all accent mark combos.",
      unlocked: false,
      completionDate: 0,
      condition: (userStats) => userStats?.completedTopics[accentTopic] == true
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
