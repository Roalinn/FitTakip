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
            const isCardio = log.type === 'cardio';
            log.exercises.forEach(ex => {
                if (ex.name.trim() === selectedExercise) {
                    if (isCardio) {
                        const dist = parseFloat(ex.distance);
                        const dur = parseFloat(ex.duration);
                        if (!isNaN(dist) || !isNaN(dur)) {
                            entries.push({
                                date: log.date,
                                isCardio: true,
                                distance: dist || 0,
                                duration: dur || 0,
                                speed: parseFloat(ex.speed) || 0,
                            });
                        }
                    } else {
                        const weightNum = parseFloat(ex.weight);
                        if (!isNaN(weightNum) && weightNum > 0) {
                            entries.push({
                                date: log.date,
                                isCardio: false,
                                weight: weightNum,
                                sets: parseInt(ex.sets) || 0,
                                reps: parseInt(ex.reps) || 0,
                            });
                        } else if (ex.duration) {
                            // legacy support for duration in old weight data
                            entries.push({
                                date: log.date,
                                isCardio: true,
                                duration: parseFloat(ex.duration) || 0,
                            });
                        }
                    }
                }
            });
        });

        return entries;
    }, [state.gymLog, selectedExercise]);

    // Determine tracking mode: weight-based, distance-based, or duration-based
    const trackingMode = useMemo(() => {
        if (progressData.length === 0) return 'weight';
        const hasWeight = progressData.some(d => d.weight > 0);
        const hasDistance = progressData.some(d => d.distance > 0);
        const hasDuration = progressData.some(d => d.duration > 0);

        if (hasDistance) return 'distance';
        if (hasDuration && !hasWeight) return 'duration';
        return 'weight';
    }, [progressData]);

    const stats = useMemo(() => {
        if (progressData.length === 0) return null;
        if (trackingMode === 'distance') {
            const maxDist = Math.max(...progressData.map(d => d.distance || 0));
            return { mode: 'distance', maxDist };
        }
        if (trackingMode === 'duration') {
            const maxDur = Math.max(...progressData.map(d => d.duration || 0));
            return { mode: 'duration', maxDur };
        }

        const maxWeight = Math.max(...progressData.map(d => d.weight || 0));
        const bestEntry = progressData.find(d => d.weight === maxWeight);
        return {
            mode: 'weight',
            maxWeight,
            bestSet: bestEntry ? `${bestEntry.weight}kg × ${bestEntry.sets}×${bestEntry.reps}` : '—',
        };
    }, [progressData, trackingMode]);

    const chartData = progressData.map(d => {
        let val = 0;
        if (trackingMode === 'distance') val = d.distance;
        else if (trackingMode === 'duration') val = d.duration;
        else val = d.weight;

        return {
            date: new Date(d.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
            value: val || 0,
            fullDate: d.date
        };
    });

    if (exerciseNames.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">{t('exercise_progress_title', 'Gym Gelişim')}</h3>
                    <p className="text-xs text-base-content/40 mt-0.5">{t('exercise_progress_desc', 'Geçmiş antrenman verilerine dayalı gelişim')}</p>
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
                    {/* Stats Grid */}
                    {stats && stats.mode === 'weight' && (
                        <div className="grid grid-cols-2 gap-3">
                            <motion.div className="card bg-base-200 rounded-xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="card-body p-3 text-center">
                                    <p className="text-xs text-base-content/50">{t('exercise_max_weight', 'Maks. Ağırlık')}</p>
                                    <p className="text-xl font-bold text-primary">{stats.maxWeight} kg</p>
                                </div>
                            </motion.div>
                            <motion.div className="card bg-base-200 rounded-xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                                <div className="card-body p-3 text-center">
                                    <p className="text-xs text-base-content/50">{t('exercise_best_set', 'En İyi Set')}</p>
                                    <p className="text-lg font-bold text-warning">{stats.bestSet}</p>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {stats && stats.mode === 'distance' && (
                        <div className="grid grid-cols-1 gap-3">
                            <motion.div className="card bg-base-200 rounded-xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="card-body p-3 text-center">
                                    <p className="text-xs text-base-content/50">{t('exercise_max_distance', 'Maksimum Mesafe')}</p>
                                    <p className="text-xl font-bold text-secondary">{stats.maxDist} km</p>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {stats && stats.mode === 'duration' && (
                        <div className="grid grid-cols-1 gap-3">
                            <motion.div className="card bg-base-200 rounded-xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="card-body p-3 text-center">
                                    <p className="text-xs text-base-content/50">{t('exercise_max_duration', 'Maks. Süre')}</p>
                                    <p className="text-xl font-bold text-primary">{stats.maxDur} dk</p>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Chart */}
                    {chartData.length >= 2 && (
                        <motion.div
                            className="card bg-base-200 rounded-xl overflow-hidden"
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
                                                unit={trackingMode === 'distance' ? ' km' : trackingMode === 'duration' ? ' dk' : ' kg'}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'oklch(0.25 0.01 260)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '12px',
                                                    color: '#fff',
                                                }}
                                                formatter={(value) => [
                                                    `${value} ${trackingMode === 'distance' ? 'km' : trackingMode === 'duration' ? 'dk' : 'kg'}`,
                                                    trackingMode === 'distance' ? 'Mesafe' : trackingMode === 'duration' ? 'Süre' : 'Ağırlık'
                                                ]}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke={trackingMode === 'distance' ? 'oklch(0.65 0.15 200)' : 'oklch(0.65 0.24 265)'}
                                                strokeWidth={2.5}
                                                dot={{ r: 4, fill: trackingMode === 'distance' ? 'oklch(0.65 0.15 200)' : 'oklch(0.65 0.24 265)' }}
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
                                            {!entry.isCardio && entry.weight > 0 && (
                                                <span className="text-sm font-bold text-primary">{entry.weight} kg</span>
                                            )}
                                            {!entry.isCardio && entry.sets > 0 && entry.reps > 0 && (
                                                <span className="text-xs text-base-content/50 font-mono">{entry.sets}×{entry.reps}</span>
                                            )}

                                            {entry.isCardio && entry.distance > 0 && (
                                                <span className="text-sm font-bold text-secondary">{entry.distance} km</span>
                                            )}
                                            {entry.isCardio && entry.duration > 0 && (
                                                <span className="text-sm font-bold opacity-70">{entry.duration} dk</span>
                                            )}
                                            {entry.isCardio && entry.speed > 0 && (
                                                <span className="text-xs opacity-50 font-mono">{entry.speed} km/s</span>
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
