<script setup lang="ts">
import { onMounted } from "vue";
import { setAuthToken } from "../api/client";

// ページ読み込み時に認証トークンを設定
onMounted(() => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    setAuthToken(token);
  }
});
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-50 p-5">
    <div class="bg-white rounded-xl shadow-2xl p-10 w-full max-w-lg text-center">
      <h1 class="text-gray-800 mb-5 text-3xl font-semibold">タスク管理アプリ</h1>
      <p class="text-gray-600 mb-8 text-base leading-6">ログインしてタスクを管理しましょう</p>

      <div class="flex gap-4 justify-center mb-10">
        <router-link
          to="/login"
          class="px-6 py-3 rounded-lg text-base font-semibold no-underline transition-all duration-200 border-none cursor-pointer inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:-translate-y-0.5 hover:shadow-lg"
        >
          ログイン
        </router-link>
        <router-link
          to="/profile"
          class="px-6 py-3 rounded-lg text-base font-semibold no-underline transition-all duration-200 border-none cursor-pointer inline-block bg-gray-600 text-white hover:bg-gray-500 hover:-translate-y-0.5"
        >
          プロフィール
        </router-link>
      </div>

      <div class="border-t border-gray-200 pt-8">
        <h3 class="text-gray-800 mb-4 text-xl font-semibold">機能</h3>
        <ul class="list-none p-0 m-0">
          <li
            class="text-gray-600 py-2 text-sm before:content-['✓'] before:text-indigo-500 before:font-bold before:mr-2"
          >
            ユーザー認証
          </li>
          <li
            class="text-gray-600 py-2 text-sm before:content-['✓'] before:text-indigo-500 before:font-bold before:mr-2"
          >
            タスク管理
          </li>
          <li
            class="text-gray-600 py-2 text-sm before:content-['✓'] before:text-indigo-500 before:font-bold before:mr-2"
          >
            プロフィール表示
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
