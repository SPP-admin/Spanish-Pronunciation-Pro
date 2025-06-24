import { APIConnectionTimeoutError } from "openai";
import api from "./api.js"
import { useState } from "react"



export const fetchData = async (uid) => {

    const profile = {
            studyStreak: 0,
            lessonsCompleted: 0,
            practiceSessions: 0,
            accuracyRate: 0,
            activities: [],
            achievements: [],
            lessons: [],
         };

        try {
          let response = await api.get(`/getUser?uid=${uid}`)
        } catch (error) {
          console.log(error.response.status)
          if(error.response.status === 400) {
            await api.post('/setUser', {id: uid}).catch(() => {})
            await api.post('/setUserStatistics', {id: uid}).catch(() => {})
            await api.post('/setAchievements', {id: uid}).catch(() => {})
            await api.post('/setLessonProgress', {id: uid}).catch(() => {})
            console.log("Account initialized.") 
            return profile;
          }
        }

        const [statsRes, achievementsRes, activityHistoryRes, lessonProgressRes] = await Promise.all([
            api.get(`/getUserStatistics?uid=${uid}`),
            api.get(`/getAchievements?uid=${uid}`),
            api.get(`/getActivityHistory?uid=${uid}`),
            api.get(`/getLessonProgress?uid=${uid}`),
        ]);
        
        console.log([statsRes, achievementsRes, activityHistoryRes, lessonProgressRes])
        return {
            studyStreak: statsRes.data.user_stats.study_streak ?? profile.studyStreak,
            lessonsCompleted: statsRes.data.user_stats.completed_lessons ?? profile.lessonsCompleted,
            practiceSessions: statsRes.data.user_stats.practice_sessions ?? profile.practiceSessions,
            accuracyRate: statsRes.data.user_stats.accuracy_rate ?? profile.accuracyRate,
            activities: activityHistoryRes.data.activity_history ?? profile.activities,
            achievements: achievementsRes.data.achievements.achievements ?? profile.achievements,
            lessons: lessonProgressRes.data.lessons ?? profile.lessons,
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