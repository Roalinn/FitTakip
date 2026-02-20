import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';

const GLASS_ML = 250; // 1 bardak = 250ml

export default function SuTakip() {
    const { state, dispatch } = useStore();
    const { t } = useTranslation();
    const [showSettings, setShowSettings] = useState(false);

    const todayKey = new Date().toISOString().split('T')[0];
    const waterLog = state.waterLog || [];

    // Get today's entry
    const todayEntry = waterLog.find(w => w.date === todayKey);
    const todayGlasses = todayEntry ? todayEntry.glasses : 0;
    const dailyGoal = state.settings.waterGoal || 8; // varsayılan 8 bardak = 2L

    // Stats
    const stats = useMemo(() => {
        if (waterLog.length === 0) return null;
        const last7 = waterLog.filter(w => {
            const d = new Date(w.date);
            const ago = new Date();
            ago.setDate(ago.getDate() - 7);
            return d >= ago;
        });
        const avg = last7.length > 0 ? (last7.reduce((s, w) => s + w.glasses, 0) / last7.length).toFixed(1) : 0;
        const totalDays = waterLog.length;
        const goalHitDays = waterLog.filter(w => w.glasses >= dailyGoal).length;
        return { avg, totalDays, goalHitDays };
    }, [waterLog, dailyGoal]);

    const percentage = Math.min((todayGlasses / dailyGoal) * 100, 100);

    const addGlass = () => {
        dispatch({ type: 'SET_WATER', date: todayKey, glasses: todayGlasses + 1 });
    };

    const removeGlass = () => {
        if (todayGlasses > 0) {
            dispatch({ type: 'SET_WATER', date: todayKey, glasses: todayGlasses - 1 });
        }
    };

    // Last 7 days for mini chart
    const last7Days = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const entry = waterLog.find(w => w.date === key);
            days.push({
                label: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
                glasses: entry ? entry.glasses : 0,
                isToday: i === 0,
            });
        }
        return days;
    }, [waterLog]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t('su_title', 'Su Takibi')}</h3>
                <button
                    className="btn btn-ghost btn-sm rounded-xl"
                    onClick={() => setShowSettings(!showSettings)}
                >
                    ⚙️
                </button>
            </div>

            {/* Goal Settings */}
            {showSettings && (
                <motion.div
                    className="card bg-base-200 rounded-xl"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                >
                    <div className="card-body p-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">{t('su_daily_goal', 'Günlük Hedef (bardak)')}</span>
                                <span className="label-text-alt">{dailyGoal} × {GLASS_ML}ml = {(dailyGoal * GLASS_ML / 1000).toFixed(1)}L</span>
                            </label>
                            <input
                                type="range"
                                min="4"
                                max="16"
                                value={dailyGoal}
                                className="range range-primary range-sm"
                                onChange={(e) => dispatch({ type: 'SET_SETTINGS', payload: { waterGoal: parseInt(e.target.value) } })}
                            />
                            <div className="flex justify-between text-xs text-base-content/40 mt-1">
                                <span>4 ({(4 * GLASS_ML / 1000).toFixed(1)}L)</span>
                                <span>10 ({(10 * GLASS_ML / 1000).toFixed(1)}L)</span>
                                <span>16 ({(16 * GLASS_ML / 1000).toFixed(1)}L)</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Progress Circle */}
            <motion.div
                className="card bg-base-200 rounded-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="card-body p-6 items-center">
                    <div className="relative w-48 h-48">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50" cy="50" r="42"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="6"
                                className="text-base-300"
                            />
                            <circle
                                cx="50" cy="50" r="42"
                                fill="none"
                                stroke="oklch(0.65 0.24 265)"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${percentage * 2.64} 264`}
                                className="transition-all duration-500 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">💧</span>
                            <span className="text-2xl font-bold mt-1">{todayGlasses}/{dailyGoal}</span>
                            <span className="text-xs text-base-content/50">{(todayGlasses * GLASS_ML / 1000).toFixed(1)}L</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                        <button
                            className="btn btn-circle btn-outline btn-sm"
                            onClick={removeGlass}
                            disabled={todayGlasses === 0}
                        >
                            −
                        </button>
                        <button
                            className="btn btn-circle btn-primary btn-lg"
                            onClick={addGlass}
                        >
                            +1
                        </button>
                        <button
                            className="btn btn-circle btn-outline btn-sm"
                            onClick={addGlass}
                        >
                            +
                        </button>
                    </div>

                    {todayGlasses >= dailyGoal && (
                        <p className="text-sm text-success font-medium mt-2">🎉 {t('su_goal_reached', 'Günlük hedefe ulaştın!')}</p>
                    )}
                </div>
            </motion.div>

            {/* Last 7 days bar chart */}
            <motion.div
                className="card bg-base-200 rounded-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="card-body p-4">
                    <h4 className="font-semibold text-sm mb-3">{t('su_last_7', 'Son 7 Gün')}</h4>
                    <div className="flex items-end justify-between gap-2 h-32">
                        {last7Days.map((day, i) => (
                            <div key={i} className="flex flex-col items-center flex-1 h-full justify-end">
                                <div className="flex-1 w-full flex items-end justify-center">
                                    <div
                                        className={`w-full max-w-[2rem] rounded-t-lg transition-all duration-300 ${day.glasses >= dailyGoal ? 'bg-success' :
                                                day.glasses > 0 ? 'bg-primary' : 'bg-base-300'
                                            }`}
                                        style={{
                                            height: `${Math.max(day.glasses > 0 ? 15 : 4, (day.glasses / dailyGoal) * 100)}%`,
                                        }}
                                    ></div>
                                </div>
                                <span className="text-xs text-base-content/40 mt-1">{day.glasses}</span>
                                <span className={`text-xs mt-0.5 ${day.isToday ? 'font-bold text-primary' : 'text-base-content/40'}`}>
                                    {day.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-3 gap-3">
                    <motion.div className="card bg-base-200 rounded-xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <div className="card-body p-3 text-center">
                            <p className="text-xs text-base-content/50">{t('su_avg', 'Ort. (7 gün)')}</p>
                            <p className="text-xl font-bold text-primary">{stats.avg}</p>
                        </div>
                    </motion.div>
                    <motion.div className="card bg-base-200 rounded-xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="card-body p-3 text-center">
                            <p className="text-xs text-base-content/50">{t('su_total_days', 'Toplam Gün')}</p>
                            <p className="text-xl font-bold text-secondary">{stats.totalDays}</p>
                        </div>
                    </motion.div>
                    <motion.div className="card bg-base-200 rounded-xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <div className="card-body p-3 text-center">
                            <p className="text-xs text-base-content/50">{t('su_goal_days', 'Hedefe Ulaşılan')}</p>
                            <p className="text-xl font-bold text-success">{stats.goalHitDays}</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
