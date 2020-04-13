import { writable } from 'svelte/store';
import store from "store";

export const TABS = {
    ACTIVE: "active",
    ALL: "all",
    DONE: "done",
}

const initialUIState = {
    activeTab: store.get("activeTab") || TABS.ALL,
    inputBoxShown: false,
}

const createUIStore = () => {
    const {subscribe, update} = writable(initialUIState);

    return {
        subscribe,
        setActiveTab: (activeTab) => update(state => {
            store.set("activeTab", activeTab);
            return {
                ...state,
                activeTab
            }
        }),
        setInputBoxShown: (inputBoxShown) => update(state => ({
            ...state,
            inputBoxShown
        })),
    }
}

export const ui = createUIStore();
