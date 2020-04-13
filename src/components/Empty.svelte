<script>
  import Add from "../images/add.svg";
  import Active from "../images/checkmark-active.svg";
  import Inactive from "../images/checkmark-inactive.svg";
  import { TABS } from "../stores/ui.js";
  export let activeTab;

  $: message = {
    [TABS.ALL]: {
      header: "Hallo !",
      message: "Add away your todo by clicking the + button",
      icon: Add
    },
    [TABS.ACTIVE]: {
      header: "!",
      message: "You dont have any active todos!",
      icon: Inactive
    },
    [TABS.DONE]: {
      header: "!",
      message: "You dont have any completed todos!",
      icon: Active
    }
  }[activeTab];
</script>

<style>
  .empty {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100%;
    padding: 2rem;
    text-align: center;
    color: #dad6d6;
  }

  .text {
    font-size: 2rem;
  }

  .icon {
    width: 100%;
    height: 100%;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    margin: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .svg {
    transform: scale(14.5);
    opacity: 0.1;
    fill: #848484;
  }
</style>

<div class="empty">
  <div class="text">
    <h3>{message.header}</h3>
    <div>{message.message}</div>
  </div>
  <div class="icon">
    <div class="svg">
      {@html message.icon}
    </div>
  </div>
</div>
