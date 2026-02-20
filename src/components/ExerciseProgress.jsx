import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function ExerciseProgress() {
    const { state } = useStore();
    const { t } = useTranslation();
    const [selectedExercise, setSelectedExercise] = useState('');

    // Extract all unique exercise names from gym logs
    const exerciseNames = useMemo(() => {
        const names = new Set();
        state.gymLog.forEach(log => {
            log.exercises.forEach(ex => {
                if (ex.name && ex.name.trim()) names.add(ex.name.trim());
            });
        });
        return [...names].sort();
    }, [state.gymLog]);

    // Auto-select first exercise if none selected
    if (!selectedExercise && exerciseNames.length > 0) {
        setSelectedExercise(exerciseNames[0]);
    }

    // Determine if this exercise is duration-based or weight-based
    const progressData = useMemo(() => {
        if (!selectedExercise) return [];

        const entries = [];
        const sorted = [...state.gymLog].sort((a, b) => new Date(a.date) - new Date(b.date));

        sorted.forEach(log => {
            log.exercises.forEach(ex => {
                if (ex.name.trim() === selectedExercise) {
                    const weightNum = parseFloat(ex.weight);
                    const durationNum = parseFloat(ex.duration);
                    const hasWeight = !isNaN(weightNum) && weightNum > 0;
                    const hasDuration = !isNaN(durationNum) && durationNum > 0;

                    if (hasWeight || hasDuration) {
                        entries.push({
                            date: log.date,
                            weight: hasWeight ? weightNum : 0,
                            duration: hasDuration ? durationNum : 0,
                            sets: parseInt(ex.sets) || 0,
                            reps: parseInt(ex.reps) || 0,
                            volume: hasWeight ? weightNum * (parseInt(ex.sets) || 1) * (parseInt(ex.reps) || 1) : 0,
                        });
                    }
                }
            });
        });

        return entries;
    }, [state.gymLog, selectedExercise]);

    // Determine tracking mode: weight-based or duration-based
    const isDurationBased = useMemo(() => {
        if (progressData.length === 0) return false;
        const hasAnyWeight = progressData.some(d => d.weight > 0);
        const hasAnyDuration = progressData.some(d => d.duration > 0);
        return !hasAnyWeight && hasAnyDuration;
    }, [progressData]);

    // Stats
    const stats = useMemo(() => {
        if (progressData.length === 0) return null;

        if (isDurationBased) {
            const maxDuration = Math.max(...progressData.map(d => d.duration));
            return { mode: 'duration', maxDuration };
        }

        const maxWeight = Math.max(...progressData.map(d => d.weight));
        const bestEntry = progressData.find(d => d.weight === maxWeight);
        return {
            mode: 'weight',
            maxWeight,
            bestSet: bestEntry ? `${bestEntry.weight}kg × ${bestEntry.sets}×${bestEntry.reps}` : '—',
        };
    }, [progressData, isDurationBased]);

    const chartData = progressData.map(d => ({
        date: new Date(d.date).toLocaleDateString(),
        value: isDurationBased ? d.duration : d.weight,
    }));

    if (exerciseNames.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">{t('exercise_progress_title', 'Gym Gelişim')}</h3>
                    <p className="text-xs text-base-content/40 mt-0.5">{t('exercise_progress_desc')}</p>
                </div>
            </div>

            {/* Exercise Selector */}
            <div className="flex flex-wrap gap-2">
                {exerciseNames.map(name => (
                    <button
                        key={name}
                        className={`btn btn-sm rounded-xl font-medium transition-all duration-200 ${selectedExercise === name ? 'btn-primary' : 'btn-ghost bg-base-200'
                            }`}
                        onClick={() => setSelectedExercise(name)}
                    >
                        {name}
                    </button>
                ))}
            </div>

            {progressData.length > 0 ? (
                <>
                    {/* Stats */}
                    {stats && stats.mode === 'weight' && (
                        <div className="grid grid-cols-2 gap-3">
                            <motion.div className="card bg-base-200 rounded-xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="card-body p-3 text-center">
                                    <p className="text-xs text-base-content/50">{t('exercise_max_weight')}</p>
                                    <p className="text-xl font-bold text-primary">{stats.maxWeight} kg</p>
                                </div>
                            </motion.div>
                            <motion.div className="card bg-base-200 rounded-xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                                <div className="card-body p-3 text-center">
                                    <p className="text-xs text-base-content/50">{t('exercise_best_set')}</p>
                                    <p className="text-lg font-bold text-warning">{stats.bestSet}</p>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {stats && stats.mode === 'duration' && (
                        <div className="grid grid-cols-1 gap-3">
                            <motion.div className="card bg-base-200 rounded-xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="card-body p-3 text-center">
                                    <p className="text-xs text-base-content/50">{t('exercise_max_duration', 'Maks. Süre')}</p>
                                    <p className="text-xl font-bold text-primary">{stats.maxDuration} dk</p>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Chart */}
                    {chartData.length >= 2 && (
                        <motion.div
                            className="card bg-base-200 rounded-xl"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="card-body p-4">
                                <div className="h-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                                                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                            />
                                            <YAxis
                                                domain={['dataMin - 5', 'dataMax + 5']}
                                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                                                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                                unit={isDurationBased ? ' dk' : ' kg'}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'oklch(0.25 0.01 260)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '12px',
                                                    color: '#fff',
                                                }}
                                                formatter={(value) => [`${value} ${isDurationBased ? 'dk' : 'kg'}`, isDurationBased ? 'Süre' : 'Ağırlık']}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="oklch(0.65 0.24 265)"
                                                strokeWidth={2.5}
                                                dot={{ r: 4, fill: 'oklch(0.65 0.24 265)' }}
                                                connectNulls
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Records List */}
                    <motion.div
                        className="card bg-base-200 rounded-xl"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                    >
                        <div className="card-body p-4">
                            <h4 className="font-semibold text-sm mb-3">{t('kilo_records', 'Kayıtlar')}</h4>
                            <div className="space-y-2">
                                {[...progressData].reverse().map((entry, i) => (
                                    <div key={i} className="flex items-center justify-between bg-base-300/40 rounded-lg px-3 py-2">
                                        <span className="text-sm text-base-content/60">
                                            {new Date(entry.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            {entry.weight > 0 && (
                                                <span className="text-sm font-bold text-primary">{entry.weight} kg</span>
                                            )}
                                            {entry.sets > 0 && entry.reps > 0 && (
                                                <span className="text-xs text-base-content/50 font-mono">{entry.sets}×{entry.reps}</span>
                                            )}
                                            {entry.duration > 0 && (
                                                <span className="text-sm font-bold text-primary">{entry.duration} dk</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </>
            ) : (
                <div className="card bg-base-200 rounded-xl">
                    <div className="card-body items-center text-center py-8 text-base-content/40">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h4v4H3v-4zm14 0h4v4h-4v-4zM7 11h10v2H7v-2zM4 6h2v12H4V6zm14 0h2v12h-2V6z" />
                        </svg>
                        <p className="text-sm font-medium">{t('exercise_min_records', 'Grafiğin çizilmesi için en az 2 kayıt gereklidir.')}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
