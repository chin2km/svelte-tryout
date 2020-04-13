<script lang="ts">
  import ToDos from "./components/ToDos.svelte";
  import Footer from "./components/Footer.svelte";
  import Add from "./images/add.svg";

  export let name;
</script>

<style>
  :global(body),
  :global(html) {
    margin: 0;
    padding: 0;
    font-family: "Ubuntu", sans-serif;
    position: relative;
    width: 100%;
    height: 100%;
  }

  :global(body) {
    display: flex;
  }

  * {
    user-select: none;
  }

  .main {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .header {
    display: flex;
    justify-content: center;
    font-size: 50px;
    text-align: center;
    width: 100%;
    background: #ffffff61;
    backdrop-filter: blur(10px);
    position: fixed;
    top: 0;
    padding: 10px;
    box-shadow: -2px 8px 20px 0px #dadada59;
    z-index: 1;
  }
</style>

<div class="main">
  <div class="header">{name}</div>
  <ToDos />
  <Footer />
</div>
