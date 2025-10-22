<template>
  <div class="max-w-lg mx-auto p-8 bg-white border border-gray-200 rounded-lg shadow-md">
    <h2 class="mb-8 text-2xl font-normal text-gray-800">新規登録</h2>
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-5">
      <div class="flex flex-col gap-1.5">
        <label for="username" class="block mb-1.5 text-gray-800 text-sm">
          ユーザー名 <span class="text-red-600">*</span>
        </label>
        <input
          id="username"
          v-model="formData.username"
          type="text"
          required
          placeholder="ユーザー名を入力"
          class="w-full px-2.5 py-2.5 border border-gray-300 rounded text-sm box-border transition-colors focus:outline-none focus:border-gray-600 focus:shadow-sm"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="email" class="block mb-1.5 text-gray-800 text-sm">
          メールアドレス <span class="text-red-600">*</span>
        </label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          required
          placeholder="example@example.com"
          class="w-full px-2.5 py-2.5 border border-gray-300 rounded text-sm box-border transition-colors focus:outline-none focus:border-gray-600 focus:shadow-sm"
        />
      </div>

      <div class="my-5">
        <label class="flex items-center cursor-pointer text-sm select-none">
          <input v-model="usePassword" type="checkbox" class="w-4 h-4 mr-2 cursor-pointer" />
          パスワードを設定する
        </label>
      </div>

      <!-- パスワードフィールド（チェックボックスがONの時のみ表示） -->
      <template v-if="usePassword">
        <div class="flex flex-col gap-1.5">
          <label for="password" class="block mb-1.5 text-gray-800 text-sm">
            パスワード <span class="text-red-600">*</span>
          </label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            :required="usePassword"
            placeholder="8文字以上"
            minlength="8"
            class="w-full px-2.5 py-2.5 border border-gray-300 rounded text-sm box-border transition-colors focus:outline-none focus:border-gray-600 focus:shadow-sm"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="confirmPassword" class="block mb-1.5 text-gray-800 text-sm">
            パスワード確認 <span class="text-red-600">*</span>
          </label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            type="password"
            :required="usePassword"
            placeholder="パスワードを再入力"
            class="w-full px-2.5 py-2.5 border border-gray-300 rounded text-sm box-border transition-colors focus:outline-none focus:border-gray-600 focus:shadow-sm"
          />
          <span v-if="passwordMismatch" class="block text-red-600 text-xs mt-1"
            >パスワードが一致しません</span
          >
        </div>
      </template>

      <div class="flex flex-col gap-1.5">
        <button
          type="submit"
          class="w-full px-3 py-3 bg-gray-800 text-white border-none text-sm cursor-pointer hover:bg-gray-600 transition-colors"
        >
          登録する
        </button>
      </div>
    </form>

    <!-- 送信成功メッセージ -->
    <transition name="fade">
      <div
        v-if="submitSuccess"
        class="mt-5 px-3 py-3 bg-green-50 text-green-800 border border-green-200 text-center"
      >
        ✓ 登録が完了しました！
      </div>
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
