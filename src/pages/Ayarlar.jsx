import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';

const LANGUAGES = [
    { key: 'en', label: 'English' },
    { key: 'tr', label: 'Türkçe' },
];

const THEMES = [
    { key: 'light', label: 'Light', color: '#ffffff' },
    { key: 'nord', label: 'Nord', color: '#eceff4' },
    { key: 'retro', label: 'Retro', color: '#e4d8b4' },
    { key: 'cyberpunk', label: 'Cyberpunk', color: '#ffe119' },
    { key: 'valentine', label: 'Valentine', color: '#e27181' },
    { key: 'aqua', label: 'Aqua', color: '#345da7' },
    { key: 'dim', label: 'Dim', color: '#2a303c' },
    { key: 'dracula', label: 'Dracula', color: '#282a36' },
    { key: 'dark', label: 'Dark', color: '#1d232a' },
    { key: 'synthwave', label: 'Synthwave', color: '#1a103c' },
    { key: 'coffee', label: 'Coffee', color: '#20161f' },
    { key: 'luxury', label: 'Luxury', color: '#09090b' },
];

export default function Ayarlar() {
    const { state, dispatch } = useStore();
    const { settings } = state;
    const { t } = useTranslation();
    const [showReset, setShowReset] = useState(false);



    const setLanguage = (language) => {
        dispatch({ type: 'SET_SETTINGS', payload: { language } });
    };

    const handleReset = () => {
        dispatch({ type: 'RESET_ALL' });
        setShowReset(false);
    };

    const handleExport = () => {
        const data = JSON.stringify(state, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `fittakip_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                dispatch({ type: 'IMPORT_DATA', payload: parsed });
                e.target.value = null;
                alert(t('settings_import_success'));
            } catch (error) {
                console.error('Import error:', error);
                alert(t('settings_import_error'));
            }
        };
        reader.readAsText(file);
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold">{t('settings_title')}</h2>
                <p className="text-sm text-base-content/50 mt-1">{t('settings_desc')}</p>
            </div>

            <div className="space-y-4 max-w-md">
                {/* Theme toggle */}
                <motion.div
                    className="card bg-base-200 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                >
                    <div className="card-body p-4">
                        <div className="flex flex-col gap-3">
                            <div>
                                <h3 className="font-semibold text-sm">{t('settings_theme')}</h3>
                                <p className="text-xs text-base-content/40">{t('settings_theme_desc', 'Uygulama temasını seçin')}</p>
                            </div>
                            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                {THEMES.map((theme) => (
                                    <button
                                        key={theme.key}
                                        onClick={() => dispatch({ type: 'SET_SETTINGS', payload: { theme: theme.key } })}
                                        className={`h-10 rounded-xl relative overflow-hidden transition-all duration-200 border-2 ${settings.theme === theme.key ? 'border-primary' : 'border-transparent hover:scale-105'}`}
                                        style={{ backgroundColor: theme.color }}
                                        title={theme.label}
                                    >
                                        {settings.theme === theme.key && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <span className="text-white drop-shadow-md font-bold text-sm">✓</span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Language dropdown */}
                <motion.div
                    className="card bg-base-200 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-sm">{t('settings_lang')}</h3>
                                <p className="text-xs text-base-content/40">{t('settings_lang_desc')}</p>
                            </div>
                            <select
                                className="select select-bordered select-sm rounded-xl w-36"
                                value={settings.language}
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                {LANGUAGES.map((lang) => (
                                    <option key={lang.key} value={lang.key}>{lang.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Export */}
                <motion.div
                    className="card bg-base-200 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-sm">{t('settings_export_title', 'Verileri İndir')}</h3>
                                <p className="text-xs text-base-content/40">{t('settings_export_desc', 'Kayıtlarınızı cihazınıza yedekleyin')}</p>
                            </div>
                            <button
                                className="btn btn-primary btn-sm rounded-xl"
                                onClick={handleExport}
                            >
                                {t('settings_btn_export', 'İndir')}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Import */}
                <motion.div
                    className="card bg-base-200 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.17 }}
                >
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-sm">{t('settings_import_title', 'Veri Yükle')}</h3>
                                <p className="text-xs text-base-content/40">{t('settings_import_desc', 'Önceki yedeğinizi cihazınıza aktarın')}</p>
                            </div>
                            <label className="btn btn-secondary btn-sm rounded-xl cursor-pointer">
                                {t('settings_btn_import', 'Yükle')}
                                <input
                                    type="file"
                                    accept=".json"
                                    className="hidden"
                                    onChange={handleImport}
                                />
                            </label>
                        </div>
                    </div>
                </motion.div>

                {/* Reset */}
                <motion.div
                    className="card bg-base-200 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-sm">{t('settings_reset')}</h3>
                                <p className="text-xs text-base-content/40">{t('settings_reset_desc')}</p>
                            </div>
                            <button
                                className="btn btn-error btn-sm rounded-xl"
                                onClick={() => setShowReset(true)}
                            >
                                {t('settings_btn_reset')}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Reset Confirmation */}
            {showReset && (
                <div className="modal modal-open">
                    <motion.div
                        className="modal-box rounded-2xl max-w-sm"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.15 }}
                    >
                        <h3 className="font-bold text-lg mb-2">{t('settings_confirm_title')}</h3>
                        <p className="text-sm text-base-content/60">
                            {t('settings_confirm_desc')}
                        </p>
                        <div className="modal-action">
                            <button className="btn btn-ghost btn-sm rounded-xl" onClick={() => setShowReset(false)}>{t('modal_btn_cancel')}</button>
                            <button className="btn btn-error btn-sm rounded-xl" onClick={handleReset}>{t('settings_btn_reset')}</button>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop" onClick={() => setShowReset(false)} />
                </div>
            )}
        </div>
    );
}
