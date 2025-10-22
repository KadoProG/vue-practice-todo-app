<template>
  <div id="app" class="min-h-screen">
    <nav class="bg-slate-700 shadow-md">
      <div class="flex-shrink-0 mx-auto px-5 flex justify-between items-center h-15 w-full">
        <router-link
          to="/"
          class="text-white no-underline text-xl font-semibold hover:text-blue-400 transition-colors duration-300"
        >
          Task Manager
        </router-link>
        <div class="flex items-center gap-8 md:flex-row flex-col md:gap-8 gap-4 md:mt-0 mt-4">
          <div class="flex gap-8 md:gap-8 gap-5">
            <router-link
              to="/"
              class="text-white no-underline text-base font-medium transition-colors duration-300 hover:text-blue-400 router-link-active:text-blue-400 router-link-active:border-b-2 router-link-active:border-blue-400"
              >ホーム</router-link
            >
            <router-link
              to="/tasks"
              class="text-white no-underline text-base font-medium transition-colors duration-300 hover:text-blue-400 router-link-active:text-blue-400 router-link-active:border-b-2 router-link-active:border-blue-400"
              >タスク</router-link
            >
            <router-link
              to="/profile"
              class="text-white no-underline text-base font-medium transition-colors duration-300 hover:text-blue-400 router-link-active:text-blue-400 router-link-active:border-b-2 router-link-active:border-blue-400"
              >プロフィール</router-link
            >
          </div>
          <UserMenu />
        </div>
      </div>
    </nav>
    <main class="min-h-[calc(100vh-60px)] md:min-h-[calc(100vh-60px)] min-h-[calc(100vh-90px)]">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import UserMenu from "./components/UserMenu.vue";
</script>
