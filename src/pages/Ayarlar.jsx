import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';

const LANGUAGES = [
    { key: 'tr', label: 'Türkçe' },
    { key: 'en', label: 'English' },
];

export default function Ayarlar() {
    const { state, dispatch } = useStore();
    const { settings } = state;
    const { t } = useTranslation();
    const [showReset, setShowReset] = useState(false);

    const toggleTheme = () => {
        dispatch({ type: 'SET_SETTINGS', payload: { theme: settings.theme === 'dark' ? 'light' : 'dark' } });
    };

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
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-sm">{t('settings_theme')}</h3>
                                <p className="text-xs text-base-content/40">{settings.theme === 'dark' ? t('settings_theme_dark') : t('settings_theme_light')}</p>
                            </div>
                            <label className="swap swap-rotate">
                                <input
                                    type="checkbox"
                                    checked={settings.theme === 'light'}
                                    onChange={toggleTheme}
                                />
                                <svg className="swap-on h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                                </svg>
                                <svg className="swap-off h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                                </svg>
                            </label>
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

                {/* Export & Import */}
                <motion.div
                    className="card bg-base-200 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <div className="card-body p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-sm">{t('settings_data')}</h3>
                                <p className="text-xs text-base-content/40">{t('settings_data_desc')}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                className="btn btn-outline btn-sm rounded-xl flex-1"
                                onClick={handleExport}
                            >
                                {t('settings_export')}
                            </button>
                            <label className="btn btn-outline btn-sm rounded-xl flex-1 cursor-pointer">
                                {t('settings_import')}
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
