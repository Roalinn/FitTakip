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

    // Build progress data for selected exercise
    const progressData = useMemo(() => {
        if (!selectedExercise) return [];

        const entries = [];
        // Sort gymLog by date ascending
        const sorted = [...state.gymLog].sort((a, b) => new Date(a.date) - new Date(b.date));

        sorted.forEach(log => {
            log.exercises.forEach(ex => {
                if (ex.name.trim() === selectedExercise && ex.weight) {
                    const weightNum = parseFloat(ex.weight);
                    if (!isNaN(weightNum) && weightNum > 0) {
                        entries.push({
                            date: log.date,
                            weight: weightNum,
                            sets: ex.sets || 0,
                            reps: ex.reps || 0,
                            volume: weightNum * (ex.sets || 1) * (ex.reps || 1),
                        });
                    }
                }
            });
        });

        return entries;
    }, [state.gymLog, selectedExercise]);

    // Stats
    const stats = useMemo(() => {
        if (progressData.length === 0) return null;

        const maxWeight = Math.max(...progressData.map(d => d.weight));
        const bestEntry = progressData.find(d => d.weight === maxWeight);
        const totalVolume = progressData.reduce((sum, d) => sum + d.volume, 0);

        // Estimated 1RM using Epley formula: weight × (1 + reps / 30)
        let estimated1RM = maxWeight;
        if (bestEntry && bestEntry.reps > 1) {
            estimated1RM = maxWeight * (1 + bestEntry.reps / 30);
        }

        return {
            maxWeight,
            estimated1RM: estimated1RM.toFixed(1),
            totalVolume: totalVolume.toFixed(0),
            bestSet: bestEntry ? `${bestEntry.weight}kg × ${bestEntry.sets}×${bestEntry.reps}` : '—',
        };
    }, [progressData]);

    const chartData = progressData.map(d => ({
        date: new Date(d.date).toLocaleDateString(),
        weight: d.weight,
    }));

    if (exerciseNames.length === 0) {
        return null; // Don't show section if no exercises logged
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
                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <motion.div className="card bg-base-200 rounded-xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="card-body p-3 text-center">
                                    <p className="text-xs text-base-content/50">{t('exercise_max_weight')}</p>
                                    <p className="text-xl font-bold text-primary">{stats.maxWeight} kg</p>
                                </div>
                            </motion.div>
                            <motion.div className="card bg-base-200 rounded-xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                                <div className="card-body p-3 text-center">
                                    <p className="text-xs text-base-content/50">{t('exercise_estimated_1rm')}</p>
                                    <p className="text-xl font-bold text-secondary">{stats.estimated1RM} kg</p>
                                </div>
                            </motion.div>
                            <motion.div className="card bg-base-200 rounded-xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                <div className="card-body p-3 text-center">
                                    <p className="text-xs text-base-content/50">{t('exercise_total_volume')}</p>
                                    <p className="text-xl font-bold text-accent">{Number(stats.totalVolume).toLocaleString()} kg</p>
                                </div>
                            </motion.div>
                            <motion.div className="card bg-base-200 rounded-xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                                <div className="card-body p-3 text-center">
                                    <p className="text-xs text-base-content/50">{t('exercise_best_set')}</p>
                                    <p className="text-lg font-bold text-warning">{stats.bestSet}</p>
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
                                                unit=" kg"
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'oklch(0.25 0.01 260)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '12px',
                                                    color: '#fff',
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="weight"
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
                </>
            ) : (
                <div className="card bg-base-200 rounded-xl">
                    <div className="card-body items-center text-center py-8 text-base-content/40">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h4v4H3v-4zm14 0h4v4h-4v-4zM7 11h10v2H7v-2zM4 6h2v12H4V6zm14 0h2v12h-2V6z" />
                        </svg>
                        <p className="text-sm font-medium">{t('exercise_no_data')}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
