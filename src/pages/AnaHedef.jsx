import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

export default function AnaHedef() {
    const { state, dispatch } = useStore();
    const { goal, weightLog } = state;

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        startWeight: goal.startWeight || '',
        targetWeight: goal.targetWeight || '',
        targetDate: goal.targetDate || '',
        height: goal.height || '',
        age: goal.age || '',
        gender: goal.gender || 'erkek',
    });

    const currentWeight = weightLog.length > 0
        ? weightLog[weightLog.length - 1].weight
        : goal.startWeight;

    const startW = goal.startWeight || 0;
    const targetW = goal.targetWeight || 0;
    const totalToLose = startW - targetW;
    const lost = startW - (currentWeight || startW);
    const remaining = (currentWeight || startW) - targetW;
    const progress = totalToLose > 0 ? Math.min(100, Math.max(0, (lost / totalToLose) * 100)) : 0;

    const today = new Date();
    const targetDate = goal.targetDate ? new Date(goal.targetDate) : null;
    const daysRemaining = targetDate
        ? Math.max(0, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)))
        : null;

    const weeksRemaining = daysRemaining ? Math.max(1, daysRemaining / 7) : null;
    const weeklyAvg = weeksRemaining && remaining > 0 ? (remaining / weeksRemaining) : null;

    // BMI Calculation
    const heightM = goal.height ? goal.height / 100 : null;
    const bmi = (heightM && currentWeight) ? (currentWeight / (heightM * heightM)) : null;

    let bmiCategory = '';
    let bmiColorText = 'text-primary';
    if (bmi) {
        if (bmi < 18.5) { bmiCategory = 'Zayıf'; bmiColorText = 'text-info'; }
        else if (bmi < 25) { bmiCategory = 'Normal Kilolu'; bmiColorText = 'text-success'; }
        else if (bmi < 30) { bmiCategory = 'Fazla Kilolu'; bmiColorText = 'text-warning'; }
        else if (bmi < 35) { bmiCategory = 'Obezite (1. Derece)'; bmiColorText = 'text-error'; }
        else if (bmi < 40) { bmiCategory = 'Obezite (2. Derece)'; bmiColorText = 'text-error'; }
        else { bmiCategory = 'Aşırı Obezite (3. Derece)'; bmiColorText = 'text-error'; }
    }

    const idealWeightMin = heightM ? (18.5 * heightM * heightM).toFixed(1) : null;
    const idealWeightMax = heightM ? (24.9 * heightM * heightM).toFixed(1) : null;

    // Map BMI to a 0-100 scale for the radial progress (let's assume max BMI is 50 for gauge scale)
    const bmiPercentage = bmi ? Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100)) : 0; // 10 BMI -> 0%, 40 BMI -> 100%

    const handleSave = () => {
        dispatch({
            type: 'SET_GOAL',
            payload: {
                startWeight: parseFloat(form.startWeight) || null,
                targetWeight: parseFloat(form.targetWeight) || null,
                targetDate: form.targetDate || null,
                height: parseFloat(form.height) || null,
                age: parseInt(form.age) || null,
                gender: form.gender,
            },
        });
        setEditing(false);
    };

    const hasGoal = goal.startWeight && goal.targetWeight && goal.targetDate;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Ana Hedef</h2>
                    <p className="text-sm text-base-content/50 mt-1">Hedefini belirle, ilerlemeni takip et</p>
                </div>
                <button
                    className="btn btn-primary btn-sm rounded-xl"
                    onClick={() => {
                        setForm({
                            startWeight: goal.startWeight || '',
                            targetWeight: goal.targetWeight || '',
                            targetDate: goal.targetDate || '',
                            height: goal.height || '',
                            age: goal.age || '',
                            gender: goal.gender || 'erkek',
                        });
                        setEditing(true);
                    }}
                >
                    {hasGoal ? 'Düzenle' : 'Hedef Belirle'}
                </button>
            </div>

            {/* Edit Modal */}
            {editing && (
                <div className="modal modal-open">
                    <motion.div
                        className="modal-box rounded-2xl max-w-lg"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3 className="font-bold text-lg mb-4">Profil ve Hedef Ayarla</h3>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Kişisel Bilgiler */}
                            <div className="col-span-2 md:col-span-1 space-y-4">
                                <h4 className="font-semibold text-sm text-base-content/60 uppercase tracking-widest border-b border-base-300 pb-1">Kişisel Bilgiler</h4>
                                <div className="form-control">
                                    <label className="label"><span className="label-text">Boy (cm)</span></label>
                                    <input
                                        type="number"
                                        className="input input-bordered rounded-xl w-full"
                                        value={form.height}
                                        onChange={(e) => setForm({ ...form, height: e.target.value })}
                                        placeholder="175"
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text">Yaş</span></label>
                                    <input
                                        type="number"
                                        className="input input-bordered rounded-xl w-full"
                                        value={form.age}
                                        onChange={(e) => setForm({ ...form, age: e.target.value })}
                                        placeholder="25"
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text">Cinsiyet</span></label>
                                    <select
                                        className="select select-bordered rounded-xl w-full"
                                        value={form.gender}
                                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                    >
                                        <option value="erkek">Erkek</option>
                                        <option value="kadin">Kadın</option>
                                    </select>
                                </div>
                            </div>

                            {/* Hedef Bilgileri */}
                            <div className="col-span-2 md:col-span-1 space-y-4">
                                <h4 className="font-semibold text-sm text-base-content/60 uppercase tracking-widest border-b border-base-300 pb-1">Kilo ve Hedef</h4>
                                <div className="form-control">
                                    <label className="label"><span className="label-text">Başlangıç Kilosu (kg)</span></label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="input input-bordered rounded-xl w-full"
                                        value={form.startWeight}
                                        onChange={(e) => setForm({ ...form, startWeight: e.target.value })}
                                        placeholder="85.0"
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text">Hedef Kilo (kg)</span></label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="input input-bordered rounded-xl w-full"
                                        value={form.targetWeight}
                                        onChange={(e) => setForm({ ...form, targetWeight: e.target.value })}
                                        placeholder="75.0"
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text">Hedef Tarih</span></label>
                                    <input
                                        type="date"
                                        className="input input-bordered rounded-xl w-full"
                                        value={form.targetDate}
                                        onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-action mt-6">
                            <button className="btn btn-ghost rounded-xl" onClick={() => setEditing(false)}>İptal</button>
                            <button className="btn btn-primary rounded-xl" onClick={handleSave}>Kaydet</button>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop" onClick={() => setEditing(false)} />
                </div>
            )}

            {hasGoal ? (
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <motion.div
                            className="card bg-base-200 rounded-xl"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                        >
                            <div className="card-body p-4">
                                <p className="text-xs text-base-content/50 uppercase tracking-wide">Güncel Kilo</p>
                                <p className="text-2xl font-bold text-primary">{currentWeight ? `${currentWeight} kg` : '—'}</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="card bg-base-200 rounded-xl"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="card-body p-4">
                                <p className="text-xs text-base-content/50 uppercase tracking-wide">Hedef Kilo</p>
                                <p className="text-2xl font-bold">{targetW} kg</p>
                                {targetDate && (
                                    <p className="text-xs text-base-content/40 mt-1">
                                        {targetDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            className="card bg-base-200 rounded-xl"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            <div className="card-body p-4">
                                <p className="text-xs text-base-content/50 uppercase tracking-wide">Kalan Kilo</p>
                                <p className="text-2xl font-bold text-warning">{remaining > 0 ? `${remaining.toFixed(1)} kg` : '✓'}</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="card bg-base-200 rounded-xl"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="card-body p-4">
                                <p className="text-xs text-base-content/50 uppercase tracking-wide">Kalan Gün</p>
                                <p className="text-2xl font-bold text-info">{daysRemaining !== null ? `${daysRemaining}` : '—'}</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Weekly average info */}
                    {weeklyAvg && (
                        <motion.div
                            className="rounded-xl bg-primary/5 border border-primary/10 px-5 py-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                        >
                            <p className="text-sm text-base-content/70">
                                💡 Hedefe ulaşmak için haftalık ortalama <span className="font-bold text-primary">{weeklyAvg.toFixed(2)} kg</span> vermeniz gerekiyor.
                            </p>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Progress Bar */}
                        <motion.div
                            className="card bg-base-200 rounded-xl"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="card-body p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-medium">Hedef İlerlemesi</p>
                                    <span className="text-sm font-bold text-primary">{progress.toFixed(1)}%</span>
                                </div>
                                <progress
                                    className="progress progress-primary w-full h-3 rounded-full"
                                    value={progress}
                                    max="100"
                                />
                                <div className="flex justify-between mt-2 text-xs text-base-content/50">
                                    <span>{startW} kg</span>
                                    <span>{targetW} kg</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* BMI Visualizer */}
                        {bmi && (
                            <motion.div
                                className="card bg-base-200 rounded-xl overflow-hidden relative"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                            >
                                <div className="card-body p-5 flex flex-row items-center gap-6">
                                    <div
                                        className={`radial-progress ${bmiColorText}`}
                                        style={{ "--value": bmiPercentage, "--size": "5.5rem", "--thickness": "6px" }}
                                    >
                                        <span className="text-lg font-bold text-base-content">{bmi.toFixed(1)}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium mb-1">Vücut Kitle İndeksi (VKİ)</p>
                                        <p className={`text-lg font-bold ${bmiColorText}`}>{bmiCategory}</p>

                                        <div className="mt-2 pt-2 border-t border-base-300">
                                            <p className="text-xs text-base-content/50">İdeal Kilo Aralığınız:</p>
                                            <p className="text-sm font-medium text-base-content">{idealWeightMin} kg - {idealWeightMax} kg</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            ) : (
                <motion.div
                    className="card bg-base-200 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="card-body items-center text-center py-16">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-base-content/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <p className="text-base-content/50">Henüz bir profil oluşturmadınız.</p>
                        <p className="text-sm text-base-content/30">Yukarıdaki butona tıklayarak bilgilerinizi girebilirsiniz.</p>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
