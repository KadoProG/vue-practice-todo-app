<script setup lang="ts">
import RegistrationForm from "./components/RegistrationForm.vue";
import ApiExample from "./components/ApiExample.vue";
</script>

<template>
  <div id="app">
    <RegistrationForm />
    <hr style="margin: 40px 0" />
    <ApiExample />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell,
    "Helvetica Neue", sans-serif;
  background: #f5f5f5;
}

#app {
  min-height: 100vh;
  padding: 20px;
}
</style>
