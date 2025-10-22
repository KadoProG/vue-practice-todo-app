<template>
  <div class="user-menu">
    <div class="user-info" @click="toggleMenu" :class="{ active: isMenuOpen }">
      <div class="user-avatar">
        <span class="avatar-text">{{ displayName.charAt(0).toUpperCase() }}</span>
      </div>
      <span class="user-name">{{ displayName }}</span>
      <svg
        class="dropdown-icon"
        :class="{ rotated: isMenuOpen }"
        width="12"
        height="12"
        viewBox="0 0 12 12"
      >
        <path d="M6 8L2 4h8L6 8z" fill="currentColor" />
      </svg>
    </div>

    <div v-if="isMenuOpen" class="dropdown-menu" @click.stop>
      <template v-if="isLoggedIn">
        <div class="menu-item" @click="goToProfile">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 1c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z"
            />
          </svg>
          プロフィール
        </div>
        <div class="menu-item" @click="goToTasks">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M14 2H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zM2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H2z"
            />
            <path d="M4 6h8v1H4V6zm0 2h8v1H4V8zm0 2h5v1H4v-1z" />
          </svg>
          タスク
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item logout" @click="handleLogout">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0v2z"
            />
            <path
              d="M.5 8a.5.5 0 0 1 .5-.5h5.793L4.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L6.793 8.5H1a.5.5 0 0 1-.5-.5z"
            />
          </svg>
          ログアウト
        </div>
      </template>
      <template v-else>
        <div class="menu-item" @click="goToLogin">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"
            />
          </svg>
          ログイン
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";

const router = useRouter();
const userStore = useUserStore();

const isMenuOpen = ref(false);

// ユーザー情報を取得
const displayName = computed(() => userStore.displayName);
const isLoggedIn = computed(() => userStore.isLoggedIn);

// メニューの開閉
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// メニューを閉じる
const closeMenu = () => {
  isMenuOpen.value = false;
};

// プロフィールページへ移動
const goToProfile = () => {
  closeMenu();
  router.push("/profile");
};

// タスクページへ移動
const goToTasks = () => {
  closeMenu();
  router.push("/tasks");
};

// ログインページへ移動
const goToLogin = () => {
  closeMenu();
  router.push("/login");
};

// クリック外部でメニューを閉じる
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".user-menu")) {
    closeMenu();
  }
};

onMounted(() => {
  // ユーザー情報を取得
  userStore.fetchUserInfo();

  // クリック外部でメニューを閉じるイベントリスナーを追加
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  // イベントリスナーを削除
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.user-menu {
  position: relative;
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: white;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-info.active {
  background-color: rgba(255, 255, 255, 0.15);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #3498db;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: white;
}

.avatar-text {
  text-transform: uppercase;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  transition: transform 0.2s ease;
  color: rgba(255, 255, 255, 0.7);
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 1000;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #333;
  font-size: 14px;
}

.menu-item:hover {
  background-color: #f8f9fa;
}

.menu-item.logout {
  color: #dc3545;
}

.menu-item.logout:hover {
  background-color: #f8d7da;
}

.menu-divider {
  height: 1px;
  background-color: #e9ecef;
  margin: 4px 0;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .user-name {
    display: none;
  }

  .dropdown-menu {
    right: -10px;
    min-width: 160px;
  }
}
</style>
