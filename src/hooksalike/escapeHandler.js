import { onDestroy } from 'svelte';

export function escapeHandler(setter) {
    const onPopState = () => {
        setter(false);
    };

    const escFunction = (event) => {
        if (event.keyCode === 27) {
            setter(false);
        }
    };

    window.addEventListener("popstate", onPopState);
    document.addEventListener("keydown", escFunction, false);

    window.history.pushState({ drawer: Math.random() }, "Drawer");

	onDestroy(() => {
        window.removeEventListener("popstate", onPopState);
        document.removeEventListener("keydown", escFunction, false);
    });
}