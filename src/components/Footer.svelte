<script>
  import Add from "../images/add.svg";
  import Input from "./Input.svelte";
  import { todos } from "../stores/todos.js";
  import { ui, TABS } from "../stores/ui.js";

  let showInput = false;

  const handleAddClick = () => {
    ui.setInputBoxShown(true);
  };
  
  const handleAddTodo = ({ detail }) => {
    showInput = false;
    todos.addTodo(detail.text);
  };

  const handleTabClick = activeTab => () => {
    ui.setActiveTab(activeTab);
  };
</script>

<style>
  .footer {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 50px;
    text-align: center;
    width: calc(100% - 170px);
    background: #ffffff61;
    backdrop-filter: blur(10px);
    position: fixed;
    bottom: 0;
    padding: 10px;
    box-shadow: 0px -1px 20px 0px #e2e2e2;
    z-index: 1;
    height: 70px;
    border-radius: 30px;
    margin: 20px;
    max-width: 600px;
  }

  .add {
    background: #ffffff;
    backdrop-filter: blur(10px);
    box-shadow: 0px -1px 20px 0px #e2e2e2;
    border-radius: 100%;
    overflow: hidden;
    height: 80px;
    display: flex;
    width: 80px;
    justify-content: center;
    align-items: center;
    position: fixed;
    bottom: 25px;
    right: 20px;
    cursor: pointer;
  }

  .add .svg {
    display: flex;
    justify-content: center;
    align-items: center;
    fill: #198b00;
    transform: scale(1.5);
  }

  .groups {
    display: flex;
    justify-content: space-around;
    width: 100%;
    font-size: 23px;
  }

  .groups .block {
    padding: 13px;
    width: 100%;
    margin: 10px;
    border-radius: 20px;
    cursor: pointer;
  }

  .groups .block.active,
  .groups .block:hover {
    background: #ececec;
  }
</style>

<div class="footer">
  <div class="groups">
    {#each Object.keys(TABS) as tabKey}
      <div
        class="block {$ui.activeTab === TABS[tabKey] && 'active'}"
        on:click={handleTabClick(TABS[tabKey])}>
        {TABS[tabKey]}
      </div>
    {/each}
  </div>
</div>

<div class="add" on:click={handleAddClick}>
  <div class="svg">
    {@html Add}
  </div>
</div>

{#if $ui.inputBoxShown}
  <Input on:addToDo={handleAddTodo} />
{/if}
