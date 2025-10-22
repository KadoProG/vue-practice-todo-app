<template>
  <div class="tasks-container">
    <div class="tasks-header">
      <h1>タスク一覧</h1>
      <button @click="() => refreshTasks()" class="refresh-btn" :disabled="loading">
        {{ loading ? "読み込み中..." : "更新" }}
      </button>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label>
          <select v-model="filters.isDone" @change="applyFilters">
            <option :value="false">未完了のみ</option>
            <option :value="true">完了のみ</option>
            <option :value="null">すべて表示</option>
          </select>
        </label>
      </div>
      <div class="filter-group">
        <label>
          <input type="checkbox" v-model="filters.isPublic" @change="applyFilters" />
          公開タスクのみ
        </label>
      </div>
    </div>

    <div v-if="loading" class="loading">読み込み中...</div>

    <div v-else-if="errorMessage" class="error">
      {{ errorMessage }}
    </div>

    <div v-else-if="tasks.length === 0" class="no-tasks">タスクがありません</div>

    <div v-else class="tasks-list">
      <div v-for="task in tasks" :key="task.id" class="task-card" @click="goToTaskDetail(task.id)">
        <div class="task-header">
          <h3 class="task-title">{{ task.title }}</h3>
          <div class="task-status">
            <span :class="['status-badge', task.is_done ? 'done' : 'pending']">
              {{ task.is_done ? "完了" : "未完了" }}
            </span>
            <span v-if="task.is_public" class="public-badge"> 公開 </span>
          </div>
        </div>

        <p v-if="task.description" class="task-description">
          {{ task.description }}
        </p>

        <div class="task-meta">
          <div class="task-info">
            <span class="created-by"> 作成者: {{ task.created_user.name }} </span>
            <span v-if="task.expired_at" class="expired-at">
              期限: {{ formatDate(task.expired_at) }}
            </span>
          </div>

          <div v-if="task.assigned_users.length > 0" class="assigned-users">
            <span class="assigned-label">担当者:</span>
            <span v-for="user in task.assigned_users" :key="user.id" class="assigned-user">
              {{ user.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useTasks } from "@/api/hooks";

const router = useRouter();

// フィルター
const filters = ref({
  isDone: null as boolean | null,
  isPublic: false,
});

// APIクエリパラメータを計算
const queryParams = computed(() => {
  const params: {
    is_public?: boolean;
    is_done?: boolean;
    expired_before?: string;
    expired_after?: string;
    created_user_id?: number;
    assigned_user_id?: number;
    sort_by?: "title" | "expired_at" | "created_at" | "updated_at";
    sort_order?: "asc" | "desc";
    created_user_ids?: number[];
    assigned_user_ids?: number[];
  } = {};

  if (filters.value.isDone !== null) {
    params.is_done = filters.value.isDone;
  }

  if (filters.value.isPublic) {
    params.is_public = true;
  }

  return params;
});

// APIからタスク一覧を取得
const {
  data: tasksData,
  isLoading: loading,
  error,
  refetch: refreshTasks,
} = useTasks(queryParams as unknown as Parameters<typeof useTasks>[0]);

// タスク一覧を取得
const tasks = computed(() => tasksData.value?.tasks || []);

// エラーメッセージを取得
const errorMessage = computed(() => {
  if (error.value) {
    return "タスクの取得に失敗しました";
  }
  return "";
});

// フィルター適用
const applyFilters = () => {
  // フィルターが変更されたら即座に再fetch
  refreshTasks();
};

// タスク詳細へ遷移
const goToTaskDetail = (taskId: number) => {
  router.push(`/tasks/${taskId}`);
};

// 日付フォーマット
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style scoped>
.tasks-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.tasks-header h1 {
  color: #2c3e50;
  margin: 0;
}

.refresh-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background: #2980b9;
}

.refresh-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.filter-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.filter-group input[type="checkbox"] {
  margin: 0;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

.filter-group select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.loading,
.error,
.no-tasks {
  text-align: center;
  padding: 40px;
  font-size: 16px;
}

.error {
  color: #e74c3c;
}

.no-tasks {
  color: #7f8c8d;
}

.tasks-list {
  display: grid;
  gap: 20px;
}

.task-card {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #3498db;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.task-title {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.task-status {
  display: flex;
  gap: 8px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.done {
  background: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.public-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: #cce5ff;
  color: #004085;
}

.task-description {
  color: #6c757d;
  margin: 10px 0;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 15px;
  font-size: 14px;
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.created-by,
.expired-at {
  color: #6c757d;
}

.expired-at {
  font-weight: 500;
}

.assigned-users {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
}

.assigned-label {
  color: #6c757d;
  font-weight: 500;
}

.assigned-user {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #495057;
}

@media (max-width: 768px) {
  .tasks-container {
    padding: 15px;
  }

  .tasks-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .filters {
    flex-direction: column;
    gap: 10px;
  }

  .task-header {
    flex-direction: column;
    gap: 10px;
  }

  .task-status {
    align-self: flex-start;
  }

  .task-meta {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>
