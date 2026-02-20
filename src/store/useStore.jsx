import React, { createContext, useContext, useReducer, useEffect } from 'react';

const StoreContext = createContext();

const STORAGE_KEY = 'fittakip_data';

const defaultState = {
    settings: {
        theme: 'dark',
        language: 'en',
        activeTakipTab: 'kilo',
        activeProgramTab: 'diyet',
    },
    goal: {
        startWeight: null,
        targetWeight: null,
        targetDate: null,
        height: null,
        age: null,
        gender: 'erkek',
    },
    dietProgram: {
        pazartesi: [], sali: [], carsamba: [], persembe: [], cuma: [], cumartesi: [], pazar: [],
    },
    gymProgram: {
        pazartesi: [], sali: [], carsamba: [], persembe: [], cuma: [], cumartesi: [], pazar: [],
    },
    weightLog: [],
    bodyMeasurements: [],
    gymLog: [],
    photos: [],
    waterLog: [],
    gymTemplates: [],
};

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return { ...defaultState, ...parsed, settings: { ...defaultState.settings, ...(parsed.settings || {}) } };
        }
    } catch (e) {
        console.error('State load error:', e);
    }
    return defaultState;
}

function reducer(state, action) {
    switch (action.type) {
        case 'SET_SETTINGS':
            return { ...state, settings: { ...state.settings, ...action.payload } };
        case 'RESET_ALL':
            return { ...defaultState, settings: state.settings };
        case 'IMPORT_DATA':
            return { ...defaultState, ...action.payload, settings: { ...state.settings, ...(action.payload.settings || {}) } };

        case 'SET_GOAL':
            return { ...state, goal: { ...state.goal, ...action.payload } };

        case 'SET_DIET_PROGRAM':
            return {
                ...state,
                dietProgram: { ...state.dietProgram, [action.day]: action.payload },
            };
        case 'ADD_DIET_MEAL':
            return {
                ...state,
                dietProgram: {
                    ...state.dietProgram,
                    [action.day]: [...state.dietProgram[action.day], action.payload],
                },
            };
        case 'EDIT_DIET_MEAL':
            return {
                ...state,
                dietProgram: {
                    ...state.dietProgram,
                    [action.day]: state.dietProgram[action.day].map((m, i) => i === action.index ? action.payload : m),
                },
            };
        case 'DELETE_DIET_MEAL':
            return {
                ...state,
                dietProgram: {
                    ...state.dietProgram,
                    [action.day]: state.dietProgram[action.day].filter((_, i) => i !== action.index),
                },
            };

        case 'SET_GYM_PROGRAM':
            return {
                ...state,
                gymProgram: { ...state.gymProgram, [action.day]: action.payload },
            };
        case 'ADD_GYM_EXERCISE':
            return {
                ...state,
                gymProgram: {
                    ...state.gymProgram,
                    [action.day]: [...state.gymProgram[action.day], action.payload],
                },
            };
        case 'EDIT_GYM_EXERCISE':
            return {
                ...state,
                gymProgram: {
                    ...state.gymProgram,
                    [action.day]: state.gymProgram[action.day].map((m, i) => i === action.index ? action.payload : m),
                },
            };
        case 'DELETE_GYM_EXERCISE':
            return {
                ...state,
                gymProgram: {
                    ...state.gymProgram,
                    [action.day]: state.gymProgram[action.day].filter((_, i) => i !== action.index),
                },
            };

        case 'ADD_WEIGHT':
            return {
                ...state,
                weightLog: [...state.weightLog, action.payload].sort(
                    (a, b) => new Date(a.date) - new Date(b.date)
                ),
            };
        case 'EDIT_WEIGHT':
            return {
                ...state,
                weightLog: state.weightLog.map((w, i) => i === action.index ? action.payload : w).sort(
                    (a, b) => new Date(a.date) - new Date(b.date)
                ),
            };
        case 'DELETE_WEIGHT':
            return {
                ...state,
                weightLog: state.weightLog.filter((_, i) => i !== action.index),
            };

        case 'ADD_BODY_MEASUREMENT':
            return {
                ...state,
                bodyMeasurements: [...state.bodyMeasurements, action.payload].sort(
                    (a, b) => new Date(a.date) - new Date(b.date)
                ),
            };
        case 'EDIT_BODY_MEASUREMENT':
            return {
                ...state,
                bodyMeasurements: state.bodyMeasurements.map((m, i) => i === action.index ? action.payload : m).sort(
                    (a, b) => new Date(a.date) - new Date(b.date)
                ),
            };
        case 'DELETE_BODY_MEASUREMENT':
            return {
                ...state,
                bodyMeasurements: state.bodyMeasurements.filter((_, i) => i !== action.index),
            };

        case 'ADD_GYM_LOG':
            return {
                ...state,
                gymLog: [...state.gymLog, action.payload].sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                ),
            };
        case 'EDIT_GYM_LOG':
            return {
                ...state,
                gymLog: state.gymLog.map((g, i) => i === action.index ? action.payload : g).sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                ),
            };
        case 'DELETE_GYM_LOG':
            return {
                ...state,
                gymLog: state.gymLog.filter((_, i) => i !== action.index),
            };

        case 'ADD_PHOTO':
            return {
                ...state,
                photos: [...state.photos, action.payload].sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                ),
            };
        case 'DELETE_PHOTO':
            return {
                ...state,
                photos: state.photos.filter((_, i) => i !== action.index),
            };

        case 'SET_WATER': {
            const existing = (state.waterLog || []).find(w => w.date === action.date);
            if (existing) {
                return {
                    ...state,
                    waterLog: state.waterLog.map(w => w.date === action.date ? { ...w, glasses: action.glasses } : w),
                };
            }
            return {
                ...state,
                waterLog: [...(state.waterLog || []), { date: action.date, glasses: action.glasses }],
            };
        }

        case 'SAVE_GYM_TEMPLATE':
            return {
                ...state,
                gymTemplates: [...(state.gymTemplates || []), action.payload],
            };
        case 'DELETE_GYM_TEMPLATE':
            return {
                ...state,
                gymTemplates: (state.gymTemplates || []).filter((_, i) => i !== action.index),
            };

        default:
            return state;
    }
}

export function StoreProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, null, loadState);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    // Apply theme to <html>
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', state.settings.theme);
    }, [state.settings.theme]);

    return (
        <StoreContext.Provider value={{ state, dispatch }}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    const context = useContext(StoreContext);
    if (!context) throw new Error('useStore must be used within StoreProvider');
    return context;
}
