import { writable } from 'svelte/store';
import store from "store";

const initialTodos = store.get("todos");

const persistTodos = (todos) => store.set("todos", todos);

function createTodos() {
	const { subscribe, update } = writable(initialTodos || []);

	return {
		subscribe,
		toggle: (id) => update(items => {
			const all = items.map(item => {
				if (item.id === id) {
					item.completed = !item.completed;
				}
				return item;
			});
			persistTodos(all);
			return all;
		}),
		delete: (id) => update(items => {
			const all = items.filter(item => item.id !== id);
			persistTodos(all);
			return all;
		}),
		addTodo: (text) => update(items => {
			const all = [{id: items.length, text, completed: false}, ...items];
			persistTodos(all);
			return all;
		})
	};
}

export const todos = createTodos();