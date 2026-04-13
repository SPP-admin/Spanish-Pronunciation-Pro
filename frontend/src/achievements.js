import { lessonCategories } from './lessonCategories.js';

const getCategoryIndex = (id) =>
  lessonCategories.findIndex((category) => category.id === id);

const vowelTopic = getCategoryIndex("vowels");
const consonantTopic = getCategoryIndex("consonants");
const accentTopic = getCategoryIndex("accent_marks");
const regionalTopic = getCategoryIndex("regional_differences");

export const achievements = [
  {
    id: 0,
    name: "Perfect Week",
    description: "Complete a combo everyday for 7 days.",
    unlocked: false,
    completionDate: 0,
    condition: (userStats) => Number(userStats?.studyStreak || 0) >= 7,
  },
  {
    id: 1,
    name: "14 Day Streak",
    description: "Maintain a 14-day practice streak.",
    unlocked: false,
    completionDate: 0,
    condition: (userStats) => Number(userStats?.studyStreak || 0) >= 14,
  },
  {
    id: 2,
    name: "Vowel Virtuoso",
    description: "Complete all vowel combos.",
    unlocked: false,
    completionDate: 0,
    condition: (userStats) =>
      vowelTopic !== -1 && userStats?.completedTopics?.[vowelTopic] === true,
  },
  {
    id: 3,
    name: "Consonant Champion",
    description: "Complete all consonant combos.",
    unlocked: false,
    completionDate: 0,
    condition: (userStats) =>
      consonantTopic !== -1 &&
      userStats?.completedTopics?.[consonantTopic] === true,
  },
  {
    id: 4,
    name: "Accent Mark Master",
    description: "Complete all accent mark combos.",
    unlocked: false,
    completionDate: 0,
    condition: (userStats) =>
      accentTopic !== -1 && userStats?.completedTopics?.[accentTopic] === true,
  },
  {
    id: 5,
    name: "Precise Pronunciation",
    description: "Accuracy rate of over 90%",
    unlocked: false,
    completionDate: 0,
    condition: (userStats) => Number(userStats?.accuracyRate || 0) >= 90,
  },
  {
    id: 6,
    name: "World Traveler",
    description: "Complete Regional Lessons Practice",
    unlocked: false,
    completionDate: 0,
    condition: (userStats) =>
      regionalTopic !== -1 &&
      userStats?.completedTopics?.[regionalTopic] === true,
  },
];

export const achievementChecker = (userStats, achievements) => {
  const grantedAchievements = [];

  for (const achievement of achievements) {
    if (
      achievement.condition(userStats) &&
      !userStats?.achievements?.[achievement.id]
    ) {
      grantedAchievements.push(achievement.id);
    }
  }

  return grantedAchievements;
};