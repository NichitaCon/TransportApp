import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SavedStop = {
    id: string;
    name: string;
    stopNum: string;
};

type SavedStopsStore = {
    saved: SavedStop[];
    toggle: (id: string, name: string, stopNum: string) => void;
    isSaved: (id: string) => boolean;
    clear: () => void;
};

export const useSavedStops = create<SavedStopsStore>()(
    persist(
        (set, get) => ({
            saved: [],
            toggle: (id, name, stopNum) => {
                console.log("saved toggle pressed for stop_id:", id);
                const current = get().saved;
                const exists = current.some((s) => s.id === id);
                const updated = exists
                    ? current.filter((s) => s.id !== id)
                    : [...current, { id, name, stopNum }];
                set({ saved: updated });
            },
            isSaved: (id) => get().saved.some((s) => s.id === id),
            clear: () => set({ saved: [] }),
        }),
        {
            name: "saved-stops",
            storage: {
                getItem: async (key) => {
                    const value = await AsyncStorage.getItem(key);
                    return value ? JSON.parse(value) : null;
                },
                setItem: async (key, value) => {
                    await AsyncStorage.setItem(key, JSON.stringify(value));
                },
                removeItem: async (key) => {
                    await AsyncStorage.removeItem(key);
                },
            },
        },
    ),
);
