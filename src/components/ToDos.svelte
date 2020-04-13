<script>
  import ToDoItem from "./ToDoItem.svelte";
  import Empty from "./Empty.svelte";
  import { todos } from "../stores/todos.js";
  import { ui, TABS } from "../stores/ui.js";

  let displayedTodos;

  const setDisplayed = (todos, active) =>
    ({
      [TABS.ALL]: todos,
      [TABS.ACTIVE]: todos.filter(todo => todo.completed === false),
      [TABS.DONE]: todos.filter(todo => todo.completed === true)
    }[active]);

  todos.subscribe(todos => {
    displayedTodos = setDisplayed(todos, $ui.activeTab);
  });

  ui.subscribe(ui => {
    displayedTodos = setDisplayed($todos, ui.activeTab);
  });

  const handleSelect = ({ detail: { id } }) => {
    todos.toggle(id);
  };

  const handleDelete = ({ detail: { id } }) => {
    todos.delete(id);
  };
</script>

<style>
  .content {
    padding-top: 100px;
    padding-bottom: 100px;
  }
</style>

<div class="content">
  {#each displayedTodos as todo, index}
    <ToDoItem
      {todo}
      index={index}
      on:todoItemClick={handleSelect}
      on:todoItemDelete={handleDelete} />
  {:else}
    <Empty activeTab={$ui.activeTab} />
  {/each}
</div>
