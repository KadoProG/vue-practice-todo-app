<template>
  <div
    class="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-5"
  >
    <div class="bg-white rounded-xl shadow-2xl p-10 w-full max-w-md">
      <h2 class="text-center text-gray-800 mb-8 text-3xl font-semibold">ログイン</h2>
      <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
          <label for="email" class="text-gray-600 font-medium text-sm">メールアドレス</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-indigo-500"
            placeholder="example@email.com"
            required
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="password" class="text-gray-600 font-medium text-sm">パスワード</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-indigo-500"
            placeholder="パスワードを入力"
            required
          />
        </div>

        <button
          type="submit"
          class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none py-4 px-5 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 mt-3 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          :disabled="isLoading"
        >
          {{ isLoading ? "ログイン中..." : "ログイン" }}
        </button>

        <div
          v-if="errorMessage"
          class="bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200 text-sm text-center"
        >
          {{ errorMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { apiClientWithRetry, setAuthToken, handleApiError } from "../api/client";
import type { paths } from "../types/api";

const router = useRouter();

// フォームデータ
const form = reactive({
  email: "",
  password: "",
});

// 状態管理
const isLoading = ref(false);
const errorMessage = ref("");

// ログイン処理
const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const { data, error } = await apiClientWithRetry.POST("/v1/login", {
      body: {
        email: form.email,
        password: form.password,
      },
    } as any);

    if (error) {
      if (error.status === 401) {
        errorMessage.value = "メールアドレスまたはパスワードが正しくありません";
      } else if (error.status === 422) {
        errorMessage.value = "入力内容を確認してください";
      } else {
        errorMessage.value = "ログインに失敗しました";
      }
      return;
    }

    if (data?.token) {
      // トークンをローカルストレージに保存
      localStorage.setItem("auth_token", data.token);

      // APIクライアントにトークンを設定
      setAuthToken(data.token);

      // ホームページにリダイレクト
      router.push("/");
    }
  } catch (err) {
    handleApiError(err);
    errorMessage.value = "ログインに失敗しました";
  } finally {
    isLoading.value = false;
  }
};
</script>
