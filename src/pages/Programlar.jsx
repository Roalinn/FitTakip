import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DiyetProgrami from '../components/DiyetProgrami';
import GymProgrami from '../components/GymProgrami';
import { useTranslation } from '../hooks/useTranslation';

export default function Programlar() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('diyet');

    const tabs = [
        { key: 'diyet', label: t('prog_tab_diyet', 'Diyet Programı') },
        { key: 'gym', label: t('prog_tab_gym', 'Gym Programı') },
    ];

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold">{t('prog_title', 'Programlar')}</h2>
                <p className="text-sm text-base-content/50 mt-1">{t('prog_desc', 'Diyet ve gym programlarınızı yönetin')}</p>
            </div>

            {/* Tabs */}
            <div role="tablist" className="tabs tabs-boxed bg-base-200 rounded-xl p-1 mb-6 inline-flex">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        role="tab"
                        className={`tab rounded-lg font-medium transition-all duration-200 ${activeTab === tab.key ? 'tab-active bg-primary text-primary-content' : ''
                            }`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'diyet' ? <DiyetProgrami /> : <GymProgrami />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
