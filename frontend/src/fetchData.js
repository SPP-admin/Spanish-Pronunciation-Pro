import api from "./api.js"


export const fetchData = async (uid) => {

    async function trySetting(result, endpoint) {
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

    const profile = {
            accuracyRate: 0,
            comboCount: 0,
            practiceSessions: 0,
            studyStreak: 0,
            lastLogin: 0,
            achievements: {},
            activities: [],
            completedCombos: [],
            completedTopics: {},
         };

        /*
        try {
          let response = await api.get(`/getUser?uid=${uid}`)
        } catch (error) {
          console.log(error.response.status)
          if(error.response.status === 400) {
            await api.post('/setUser', {id: uid}).catch(err => console.error(err))
            await api.post('/setUserStatistics', {id: uid}).catch(err => console.error(err))
            await api.post('/setAchievements', {id: uid}).catch(err => console.error(err))
            await api.post('/setLessonProgress', {id: uid}).catch(err => console.error(err))
            console.log("Account initialized.") 
            return profile;
          } else return profile;
        }
        */


        const result = await api.get(`/getUserStatistics?uid=${uid}`)
        .then(response => ({ status: 'fulfilled', value: response }))
        .catch(error => ({ status: 'rejected', reason: error }));

        const stats = await trySetting(result, `/setUserStatistics`);
        
        return {
            accuracyRate: parseInt(stats?.user_stats.accuracy_rate ?? "") || profile.accuracyRate,
            comboCount: parseInt(stats?.user_stats.combo_count ?? "") || profile.comboCount,
            practiceSessions: parseInt(stats?.user_stats.practice_sessions ?? "") || profile.practiceSessions,
            studyStreak: parseInt(stats?.user_stats.study_streak ?? "") || profile.studyStreak,
            lastLogin: stats?.user_stats.last_login ?? profile.lastLogin,
            achievements: stats?.achievements.achievements ?? profile.achievements,
            activities: stats?.activity_history ?? profile.activities,
            completedCombos: stats?.lessons.chunks ?? profile.completedCombos,
            completedTopics: stats?.lessons.lesson_data ?? profile.completedTopics,
        }

        /*
        try {
          let fetchedData = await api.get(`/getUserStatistics?uid=${uid}`)
          let userStats = fetchedData.data.user_stats
          setProfile(prev => ({
              ...prev,
            lessonsCompleted: userStats.completed_lessons ?? prev.lessonsCompleted,
            accuracyRate: userStats.accuracy_rate ?? prev.accuracyRate,
            practiceSessions: userStats.practice_sessions ?? prev.practiceSessions,
            studyStreak: userStats.study_streak ?? prev.studyStreak}));
          fetchedData = await api.get(`/getAchievements?uid=${uid}`)
          let fetchedAchievements = fetchedData.data.achievements.achievements
          setProfile(prev => ({
            ...prev,
            achievements: fetchedAchievements
          }))

        } catch (error) {
          console.log(error)
        }

        try {
          const fetchedData = await api.get(`/getActivityHistory?uid=${uid}`)

          setProfile(prev => ({
            ...prev,
            activities: fetchedData.data.activity_history
          }))

        } catch (error) {
          console.log(error)
        }

        try {
          const fetchedData = await api.get(`/getLessonProgress?uid=${uid}`)
          setProfile(prev => ({
            ...prev,
            lessons: fetchedData.data.lesson_data
          }))

          console.log("Fetched Properly!")
          setFetchingData(false)
        } catch(error) {
          console.log(error)
        }
          */
     }