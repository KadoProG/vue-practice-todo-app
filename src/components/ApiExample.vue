<template>
  <div class="api-example">
    <h1>API Example</h1>

    <!-- ログイン -->
    <section>
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <input v-model="loginForm.email" type="email" placeholder="Email" required />
        <input v-model="loginForm.password" type="password" placeholder="Password" required />
        <button type="submit" :disabled="loginMutation.isPending.value">
          {{ loginMutation.isPending.value ? "Logging in..." : "Login" }}
        </button>
      </form>
      <div v-if="loginMutation.isError.value" class="error">
        Error: {{ (loginMutation.error.value as any)?.message || "Login failed" }}
      </div>
    </section>

    <!-- 現在のユーザー情報 -->
    <section>
      <h2>Current User</h2>
      <button @click="refetchUser" :disabled="userQuery.isLoading.value">
        {{ userQuery.isLoading.value ? "Loading..." : "Refresh User" }}
      </button>
      <div v-if="userQuery.isError.value" class="error">
        Error: {{ (userQuery.error.value as any)?.message || "Failed to fetch user" }}
      </div>
      <div v-if="userQuery.data.value" class="user-info">
        <p>ID: {{ userQuery.data.value.user.id }}</p>
        <p>Name: {{ userQuery.data.value.user.name }}</p>
        <p>Email: {{ userQuery.data.value.user.email }}</p>
      </div>
    </section>

    <!-- タスク一覧 -->
    <section>
      <h2>Tasks</h2>
      <button @click="refetchTasks" :disabled="tasksQuery.isLoading.value">
        {{ tasksQuery.isLoading.value ? "Loading..." : "Refresh Tasks" }}
      </button>
      <div v-if="tasksQuery.isError.value" class="error">
        Error: {{ (tasksQuery.error.value as any)?.message || "Failed to fetch tasks" }}
      </div>
      <div v-if="tasksQuery.data.value" class="tasks-list">
        <div v-for="task in tasksQuery.data.value.tasks" :key="task.id" class="task-item">
          <h3>{{ task.title }}</h3>
          <p>{{ task.description }}</p>
          <p>Status: {{ task.is_done ? "Done" : "Pending" }}</p>
          <p>Public: {{ task.is_public ? "Yes" : "No" }}</p>
        </div>
      </div>
    </section>

    <!-- 新規タスク作成 -->
    <section>
      <h2>Create Task</h2>
      <form @submit.prevent="handleCreateTask">
        <input v-model="taskForm.title" type="text" placeholder="Title" required />
        <textarea v-model="taskForm.description" placeholder="Description"></textarea>
        <label>
          <input v-model="taskForm.is_public" type="checkbox" />
          Public
        </label>
        <input v-model="taskForm.expired_at" type="datetime-local" />
        <button type="submit" :disabled="createTaskMutation.isPending.value">
          {{ createTaskMutation.isPending.value ? "Creating..." : "Create Task" }}
        </button>
      </form>
      <div v-if="createTaskMutation.isError.value" class="error">
        Error: {{ (createTaskMutation.error.value as any)?.message || "Failed to create task" }}
      </div>
      <div v-if="createTaskMutation.isSuccess.value" class="success">
        Task created successfully!
      </div>
    </section>

    <!-- ログアウト -->
    <section>
      <h2>Logout</h2>
      <button @click="handleLogout" :disabled="logoutMutation.isPending.value">
        {{ logoutMutation.isPending.value ? "Logging out..." : "Logout" }}
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useLogin, useLogout, useCurrentUser, useTasks, useCreateTask } from "../api/hooks";

// フォームデータ
const loginForm = ref({
  email: "",
  password: "",
});

const taskForm = ref({
  title: "",
  description: "",
  is_public: false,
  expired_at: "",
});

// APIフック
const loginMutation = useLogin();
const logoutMutation = useLogout();
const userQuery = useCurrentUser();
const tasksQuery = useTasks();
const createTaskMutation = useCreateTask();

// イベントハンドラー
const handleLogin = async () => {
  try {
    await loginMutation.mutateAsync(loginForm.value);
    // ログイン成功後、ユーザー情報を再取得
    userQuery.refetch();
    tasksQuery.refetch();
  } catch (error) {
    console.error("Login failed:", error);
  }
};

const handleLogout = async () => {
  try {
    await logoutMutation.mutateAsync();
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

const handleCreateTask = async () => {
  try {
    await createTaskMutation.mutateAsync(taskForm.value);
    // タスク作成後、タスク一覧を再取得
    tasksQuery.refetch();
    // フォームをリセット
    taskForm.value = {
      title: "",
      description: "",
      is_public: false,
      expired_at: "",
    };
  } catch (error) {
    console.error("Create task failed:", error);
  }
};

const refetchUser = () => {
  userQuery.refetch();
};

const refetchTasks = () => {
  tasksQuery.refetch();
};
</script>

<style scoped>
.api-example {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input,
textarea {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-top: 10px;
}

.success {
  color: green;
  margin-top: 10px;
}

.user-info,
.tasks-list {
  margin-top: 10px;
}

.task-item {
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 10px;
}
</style>
