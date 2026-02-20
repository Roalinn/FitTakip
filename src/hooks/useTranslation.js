import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import translations from '../locales';

export function useTranslation() {
    const { state } = useStore();
    const lang = state.settings.language || 'tr';

    const t = useMemo(() => {
        // Fallback to Turkish if translation is missing in the target language
        return (key, fallback) => translations[lang]?.[key] || translations['tr']?.[key] || fallback || key;
    }, [lang]);

    return { t, lang };
}
