const isSameDay = (d1, d2) => {
    return (d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() && 
    d1.getDate() === d2.getDate()
);
}

export const studyStreakHandler = (lastLogin) => {
    const lastLoginDate = new Date(lastLogin);
    const date = new Date();
    const nextStreakDay = new Date (lastLogin);
    nextStreakDay.setUTCDate(lastLoginDate.getUTCDate() + 1);

    if(isSameDay(nextStreakDay, date)) {
        return 'updateStudyStreak'
    } else if(isSameDay(lastLoginDate, date)) {
        return 'noAction'
    } else {
        return 'updateLastLogin'
    }
}