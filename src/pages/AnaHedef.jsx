import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import Dashboard from '../components/Dashboard';
export default function AnaHedef() {
    const { state, dispatch } = useStore();
    const { goal, weightLog } = state;
    const { t } = useTranslation();

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
        if (bmi < 18.5) { bmiCategory = t('anahedef_bmi_under'); bmiColorText = 'text-info'; }
        else if (bmi < 25) { bmiCategory = t('anahedef_bmi_normal'); bmiColorText = 'text-success'; }
        else if (bmi < 30) { bmiCategory = t('anahedef_bmi_over'); bmiColorText = 'text-warning'; }
        else if (bmi < 35) { bmiCategory = t('anahedef_bmi_obese1'); bmiColorText = 'text-error'; }
        else if (bmi < 40) { bmiCategory = t('anahedef_bmi_obese2'); bmiColorText = 'text-error'; }
        else { bmiCategory = t('anahedef_bmi_obese3'); bmiColorText = 'text-error'; }
    }

    const idealWeightMin = heightM ? (18.5 * heightM * heightM).toFixed(1) : null;
    const idealWeightMax = heightM ? (24.9 * heightM * heightM).toFixed(1) : null;

    // Map BMI to a 0-100 scale for the radial progress (let's assume max BMI is 50 for gauge scale)
    const bmiPercentage = bmi ? Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100)) : 0; // 10 BMI -> 0%, 40 BMI -> 100%

    // Body Fat % Estimation (Deurenberg formula: BF% = 1.20 × BMI + 0.23 × Age − 10.8 × Sex − 5.4)
    // Sex: 1 for male, 0 for female
    const bodyFat = (bmi && goal.age) ? (
        1.20 * bmi + 0.23 * goal.age - 10.8 * (goal.gender === 'erkek' ? 1 : 0) - 5.4
    ) : null;

    let bfCategory = '';
    let bfColor = 'text-primary';
    if (bodyFat !== null) {
        if (goal.gender === 'erkek') {
            if (bodyFat < 6) { bfCategory = t('bf_essential', 'Düşük'); bfColor = 'text-info'; }
            else if (bodyFat < 14) { bfCategory = t('bf_athletic', 'Atletik'); bfColor = 'text-success'; }
            else if (bodyFat < 18) { bfCategory = t('bf_fit', 'Fit'); bfColor = 'text-success'; }
            else if (bodyFat < 25) { bfCategory = t('bf_avg', 'Ortalama'); bfColor = 'text-warning'; }
            else { bfCategory = t('bf_high', 'Yüksek'); bfColor = 'text-error'; }
        } else {
            if (bodyFat < 14) { bfCategory = t('bf_essential', 'Düşük'); bfColor = 'text-info'; }
            else if (bodyFat < 21) { bfCategory = t('bf_athletic', 'Atletik'); bfColor = 'text-success'; }
            else if (bodyFat < 25) { bfCategory = t('bf_fit', 'Fit'); bfColor = 'text-success'; }
            else if (bodyFat < 32) { bfCategory = t('bf_avg', 'Ortalama'); bfColor = 'text-warning'; }
            else { bfCategory = t('bf_high', 'Yüksek'); bfColor = 'text-error'; }
        }
    }
    const bfPercentage = bodyFat ? Math.min(100, Math.max(0, ((bodyFat) / 45) * 100)) : 0;

    // BMR Calculation (Mifflin-St Jeor formula)
    let bmr = null;
    if (currentWeight && goal.height && goal.age) {
        if (goal.gender === 'erkek') {
            bmr = (10 * currentWeight) + (6.25 * goal.height) - (5 * goal.age) + 5;
        } else {
            bmr = (10 * currentWeight) + (6.25 * goal.height) - (5 * goal.age) - 161;
        }
    }

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

    const MOTIVATIONAL_QUOTES = [
        "Bugün dünden daha güçlüsün.",
        "Küçük adımlar büyük değişimler yaratır.",
        "Acı geçicidir, gurur kalıcıdır.",
        "Vücudun sana teşekkür edecek.",
        "Disiplin motivasyonun bittiği yerde başlar.",
        "Her antrenman bir yatırımdır.",
        "Hedefini unutma, yoluna devam et.",
        "En zor adım ilk adımdır, onu zaten attın.",
        "Bugünkü ter, yarının gülümsemesidir.",
        "Limitlerini sen belirlersin.",
        "Mükemmel olmak zorunda değilsin, tutarlı ol yeter.",
        "Bir ay sonra başlamış olmayı dileyeceksin. Başla.",
        "Kendinle yarış, başkasıyla değil.",
        "Bedeni güçlü olan, zihni de güçlüdür.",
        "Vazgeçme, en iyi versiyonun seni bekliyor.",
        "Bugün kolay olmayacak ama buna değecek.",
        "Her gün %1 daha iyi ol.",
        "Başarı alışkanlıkların toplamıdır.",
        "Rahatlık bölgesinin dışında büyürsün.",
        "Terle, çalış, tekrarla.",
        "Güçlü ol, kendin için yap.",
        "Hedefin seni ayağa kaldırsın.",
        "Dün bıraktığın yerden devam et.",
        "Süreç zor ama sonuç muhteşem.",
        "Bugün yapmak istemediğin şeyi yap, farkı o yaratır.",
        "Sen düşündüğünden daha güçlüsün.",
        "İlerleme mükemmellikten önemlidir.",
        "Sadece başla, gerisini vücudun halleder.",
        "Bu bir maraton, sprint değil. Sabırlı ol.",
        "Kendine verdiğin sözü tut.",
    ];

    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const todayQuote = MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold">{t('anahedef_title')}</h2>
                    <p className="text-sm text-base-content/50 mt-1">{t('anahedef_desc')}</p>
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
                    {hasGoal ? t('anahedef_btn_edit') : t('anahedef_btn_set')}
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
                        <h3 className="font-bold text-lg mb-4">{t('modal_profile_title')}</h3>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Kişisel Bilgiler */}
                            <div className="col-span-2 md:col-span-1 space-y-4">
                                <h4 className="font-semibold text-sm text-base-content/60 uppercase tracking-widest border-b border-base-300 pb-1">{t('modal_profile_personal')}</h4>
                                <div className="form-control">
                                    <label className="label"><span className="label-text">{t('modal_profile_height')}</span></label>
                                    <input
                                        type="number"
                                        className="input input-bordered rounded-xl w-full"
                                        value={form.height}
                                        onChange={(e) => setForm({ ...form, height: e.target.value })}
                                        placeholder="175"
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text">{t('modal_profile_age')}</span></label>
                                    <input
                                        type="number"
                                        className="input input-bordered rounded-xl w-full"
                                        value={form.age}
                                        onChange={(e) => setForm({ ...form, age: e.target.value })}
                                        placeholder="25"
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text">{t('modal_profile_gender')}</span></label>
                                    <select
                                        className="select select-bordered rounded-xl w-full"
                                        value={form.gender}
                                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                    >
                                        <option value="erkek">{t('modal_profile_male')}</option>
                                        <option value="kadin">{t('modal_profile_female')}</option>
                                    </select>
                                </div>
                            </div>

                            {/* Hedef Bilgileri */}
                            <div className="col-span-2 md:col-span-1 space-y-4">
                                <h4 className="font-semibold text-sm text-base-content/60 uppercase tracking-widest border-b border-base-300 pb-1">{t('modal_profile_goalinfo')}</h4>
                                <div className="form-control">
                                    <label className="label"><span className="label-text">{t('modal_profile_start_weight')}</span></label>
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
                                    <label className="label"><span className="label-text">{t('modal_profile_target_weight')}</span></label>
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
                                    <label className="label"><span className="label-text">{t('modal_profile_target_date')}</span></label>
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
                            <button className="btn btn-ghost rounded-xl" onClick={() => setEditing(false)}>{t('modal_btn_cancel')}</button>
                            <button className="btn btn-primary rounded-xl" onClick={handleSave}>{t('modal_btn_save')}</button>
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
                                <p className="text-xs text-base-content/50 uppercase tracking-wide">{t('anahedef_current')}</p>
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
                                <p className="text-xs text-base-content/50 uppercase tracking-wide">{t('anahedef_target')}</p>
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
                                <p className="text-xs text-base-content/50 uppercase tracking-wide">{t('anahedef_remaining_kg')}</p>
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
                                <p className="text-xs text-base-content/50 uppercase tracking-wide">{t('anahedef_remaining_days')}</p>
                                <p className="text-2xl font-bold text-info">{daysRemaining !== null ? `${daysRemaining}` : '—'}</p>
                            </div>
                        </motion.div>
                    </div>

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
                                    <p className="text-sm font-medium">{t('anahedef_progress')}</p>
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
                                        <p className="text-sm font-medium mb-1">{t('anahedef_bmi_title')}</p>
                                        <p className={`text-lg font-bold ${bmiColorText}`}>{bmiCategory}</p>

                                        <div className="mt-2 pt-2 border-t border-base-300">
                                            <p className="text-xs text-base-content/50">{t('anahedef_bmi_ideal')}</p>
                                            <p className="text-sm font-medium text-base-content">{idealWeightMin} kg - {idealWeightMax} kg</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Body Fat Estimation */}
                        {bodyFat !== null && (
                            <motion.div
                                className="card bg-base-200 rounded-xl overflow-hidden relative"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="card-body p-5 flex flex-row items-center gap-6">
                                    <div
                                        className={`radial-progress ${bfColor}`}
                                        style={{ "--value": bfPercentage, "--size": "5.5rem", "--thickness": "6px" }}
                                    >
                                        <span className="text-lg font-bold text-base-content">%{bodyFat.toFixed(1)}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium mb-1">{t('bf_title', 'Vücut Yağ Oranı')}</p>
                                        <p className={`text-lg font-bold ${bfColor}`}>{bfCategory}</p>
                                        <div className="mt-2 pt-2 border-t border-base-300">
                                            <p className="text-xs text-base-content/50 leading-relaxed">
                                                {t('bf_note', '* Deurenberg formülüyle tahmini hesaplanmıştır. Tıbbi veya kesin bir sonuç vermez.')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Energy Estimation */}
                        {bmr !== null && (
                            <motion.div
                                className="card bg-base-200 rounded-xl overflow-hidden relative"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45 }}
                            >
                                <div className="card-body p-5 flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`radial-progress text-secondary`}
                                            style={{ "--value": 100, "--size": "4.5rem", "--thickness": "5px" }}
                                        >
                                            <span className="text-xl">🔥</span>
                                        </div>
                                        <div className="flex flex-col gap-2 flex-1">
                                            <div>
                                                <p className="text-sm font-medium text-base-content/70">{t('bmr_title', 'Bazal Metabolizma')}</p>
                                                <p className={`text-lg font-bold text-secondary`}>{Math.round(bmr)} <span className="text-xs font-normal text-base-content/60">kcal</span></p>
                                            </div>
                                            <div className="border-t border-base-300 pt-1">
                                                <p className="text-sm font-medium text-base-content/70">{t('tdee_title', 'Günlük Kalori İhtiyacı')}</p>
                                                <p className={`text-lg font-bold text-primary`}>{Math.round(bmr * 1.3)} <span className="text-xs font-normal text-base-content/60">kcal</span></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-base-300">
                                        <p className="text-xs text-base-content/50 leading-relaxed">
                                            {t('bmr_disclaimer', '* Hareketlilik seviyesi ortalama kabul edilerek hesaplanmış tahmini değerlerdir.')}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Weekly average info (moved to bottom) */}
                    {weeklyAvg && (
                        <motion.div
                            className="rounded-xl bg-primary/5 border border-primary/10 px-5 py-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <p className="text-sm text-base-content/70">
                                {t('anahedef_weekly_avg_1')} <span className="font-bold text-primary">{weeklyAvg.toFixed(2)} kg</span> {t('anahedef_weekly_avg_2')}
                            </p>
                        </motion.div>
                    )}
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
                        <p className="text-base-content/50">{t('anahedef_no_goal')}</p>
                        <p className="text-sm text-base-content/30">{t('anahedef_no_goal_desc')}</p>
                    </div>
                </motion.div>
            )}

            {/* Dashboard Section */}
            <div className="mt-6">
                <Dashboard />
            </div>

            {/* Motivational Quote */}
            <motion.div
                className="card bg-base-200 rounded-xl mt-6"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.3 }}
            >
                <div className="card-body p-4 text-center">
                    <p className="text-sm italic text-base-content/70">💪 "{todayQuote}"</p>
                </div>
            </motion.div>
        </div>
    );
}
