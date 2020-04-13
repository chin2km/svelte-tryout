<script>
  import Add from "../images/checkmark-active.svg";
  import { ui } from "../stores/ui.js";
  import { escapeHandler } from "../hooksalike/escapeHandler.js";
  import { createEventDispatcher, onMount } from "svelte";
  const dispatch = createEventDispatcher();

  let inputText = "";
  let inputElement;

  onMount(() => {
    inputElement.focus();
    escapeHandler(ui.setInputBoxShown);
  });

  function handleKeydown(event) {
    if (event.keyCode === 13) {
      addToDo();
    }
  }

  const addToDo = () => {
    if (inputText.trim()) {
      ui.setInputBoxShown(false);

      dispatch("addToDo", {
        text: inputText
      });
    }
  };
</script>

<style>
  .layout {
    display: flex;
    width: 100%;
    height: 100%;
    position: fixed;
    backdrop-filter: blur(5px);
    z-index: 1000;
    justify-content: center;
    align-items: center;
    top: 0px;
    background: rgba(255, 255, 255, 0.76);
  }

  input {
    border-radius: 30px;
    border: none;
    padding: 20px;
    width: 60%;
    box-shadow: 0px 1px 80px 0 #00000033;
    outline: none !important;
    box-sizing: border-box;
    font-size: 20px;
  }

  input::placeholder {
    font-style: italic;
    letter-spacing: 3px;
    outline: none !important;
  }

  .add {
    background: #ffffff;
    backdrop-filter: blur(10px);
    box-shadow: 0px -1px 20px 0px #e2e2e2;
    border-radius: 100%;
    overflow: hidden;
    height: 60px;
    display: flex;
    width: 60px;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    margin: 0 10px;
    margin-top: -6px;
  }

  .add .svg {
    display: flex;
    justify-content: center;
    align-items: center;
    fill: #198b00;
    transform: scale(1.5);
  }
</style>

<div class="layout" on:click={() => ui.setInputBoxShown(false)}>
  <input
    bind:this={inputElement}
    on:click|stopPropagation
    type="text"
    placeholder="type what you want to do!"
    bind:value={inputText} />
  <div class="add" on:click|stopPropagation={addToDo}>
    <div class="svg">
      {@html Add}
    </div>
  </div>
</div>

<svelte:window on:keydown={handleKeydown} />
