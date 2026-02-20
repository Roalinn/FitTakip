import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';

const GLASS_ML = 250; // 1 bardak = 250ml

export default function SuTakip() {
    const { state, dispatch } = useStore();
    const { t } = useTranslation();
    const [showSettings, setShowSettings] = useState(false);
    const [settingsForm, setSettingsForm] = useState(null);

    const todayKey = new Date().toISOString().split('T')[0];
    const waterLog = state.waterLog || [];

    const todayEntry = waterLog.find(w => w.date === todayKey);
    const todayGlasses = todayEntry ? todayEntry.glasses : 0;
    const dailyGoal = state.settings.waterGoal || 8;
    const maxGlasses = Math.floor(dailyGoal * 2);

    const percentage = Math.min((todayGlasses / dailyGoal) * 100, 100);

    const addGlass = () => {
        if (todayGlasses < maxGlasses) {
            dispatch({ type: 'SET_WATER', date: todayKey, glasses: todayGlasses + 1 });
        }
    };

    const removeGlass = () => {
        if (todayGlasses > 0) {
            dispatch({ type: 'SET_WATER', date: todayKey, glasses: todayGlasses - 1 });
        }
    };

    // Last 7 days
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

    // Stats
    const stats = useMemo(() => {
        const last7 = last7Days;
        const filled = last7.filter(d => d.glasses > 0);
        const avg = filled.length > 0 ? filled.reduce((s, d) => s + d.glasses, 0) / filled.length : 0;
        const avgLiters = (avg * GLASS_ML / 1000).toFixed(1);
        const goalHit = last7.filter(d => d.glasses >= dailyGoal).length;
        return { avgLiters, goalHit };
    }, [last7Days, dailyGoal]);

    const openSettings = () => {
        setSettingsForm(dailyGoal);
        setShowSettings(true);
    };

    const saveSettings = () => {
        dispatch({ type: 'SET_SETTINGS', payload: { waterGoal: settingsForm } });
        setShowSettings(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t('su_title', 'Su Takibi')}</h3>
                <button
                    className="btn btn-ghost btn-sm rounded-xl"
                    onClick={openSettings}
                >
                    ⚙️
                </button>
            </div>

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
                            <span className="text-3xl">💧</span>
                            <span className="text-2xl font-bold mt-1">{todayGlasses}/{dailyGoal}</span>
                            <span className="text-xs text-base-content/50">{(todayGlasses * GLASS_ML / 1000).toFixed(1)}L / {(dailyGoal * GLASS_ML / 1000).toFixed(1)}L</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4">
                        <button
                            className="btn btn-circle btn-outline btn-md"
                            onClick={removeGlass}
                            disabled={todayGlasses === 0}
                        >
                            −
                        </button>
                        <button
                            className="btn btn-circle btn-primary btn-lg text-xl"
                            onClick={addGlass}
                            disabled={todayGlasses >= maxGlasses}
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
                    {/* Bar area */}
                    <div className="relative h-28">
                        {/* Goal dashed line */}
                        <div
                            className="absolute left-0 right-0 border-t-2 border-dashed border-primary/40 pointer-events-none z-20"
                            style={{ bottom: `${(dailyGoal / maxGlasses) * 100}%` }}
                        >
                            <span className="absolute -top-4 right-0 text-xs text-primary/50">{dailyGoal} 💧</span>
                        </div>
                        <div className="flex items-end justify-between gap-2 h-full">
                            {last7Days.map((day, i) => (
                                <div key={i} className="flex-1 h-full flex items-end justify-center">
                                    <div
                                        className={`w-full max-w-[2rem] rounded-t-lg transition-all duration-300 ${day.glasses >= dailyGoal ? 'bg-success' :
                                                day.glasses > 0 ? 'bg-primary' : 'bg-base-300'
                                            }`}
                                        style={{
                                            height: `${day.glasses > 0 ? Math.max(8, (day.glasses / maxGlasses) * 100) : 4}%`,
                                        }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Labels */}
                    <div className="flex justify-between gap-2 mt-1">
                        {last7Days.map((day, i) => (
                            <div key={i} className="flex-1 text-center">
                                <p className="text-xs text-base-content/40">{day.glasses}</p>
                                <p className={`text-xs mt-0.5 ${day.isToday ? 'font-bold text-primary' : 'text-base-content/40'}`}>
                                    {day.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                <motion.div className="card bg-base-200 rounded-xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div className="card-body p-3 text-center">
                        <p className="text-xs text-base-content/50">{t('su_avg', 'Ort. (7 gün)')}</p>
                        <p className="text-xl font-bold text-primary">{stats.avgLiters} L</p>
                    </div>
                </motion.div>
                <motion.div className="card bg-base-200 rounded-xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="card-body p-3 text-center">
                        <p className="text-xs text-base-content/50">{t('su_goal_7', 'Hedefe Ulaşılan')}</p>
                        <p className="text-xl font-bold text-success">{stats.goalHit}/7</p>
                    </div>
                </motion.div>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="modal modal-open">
                    <motion.div
                        className="modal-box rounded-2xl max-w-sm"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3 className="font-bold text-lg mb-4">{t('su_settings_title', 'Su Takip Ayarları')}</h3>
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">{t('su_daily_goal', 'Günlük Hedef')}</span>
                                    <span className="label-text-alt font-bold text-primary">
                                        {settingsForm} {t('su_glass', 'bardak')} = {(settingsForm * GLASS_ML / 1000).toFixed(1)}L
                                    </span>
                                </label>
                                <input
                                    type="range"
                                    min="4"
                                    max="16"
                                    value={settingsForm}
                                    className="range range-primary range-sm"
                                    onChange={(e) => setSettingsForm(parseInt(e.target.value))}
                                />
                                <div className="flex justify-between text-xs text-base-content/40 mt-2 px-1">
                                    <span>4 bardak (1.0L)</span>
                                    <span>10 bardak (2.5L)</span>
                                    <span>16 bardak (4.0L)</span>
                                </div>
                            </div>
                            <div className="bg-base-200 rounded-xl p-3">
                                <p className="text-xs text-base-content/50">
                                    {t('su_settings_info', '1 bardak = 250ml. Günlük maksimum kayıt: hedefin 2 katı.')}
                                </p>
                            </div>
                        </div>
                        <div className="modal-action">
                            <button className="btn btn-ghost rounded-xl" onClick={() => setShowSettings(false)}>
                                {t('modal_btn_cancel', 'İptal')}
                            </button>
                            <button className="btn btn-primary rounded-xl" onClick={saveSettings}>
                                {t('modal_btn_save', 'Kaydet')}
                            </button>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop" onClick={() => setShowSettings(false)} />
                </div>
            )}
        </div>
    );
}
