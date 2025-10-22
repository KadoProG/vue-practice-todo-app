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
  <div class="home-container">
    <div class="home-card">
      <h1 class="home-title">タスク管理アプリ</h1>
      <p class="home-description">ログインしてタスクを管理しましょう</p>

      <div class="home-actions">
        <router-link to="/login" class="action-button primary"> ログイン </router-link>
        <router-link to="/profile" class="action-button secondary"> プロフィール </router-link>
      </div>

      <div class="features">
        <h3 class="features-title">機能</h3>
        <ul class="features-list">
          <li>ユーザー認証</li>
          <li>タスク管理</li>
          <li>プロフィール表示</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.home-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.home-title {
  color: #333;
  margin-bottom: 20px;
  font-size: 32px;
  font-weight: 600;
}

.home-description {
  color: #666;
  margin-bottom: 30px;
  font-size: 16px;
  line-height: 1.5;
}

.home-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
}

.action-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  display: inline-block;
}

.action-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.action-button.secondary {
  background: #6c757d;
  color: white;
}

.action-button.secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.features {
  border-top: 1px solid #f0f0f0;
  padding-top: 30px;
}

.features-title {
  color: #333;
  margin-bottom: 16px;
  font-size: 20px;
  font-weight: 600;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-list li {
  color: #666;
  padding: 8px 0;
  font-size: 14px;
}

.features-list li:before {
  content: "✓";
  color: #667eea;
  font-weight: bold;
  margin-right: 8px;
}
</style>
