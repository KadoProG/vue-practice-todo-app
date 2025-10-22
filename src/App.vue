<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-brand"> Task Manager </router-link>
        <div class="nav-content">
          <div class="nav-links">
            <router-link to="/" class="nav-link">ホーム</router-link>
            <router-link to="/tasks" class="nav-link">タスク</router-link>
            <router-link to="/profile" class="nav-link">プロフィール</router-link>
          </div>
          <UserMenu />
        </div>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import UserMenu from "./components/UserMenu.vue";
</script>

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
}

.navbar {
  background: #2c3e50;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.nav-content {
  display: flex;
  align-items: center;
  gap: 30px;
}

.nav-brand {
  color: white;
  text-decoration: none;
  font-size: 20px;
  font-weight: 600;
}

.nav-brand:hover {
  color: #3498db;
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #3498db;
}

.nav-link.router-link-active {
  color: #3498db;
  border-bottom: 2px solid #3498db;
}

.main-content {
  min-height: calc(100vh - 60px);
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    height: auto;
    padding: 15px 20px;
  }

  .nav-content {
    margin-top: 15px;
    flex-direction: column;
    gap: 15px;
    width: 100%;
  }

  .nav-links {
    gap: 20px;
  }

  .main-content {
    min-height: calc(100vh - 90px);
  }
}
</style>
