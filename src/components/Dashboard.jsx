import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';

const DAY_KEYS = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'];

export default function Dashboard() {
    const { state } = useStore();
    const { t } = useTranslation();

    const todayKey = DAY_KEYS[new Date().getDay()];
    const todayDiet = state.dietProgram[todayKey] || [];
    const todayGym = state.gymProgram[todayKey] || [];

    // Workout streak calculation
    const streak = useMemo(() => {
        if (state.gymLog.length === 0) return 0;
        const dates = [...new Set(state.gymLog.map(l => l.date))].sort().reverse();
        let count = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const key = checkDate.toISOString().split('T')[0];
            if (dates.includes(key)) {
                count++;
            } else if (i > 0) {
                break;
            }
        }
        return count;
    }, [state.gymLog]);

    // Quick stats
    const totalWorkouts = state.gymLog.length;
    const lastWorkoutDate = state.gymLog.length > 0
        ? state.gymLog.sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date
        : null;

    // Weight change this month
    const weightChange = useMemo(() => {
        if (state.weightLog.length < 2) return null;
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthLogs = state.weightLog.filter(w => new Date(w.date) >= monthStart);
        if (thisMonthLogs.length < 1) return null;
        const latest = state.weightLog[state.weightLog.length - 1].weight;
        const monthStartWeight = thisMonthLogs[0].weight;
        return (latest - monthStartWeight).toFixed(1);
    }, [state.weightLog]);

    // This month workouts
    const monthWorkouts = useMemo(() => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return state.gymLog.filter(l => new Date(l.date) >= monthStart).length;
    }, [state.gymLog]);

    // Activity heatmap (last 12 weeks)
    const heatmapData = useMemo(() => {
        const weeks = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const workoutDates = new Set(state.gymLog.map(l => l.date));

        for (let w = 11; w >= 0; w--) {
            const week = [];
            for (let d = 0; d < 7; d++) {
                const date = new Date(today);
                date.setDate(date.getDate() - (w * 7 + (6 - d)));
                const key = date.toISOString().split('T')[0];
                week.push({
                    date: key,
                    active: workoutDates.has(key),
                    future: date > today,
                });
            }
            weeks.push(week);
        }
        return weeks;
    }, [state.gymLog]);

    return (
        <div className="space-y-4">
            {/* Today's Program */}
            <motion.div
                className="card bg-base-200 rounded-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
            >
                <div className="card-body p-4">
                    <h3 className="font-semibold text-sm mb-3">{t('dash_today_program')}</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-base-300/50 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-primary">{todayDiet.length}</p>
                            <p className="text-xs text-base-content/50 mt-1">{t('dash_diet_meals')}</p>
                        </div>
                        <div className="bg-base-300/50 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-secondary">{todayGym.length}</p>
                            <p className="text-xs text-base-content/50 mt-1">{t('dash_gym_exercises')}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Streak + Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <motion.div
                    className="card bg-base-200 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="card-body p-4 items-center text-center">
                        <p className="text-3xl font-bold text-warning">🔥 {streak}</p>
                        <p className="text-xs text-base-content/50">{t('dash_streak_days')}</p>
                    </div>
                </motion.div>

                <motion.div
                    className="card bg-base-200 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <div className="card-body p-4 items-center text-center">
                        <p className="text-3xl font-bold text-info">{totalWorkouts}</p>
                        <p className="text-xs text-base-content/50">{t('dash_total_workouts')}</p>
                    </div>
                </motion.div>

                <motion.div
                    className="card bg-base-200 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="card-body p-4 items-center text-center">
                        <p className="text-3xl font-bold text-accent">{monthWorkouts}</p>
                        <p className="text-xs text-base-content/50">{t('dash_this_month')}</p>
                    </div>
                </motion.div>

                <motion.div
                    className="card bg-base-200 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <div className="card-body p-4 items-center text-center">
                        {weightChange !== null ? (
                            <>
                                <p className={`text-3xl font-bold ${parseFloat(weightChange) <= 0 ? 'text-success' : 'text-error'}`}>
                                    {parseFloat(weightChange) > 0 ? '+' : ''}{weightChange}
                                </p>
                                <p className="text-xs text-base-content/50">kg {t('dash_this_month').toLowerCase()}</p>
                            </>
                        ) : (
                            <>
                                <p className="text-3xl font-bold text-base-content/20">—</p>
                                <p className="text-xs text-base-content/50">{t('dash_weight_change')}</p>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Activity Heatmap */}
            <motion.div
                className="card bg-base-200 rounded-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="card-body p-4">
                    <h3 className="font-semibold text-sm mb-3">{t('dash_streak')} </h3>
                    <div className="flex gap-1 justify-center flex-wrap">
                        {heatmapData.map((week, wi) => (
                            <div key={wi} className="flex flex-col gap-1">
                                {week.map((day, di) => (
                                    <div
                                        key={di}
                                        className={`w-3.5 h-3.5 rounded-sm transition-colors ${day.future
                                                ? 'bg-transparent'
                                                : day.active
                                                    ? 'bg-primary shadow-sm shadow-primary/30'
                                                    : 'bg-base-300'
                                            }`}
                                        title={`${day.date}${day.active ? ' ✓' : ''}`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                    {lastWorkoutDate && (
                        <p className="text-xs text-base-content/40 mt-3 text-center">
                            {t('dash_last_workout')}: {new Date(lastWorkoutDate).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
