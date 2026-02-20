import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

const LANGS = [
    { key: 'tr', label: 'Türkçe' },
    { key: 'en', label: 'English' },
];

export default function Ayarlar() {
    const { state, dispatch } = useStore();
    const { settings } = state;
    const [showReset, setShowReset] = useState(false);

    const setTheme = (theme) => {
        dispatch({ type: 'SET_SETTINGS', payload: { theme } });
    };

    const setLanguage = (language) => {
        dispatch({ type: 'SET_SETTINGS', payload: { language } });
    };

    const handleReset = () => {
        dispatch({ type: 'RESET_ALL' });
        setShowReset(false);
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Ayarlar</h2>
                <p className="text-sm text-base-content/50 mt-1">Uygulama tercihlerini yönetin</p>
            </div>

            <div className="space-y-6 max-w-lg">
                {/* Theme */}
                <motion.div
                    className="card bg-base-200 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                >
                    <div className="card-body p-5">
                        <h3 className="font-semibold mb-3">Tema</h3>
                        <div className="flex gap-2">
                            <button
                                className={`btn btn-sm rounded-xl flex-1 ${settings.theme === 'dark' ? 'btn-primary' : 'btn-ghost bg-base-300'}`}
                                onClick={() => setTheme('dark')}
                            >
                                🌙 Koyu
                            </button>
                            <button
                                className={`btn btn-sm rounded-xl flex-1 ${settings.theme === 'light' ? 'btn-primary' : 'btn-ghost bg-base-300'}`}
                                onClick={() => setTheme('light')}
                            >
                                ☀️ Açık
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Language */}
                <motion.div
                    className="card bg-base-200 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="card-body p-5">
                        <h3 className="font-semibold mb-3">Dil</h3>
                        <div className="flex gap-2">
                            {LANGS.map((lang) => (
                                <button
                                    key={lang.key}
                                    className={`btn btn-sm rounded-xl flex-1 ${settings.language === lang.key ? 'btn-primary' : 'btn-ghost bg-base-300'}`}
                                    onClick={() => setLanguage(lang.key)}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Reset */}
                <motion.div
                    className="card bg-base-200 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <div className="card-body p-5">
                        <h3 className="font-semibold mb-1">Verileri Sıfırla</h3>
                        <p className="text-xs text-base-content/50 mb-4">
                            Tüm hedefler, programlar, takip verileri ve fotoğraflar silinecektir. Bu işlem geri alınamaz.
                        </p>
                        <button
                            className="btn btn-error btn-sm rounded-xl w-full"
                            onClick={() => setShowReset(true)}
                        >
                            Tüm Verileri Sıfırla
                        </button>
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
                        <h3 className="font-bold text-lg mb-2">Emin misiniz?</h3>
                        <p className="text-sm text-base-content/60">
                            Tüm uygulama verileri kalıcı olarak silinecektir. Bu işlem geri alınamaz.
                        </p>
                        <div className="modal-action">
                            <button className="btn btn-ghost btn-sm rounded-xl" onClick={() => setShowReset(false)}>İptal</button>
                            <button className="btn btn-error btn-sm rounded-xl" onClick={handleReset}>Sıfırla</button>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop" onClick={() => setShowReset(false)} />
                </div>
            )}
        </div>
    );
}
