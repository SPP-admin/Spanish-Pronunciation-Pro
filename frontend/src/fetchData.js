import api from "./api.js"


    const profile = {
            accuracyRate: 0,
            comboCount: 0,
            practiceSessions: 0,
            studyStreak: 0,
            lastLogin: new Date().toISOString().replace('T', ' ').slice(0,19),
            achievements: {},
            activities: [],
            completedCombos: [],
            completedTopics: {},
         };

    async function trySetting(result, endpoint, uid) {
      try {
        if(result.status == 'fulfilled') {
          return result.value.data
        } else {
          await api.post(`${endpoint}`, {id: uid});
          return null
        }

    } catch (error) {
      console.log(`Error accessing endpoint.`)
      return null
    }
  }


export const fetchData = async (uid) => {
  try {

        const result = await api.get(`/getUserStatistics?uid=${uid}`)
        .then(response => ({ status: 'fulfilled', value: response }))
        .catch(error => ({ status: 'rejected', reason: error }));

        const stats = await trySetting(result, `/setUserStatistics`, uid);

        console.log(profile.lastLogin)
        
        const profileData = {
            accuracyRate: parseInt(stats?.user_stats.accuracy_rate ?? "") || profile.accuracyRate,
            comboCount: parseInt(stats?.user_stats.combo_count ?? "") || profile.comboCount,
            practiceSessions: parseInt(stats?.user_stats.practice_sessions ?? "") || profile.practiceSessions,
            studyStreak: parseInt(stats?.user_stats.study_streak ?? "") || profile.studyStreak,
            lastLogin: stats?.user_stats.last_login ?? profile.lastLogin,
            achievements: stats?.user_stats?.achievements ?? profile.achievements,
            activities: stats?.user_stats?.activities ?? profile.activities,
            completedCombos: stats?.user_stats?.completed_combos ?? profile.completedCombos,
            completedTopics: stats?.user_stats?.completed_topics ?? profile.completedTopics,
        };

        console.log(profileData)

        return profileData;

      } catch (error) {
        console.log(error);
        return profile;
      }

 }