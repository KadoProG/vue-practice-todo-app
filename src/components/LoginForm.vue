<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">ログイン</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">メールアドレス</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="example@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">パスワード</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="パスワードを入力"
            required
          />
        </div>

        <button type="submit" class="login-button" :disabled="isLoading">
          {{ isLoading ? "ログイン中..." : "ログイン" }}
        </button>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { apiClient, setAuthToken, handleApiError } from "../api/client";
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
    const { data, error } = await apiClient.POST("/v1/login", {
      body: {
        email: form.email,
        password: form.password,
      },
    });

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

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 600;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  color: #555;
  font-weight: 500;
  font-size: 14px;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.login-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-top: 10px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #fcc;
  font-size: 14px;
  text-align: center;
}
</style>
