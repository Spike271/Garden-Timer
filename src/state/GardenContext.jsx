import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {MAX_STAGE} from './constants';
import {STORAGE_KEYS} from '../config';

const newSeed = () => ({stage: 0, wilted: false});

// plants: array of { stage, wilted }. The last plant is the active one.
function loadPlants() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.GARDEN);
        if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list) && list.length) return list;
        }
        // Migrate the single-plant save from the previous version.
        const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_PLANT);
        if (legacy) {
            const old = JSON.parse(legacy);
            return [{stage: Math.min(MAX_STAGE, old.stage ?? 0), wilted: !!old.wilted}];
        }
    } catch {
        // Corrupt save: start fresh.
    }
    return [newSeed()];
}

const GardenContext = createContext(null);

export function GardenProvider({children}) {
    const [plants, setPlants] = useState(loadPlants);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.GARDEN, JSON.stringify(plants));
        } catch {
            // Storage unavailable: the garden still works for this session.
        }
    }, [plants]);

    // Completed focus session: the active plant grows and clears any wilt.
    // If the active plant is already a healthy bloom, plant a new seed as the new active plant.
    const grow = useCallback(() => {
        setPlants((list) => {
            const next = list.slice();
            const last = next[next.length - 1];
            if (last.stage >= MAX_STAGE && !last.wilted) {
                next.push(newSeed());
            } else {
                next[next.length - 1] = {stage: Math.min(MAX_STAGE, last.stage + 1), wilted: false};
            }
            return next;
        });
    }, []);

    // Skipped focus session: the active plant drops one stage and wilts.
    const wilt = useCallback(() => {
        setPlants((list) => {
            const next = list.slice();
            const last = next[next.length - 1];
            next[next.length - 1] = {stage: Math.max(0, last.stage - 1), wilted: true};
            return next;
        });
    }, []);

    const value = useMemo(() => ({plants, grow, wilt}), [plants, grow, wilt]);
    return <GardenContext.Provider value={value}>{children}</GardenContext.Provider>;
}

export function useGarden() {
    const ctx = useContext(GardenContext);
    if (!ctx) throw new Error('useGarden must be used inside GardenProvider');
    return ctx;
}
