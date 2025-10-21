<template>
  <div class="registration-form">
    <h2>新規登録</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="username">ユーザー名 <span class="required">*</span></label>
        <input
          id="username"
          v-model="formData.username"
          type="text"
          required
          placeholder="ユーザー名を入力"
        />
      </div>

      <div class="form-group">
        <label for="email">メールアドレス <span class="required">*</span></label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          required
          placeholder="example@example.com"
        />
      </div>

      <div class="form-group checkbox-group">
        <label class="checkbox-label">
          <input v-model="usePassword" type="checkbox" />
          パスワードを設定する
        </label>
      </div>

      <!-- パスワードフィールド（チェックボックスがONの時のみ表示） -->
      <template v-if="usePassword">
        <div class="form-group">
          <label for="password">パスワード <span class="required">*</span></label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            :required="usePassword"
            placeholder="8文字以上"
            minlength="8"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">パスワード確認 <span class="required">*</span></label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            type="password"
            :required="usePassword"
            placeholder="パスワードを再入力"
          />
          <span v-if="passwordMismatch" class="error-message">パスワードが一致しません</span>
        </div>
      </template>

      <div class="form-group">
        <button type="submit" class="submit-btn">登録する</button>
      </div>
    </form>

    <!-- 送信成功メッセージ -->
    <transition name="fade">
      <div v-if="submitSuccess" class="success-message">✓ 登録が完了しました！</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

const formData = ref({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const usePassword = ref(false);
const submitSuccess = ref(false);

// パスワードの不一致チェック
const passwordMismatch = computed(() => {
  if (!usePassword.value) return false;
  if (!formData.value.password || !formData.value.confirmPassword) return false;
  return formData.value.password !== formData.value.confirmPassword;
});

// チェックボックスがOFFになったらパスワードフィールドをクリア
watch(usePassword, (newValue) => {
  if (!newValue) {
    formData.value.password = "";
    formData.value.confirmPassword = "";
  }
});

const handleSubmit = () => {
  // パスワードを使用する場合は一致チェック
  if (usePassword.value && passwordMismatch.value) {
    alert("パスワードが一致しません");
    return;
  }

  // 送信データの準備
  const submitData = {
    username: formData.value.username,
    email: formData.value.email,
    ...(usePassword.value && { password: formData.value.password }),
  };

  console.log("送信データ:", submitData);

  // 成功メッセージを表示
  submitSuccess.value = true;

  // フォームをリセット
  setTimeout(() => {
    formData.value = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
    usePassword.value = false;
    submitSuccess.value = false;
  }, 2000);
};
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.registration-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 30px;
  background: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: normal;
  color: #333;
}

label {
  display: block;
  margin-bottom: 6px;
  color: #333;
  font-size: 14px;
}

.required {
  color: #d00;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: #666;
  box-shadow: 0 0 0 2px rgba(102, 102, 102, 0.2);
}

.checkbox-group {
  margin: 20px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
}

input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  cursor: pointer;
}

.error-message {
  display: block;
  color: #d00;
  font-size: 12px;
  margin-top: 4px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #333;
  color: white;
  border: none;
  font-size: 14px;
  cursor: pointer;
}

.submit-btn:hover {
  background: #555;
}

.success-message {
  margin-top: 20px;
  padding: 12px;
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
  text-align: center;
}

/* トランジション効果 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
