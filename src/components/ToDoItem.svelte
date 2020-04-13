<script>
  import { slide } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import Active from "../images/checkmark-active.svg";
  import Inactive from "../images/checkmark-inactive.svg";
  import Close from "../images/close.svg";

  const dispatch = createEventDispatcher();

  export let todo;

  const handleClick = () => {
    dispatch("todoItemClick", {
      id: todo.id
    });
  };

  const handleDelete = () => {
    dispatch("todoItemDelete", {
      id: todo.id
    });
  };
</script>

<style>
  .item {
    display: flex;
    align-items: center;
    border-bottom: solid 1px #f5f5f5;
    transition: all 0.3s ease-in-out;
  }

  .item.completed {
    text-decoration: line-through;
  }

  .item:hover {
    background: #f7f7f7;
  }

  .text {
    flex-grow: 1;
  }

  .icon {
    margin: 20px;
    transition: all 0.2s ease-in;
    cursor: pointer;
    height: 24px;
  }
  .icon:hover {
    transform: scale(1.1);
  }

  .icon:last-of-type {
    fill: #c30101;
  }
</style>

<div transition:slide class="item {todo.completed && 'completed'}" on:click={handleClick}>
  <div class="icon">
    {@html todo.completed ? Active : Inactive}
  </div>
  <div class="text">{todo.text}</div>
  <div class="icon" on:click|stopPropagation={handleDelete}>
    {@html Close}
  </div>
</div>
