import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import KiloTakip from '../components/KiloTakip';
import BedenOlculeri from '../components/BedenOlculeri';
import GymTakip from '../components/GymTakip';
import FotoTakip from '../components/FotoTakip';
import SuTakip from '../components/SuTakip';
import { useTranslation } from '../hooks/useTranslation';

import { useStore } from '../store/useStore';

export default function Takip() {
    const { state, dispatch } = useStore();
    const { t } = useTranslation();
    const activeTab = state.settings.activeTakipTab || 'kilo';

    const tabs = [
        { key: 'kilo', label: t('takip_tab_kilo') },
        { key: 'beden', label: t('takip_tab_beden') },
        { key: 'gym', label: t('takip_tab_gym') },
        { key: 'su', label: t('takip_tab_su', 'Su Takip') },
        { key: 'foto', label: t('takip_tab_foto') },
    ];

    const components = {
        kilo: KiloTakip,
        beden: BedenOlculeri,
        gym: GymTakip,
        su: SuTakip,
        foto: FotoTakip,
    };

    const ActiveComponent = components[activeTab] || KiloTakip;

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold">{t('takip_title')}</h2>
                <p className="text-sm text-base-content/50 mt-1">{t('takip_desc')}</p>
            </div>

            {/* Tabs */}
            <div role="tablist" className="tabs tabs-boxed bg-base-200 rounded-xl p-1 mb-6 flex flex-wrap gap-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        role="tab"
                        className={`tab rounded-lg font-medium transition-all duration-200 ${activeTab === tab.key ? 'tab-active bg-primary text-primary-content' : ''
                            }`}
                        onClick={() => dispatch({ type: 'SET_SETTINGS', payload: { activeTakipTab: tab.key } })}
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
                    <ActiveComponent />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
