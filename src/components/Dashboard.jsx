import React from 'react';
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

    if (todayDiet.length === 0 && todayGym.length === 0) return null;

    return (
        <motion.div
            className="card bg-base-200 rounded-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
        >
            <div className="card-body p-4">
                <h3 className="font-semibold text-sm mb-3">{t('dash_today_program')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Diet */}
                    {todayDiet.length > 0 && (
                        <div>
                            <p className="text-xs text-base-content/40 uppercase tracking-wider mb-2">🍎 {t('prog_diyet', 'Diyet')}</p>
                            <div className="space-y-1.5">
                                {todayDiet.map((meal, i) => (
                                    <div key={i} className="bg-base-300/40 rounded-lg px-3 py-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-primary font-mono font-medium min-w-[3rem]">{meal.time || '—'}</span>
                                            <span className="text-sm font-medium truncate">{meal.name || '—'}</span>
                                        </div>
                                        {meal.foods && (
                                            <p className="text-xs text-base-content/40 mt-0.5 ml-[3.5rem] truncate">
                                                {Array.isArray(meal.foods) ? meal.foods.join(', ') : String(meal.foods).split(',').map(f => f.trim()).filter(Boolean).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Gym */}
                    {todayGym.length > 0 && (
                        <div>
                            <p className="text-xs text-base-content/40 uppercase tracking-wider mb-2">🏋️ {t('prog_gym', 'Gym')}</p>
                            <div className="space-y-1.5">
                                {todayGym.map((ex, i) => (
                                    <div key={i} className="flex items-center justify-between bg-base-300/40 rounded-lg px-3 py-1.5">
                                        <span className="text-sm truncate">{ex.name || '—'}</span>
                                        <span className="text-xs text-base-content/50 font-mono whitespace-nowrap ml-2">
                                            {[
                                                ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : '',
                                                ex.duration ? `${ex.duration}dk` : '',
                                            ].filter(Boolean).join(' · ') || '—'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
