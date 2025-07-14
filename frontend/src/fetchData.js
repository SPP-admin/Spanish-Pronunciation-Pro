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
            studyStreak: 0,
            lessonsCompleted: 0,
            practiceSessions: 0,
            accuracyRate: 0,
            activities: [],
            achievements: {},
            lessons: {},
            chunks: [],
            lastLogin: 0,
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

        const results = await Promise.allSettled([
            api.get(`/getUserStatistics?uid=${uid}`),
            api.get(`/getAchievements?uid=${uid}`),
            api.get(`/getActivityHistory?uid=${uid}`),
            api.get(`/getLessonProgress?uid=${uid}`),
        ]);

        const [statsResult, achievementsResult, activityHistoryResult, lessonProgressResult] = results

        const stats = await trySetting(statsResult, `/setUserStatistics`);
        const achievements = await trySetting(achievementsResult, `/setAchievements`);
        const activityHistory = await trySetting(activityHistoryResult, `/setActivityHistory`);
        const lessonProgress = await trySetting(lessonProgressResult, `/setLessonProgress`);

        console.log([stats, achievements, activityHistory, lessonProgress])

        return {
            studyStreak: parseInt(stats?.user_stats.study_streak ?? "") || profile.studyStreak,
            lessonsCompleted: parseInt(stats?.user_stats.completed_lessons ?? "") || profile.lessonsCompleted,
            practiceSessions: parseInt(stats?.user_stats.practice_sessions ?? "") || profile.practiceSessions,
            accuracyRate: parseInt(stats?.user_stats.accuracy_rate ?? "") || profile.accuracyRate,
            lastLogin: stats?.user_stats.last_login ?? profile.lastLogin,
            activities: activityHistory?.activity_history ?? profile.activities,
            achievements: achievements?.achievements.achievements ?? profile.achievements,
            lessons: lessonProgress?.lessons.lesson_data ?? profile.lessons,
            chunks: lessonProgress?.lessons.chunks ?? profile.chunks
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