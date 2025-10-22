<template>
  <div class="task-detail-container">
    <div v-if="loading" class="loading">読み込み中...</div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="task" class="task-detail">
      <!-- ヘッダー -->
      <div class="task-header">
        <div class="header-left">
          <button @click="goBack" class="back-btn">← 戻る</button>
          <h1 class="task-title">{{ task.title }}</h1>
        </div>
        <div class="header-right">
          <span :class="['status-badge', task.is_done ? 'done' : 'pending']">
            {{ task.is_done ? "完了" : "未完了" }}
          </span>
          <span v-if="task.is_public" class="public-badge"> 公開 </span>
        </div>
      </div>

      <!-- タスク情報 -->
      <div class="task-info">
        <div class="info-section">
          <h3>基本情報</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>作成者</label>
              <span>{{ task.created_user.name }}</span>
            </div>
            <div class="info-item">
              <label>作成日時</label>
              <span>{{ formatDate(task.created_at) }}</span>
            </div>
            <div class="info-item" v-if="task.expired_at">
              <label>期限</label>
              <span :class="{ expired: isExpired(task.expired_at) }">
                {{ formatDate(task.expired_at) }}
              </span>
            </div>
            <div class="info-item">
              <label>最終更新</label>
              <span>{{ formatDate(task.updated_at) }}</span>
            </div>
          </div>
        </div>

        <div class="info-section" v-if="task.description">
          <h3>説明</h3>
          <div class="description">
            {{ task.description }}
          </div>
        </div>

        <div class="info-section" v-if="task.assigned_users.length > 0">
          <h3>担当者</h3>
          <div class="assigned-users">
            <div v-for="user in task.assigned_users" :key="user.id" class="assigned-user">
              <div class="user-info">
                <span class="user-name">{{ user.name }}</span>
                <span class="user-email">{{ user.email }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- アクション一覧 -->
        <div class="info-section">
          <h3>アクション</h3>
          <div v-if="actionsLoading" class="loading-small">読み込み中...</div>
          <div v-else-if="errorMessage" class="error-small">
            {{ errorMessage }}
          </div>
          <div v-else-if="actions.length === 0" class="no-actions">アクションがありません</div>
          <div v-else class="actions-list">
            <div v-for="action in actions" :key="action.id" class="action-item">
              <div class="action-content">
                <div class="action-header">
                  <span :class="['action-status', action.is_done ? 'done' : 'pending']">
                    {{ action.is_done ? "完了" : "未完了" }}
                  </span>
                  <span class="action-name">{{ action.name }}</span>
                </div>
                <div class="action-meta">
                  <span class="action-date">
                    {{ formatDate(action.created_at) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- アクションボタン -->
      <div class="task-actions">
        <button
          @click="toggleTaskStatus"
          :class="['action-btn', task.is_done ? 'mark-pending' : 'mark-done']"
        >
          {{ task.is_done ? "未完了に戻す" : "完了にする" }}
        </button>
        <button @click="editTask" class="action-btn edit">編集</button>
        <button @click="deleteTask" class="action-btn delete">削除</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTask, useTaskActions, useUpdateTask, useDeleteTask } from "@/api/hooks";

const router = useRouter();
const route = useRoute();

// タスクIDを取得
const taskId = computed(() => {
  const id = route.params.id;
  return typeof id === "string" ? parseInt(id) : null;
});

// APIからタスク詳細を取得
const { data: taskData, isLoading: loading, error: taskError } = useTask(taskId.value!);

// APIからアクション一覧を取得
const {
  data: actionsData,
  isLoading: actionsLoading,
  error: actionsError,
} = useTaskActions(taskId.value!);

// タスク情報を取得
const task = computed(() => taskData.value?.task || null);

// アクション一覧を取得
const actions = computed(() => actionsData.value?.actions || []);

// エラーメッセージを取得
const error = computed(() => {
  if (taskError.value) {
    return "タスクの取得に失敗しました";
  }
  return "";
});

const errorMessage = computed(() => {
  if (actionsError.value) {
    return "アクションの取得に失敗しました";
  }
  return "";
});

// タスク更新のミューテーション
const updateTaskMutation = useUpdateTask();

// タスク削除のミューテーション
const deleteTaskMutation = useDeleteTask();

// 戻るボタン
const goBack = () => {
  router.push("/tasks");
};

// タスクステータス切り替え
const toggleTaskStatus = async () => {
  if (!task.value) return;

  try {
    await updateTaskMutation.mutateAsync({
      taskId: task.value.id,
      data: {
        is_done: !task.value.is_done,
      },
    });
  } catch (err) {
    console.error("Error updating task status:", err);
  }
};

// タスク編集
const editTask = () => {
  // 編集画面への遷移（実装予定）
  console.log("Edit task:", task.value?.id);
};

// タスク削除
const deleteTask = async () => {
  if (!task.value) return;

  if (confirm("このタスクを削除しますか？")) {
    try {
      await deleteTaskMutation.mutateAsync(task.value.id);
      // タスク一覧に戻る
      router.push("/tasks");
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  }
};

// 日付フォーマット
const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 期限切れチェック
const isExpired = (expiredAt: string) => {
  return new Date(expiredAt) < new Date();
};
</script>

<style scoped>
.task-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  font-size: 16px;
}

.error {
  color: #e74c3c;
}

.task-detail {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 30px;
  background: #f8f9fa;
  border-bottom: 1px solid #e1e8ed;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background: #5a6268;
}

.task-title {
  margin: 0;
  color: #2c3e50;
  font-size: 28px;
  font-weight: 600;
}

.header-right {
  display: flex;
  gap: 10px;
}

.status-badge,
.public-badge {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
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
  background: #cce5ff;
  color: #004085;
}

.task-info {
  padding: 30px;
}

.info-section {
  margin-bottom: 30px;
}

.info-section h3 {
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item label {
  font-weight: 500;
  color: #6c757d;
  font-size: 14px;
}

.info-item span {
  color: #2c3e50;
  font-size: 16px;
}

.info-item span.expired {
  color: #e74c3c;
  font-weight: 500;
}

.description {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  line-height: 1.6;
  color: #2c3e50;
  white-space: pre-line;
}

.assigned-users {
  display: grid;
  gap: 10px;
}

.assigned-user {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  border-left: 4px solid #3498db;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.user-name {
  font-weight: 500;
  color: #2c3e50;
}

.user-email {
  font-size: 14px;
  color: #6c757d;
}

.loading-small,
.error-small,
.no-actions {
  text-align: center;
  padding: 20px;
  color: #6c757d;
}

.error-small {
  color: #e74c3c;
}

.actions-list {
  display: grid;
  gap: 10px;
}

.action-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  border-left: 4px solid #6c757d;
}

.action-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.action-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.action-status.done {
  background: #d4edda;
  color: #155724;
}

.action-status.pending {
  background: #fff3cd;
  color: #856404;
}

.action-name {
  font-weight: 500;
  color: #2c3e50;
}

.action-meta {
  font-size: 14px;
  color: #6c757d;
}

.task-actions {
  display: flex;
  gap: 15px;
  padding: 30px;
  background: #f8f9fa;
  border-top: 1px solid #e1e8ed;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.action-btn.mark-done {
  background: #28a745;
  color: white;
}

.action-btn.mark-done:hover {
  background: #218838;
}

.action-btn.mark-pending {
  background: #ffc107;
  color: #212529;
}

.action-btn.mark-pending:hover {
  background: #e0a800;
}

.action-btn.edit {
  background: #007bff;
  color: white;
}

.action-btn.edit:hover {
  background: #0056b3;
}

.action-btn.delete {
  background: #dc3545;
  color: white;
}

.action-btn.delete:hover {
  background: #c82333;
}

@media (max-width: 768px) {
  .task-detail-container {
    padding: 15px;
  }

  .task-header {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .header-left {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .task-title {
    font-size: 24px;
  }

  .header-right {
    align-self: flex-start;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .task-actions {
    flex-direction: column;
  }

  .action-content {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
