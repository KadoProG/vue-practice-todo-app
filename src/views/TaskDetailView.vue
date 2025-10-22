<template>
  <div class="max-w-4xl mx-auto p-5">
    <div v-if="loading" class="text-center py-10 text-base">読み込み中...</div>

    <div v-else-if="error" class="text-center py-10 text-base text-red-600">
      {{ error }}
    </div>

    <div v-else-if="task" class="bg-white rounded-lg shadow-md overflow-hidden mx-auto">
      <!-- ヘッダー -->
      <div
        class="flex justify-between items-start p-8 bg-gray-50 border-b border-gray-200 md:flex-row flex-col md:gap-0 gap-5"
      >
        <div
          class="flex items-center gap-5 md:flex-row flex-col md:gap-5 gap-4 md:items-center items-stretch"
        >
          <button
            @click="goBack"
            class="bg-gray-600 hover:bg-gray-700 text-white border-none px-4 py-2 rounded-md cursor-pointer text-sm transition-colors duration-300"
          >
            ← 戻る
          </button>
          <h1 class="m-0 text-slate-700 text-3xl font-semibold md:text-3xl text-2xl">
            {{ task.title }}
          </h1>
        </div>
        <div class="flex gap-2.5 md:flex-row flex-col md:gap-2.5 gap-2 md:self-start self-start">
          <span
            :class="[
              'px-3 py-1.5 rounded-full text-sm font-medium',
              task.is_done ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
            ]"
          >
            {{ task.is_done ? "完了" : "未完了" }}
          </span>
          <span
            v-if="task.is_public"
            class="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
          >
            公開
          </span>
        </div>
      </div>

      <!-- タスク情報 -->
      <div class="p-8">
        <div class="mb-8">
          <h3 class="text-slate-700 text-lg font-semibold m-0 mb-4 pb-2 border-b-2 border-gray-200">
            基本情報
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="flex flex-col gap-1">
              <label class="font-medium text-gray-600 text-sm">作成者</label>
              <span class="text-slate-700 text-base">{{ task.created_user.name }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <label class="font-medium text-gray-600 text-sm">作成日時</label>
              <span class="text-slate-700 text-base">{{ formatDate(task.created_at) }}</span>
            </div>
            <div class="flex flex-col gap-1" v-if="task.expired_at">
              <label class="font-medium text-gray-600 text-sm">期限</label>
              <span
                :class="[
                  'text-base',
                  isExpired(task.expired_at) ? 'text-red-600 font-medium' : 'text-slate-700',
                ]"
              >
                {{ formatDate(task.expired_at) }}
              </span>
            </div>
            <div class="flex flex-col gap-1">
              <label class="font-medium text-gray-600 text-sm">最終更新</label>
              <span class="text-slate-700 text-base">{{ formatDate(task.updated_at) }}</span>
            </div>
          </div>
        </div>

        <div class="mb-8" v-if="task.description">
          <h3 class="text-slate-700 text-lg font-semibold m-0 mb-4 pb-2 border-b-2 border-gray-200">
            説明
          </h3>
          <div class="bg-gray-50 p-4 rounded-md leading-relaxed text-slate-700 whitespace-pre-line">
            {{ task.description }}
          </div>
        </div>

        <div class="mb-8" v-if="task.assigned_users.length > 0">
          <h3 class="text-slate-700 text-lg font-semibold m-0 mb-4 pb-2 border-b-2 border-gray-200">
            担当者
          </h3>
          <div class="grid gap-2.5">
            <div
              v-for="user in task.assigned_users"
              :key="user.id"
              class="bg-gray-50 p-4 rounded-md border-l-4 border-blue-500"
            >
              <div class="flex flex-col gap-1">
                <span class="font-medium text-slate-700">{{ user.name }}</span>
                <span class="text-sm text-gray-600">{{ user.email }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- アクション一覧 -->
        <div class="mb-8">
          <div class="flex justify-between items-center mb-4">
            <h3
              class="text-slate-700 text-lg font-semibold m-0 pb-2 border-b-2 border-gray-200 flex-1"
            >
              アクション
            </h3>
            <button
              v-if="!isAddingAction"
              @click="startAddingAction"
              class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white border-none rounded-md cursor-pointer text-sm font-medium transition-colors duration-300"
            >
              + 追加
            </button>
          </div>

          <!-- アクション追加フォーム -->
          <div
            v-if="isAddingAction"
            class="bg-blue-50 p-4 rounded-md border-l-4 border-blue-500 mb-3"
          >
            <div class="flex flex-col gap-3">
              <input
                v-model="newActionName"
                type="text"
                placeholder="アクション名を入力"
                class="px-3 py-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                @keydown.enter="addAction"
                @keydown.esc="cancelAddingAction"
              />
              <div class="flex gap-2">
                <button
                  @click="addAction"
                  :disabled="!newActionName.trim()"
                  class="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white border-none rounded-md cursor-pointer text-sm font-medium transition-colors duration-300"
                >
                  追加
                </button>
                <button
                  @click="cancelAddingAction"
                  class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white border-none rounded-md cursor-pointer text-sm font-medium transition-colors duration-300"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>

          <div v-if="actionsLoading" class="text-center py-5 text-gray-600">読み込み中...</div>
          <div v-else-if="errorMessage" class="text-center py-5 text-red-600">
            {{ errorMessage }}
          </div>
          <div
            v-else-if="actions.length === 0 && !isAddingAction"
            class="text-center py-5 text-gray-600"
          >
            アクションがありません
          </div>
          <div v-else class="grid gap-2.5">
            <div
              v-for="action in actions"
              :key="action.id"
              class="bg-gray-50 p-4 rounded-md border-l-4 border-gray-600"
            >
              <!-- 編集モード -->
              <div v-if="editingActionId === action.id" class="flex flex-col gap-3">
                <input
                  v-model="editingActionName"
                  type="text"
                  class="px-3 py-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  @keydown.enter="updateAction(action.id)"
                  @keydown.esc="cancelEditingAction"
                />
                <div class="flex items-center gap-2">
                  <input
                    v-model="editingActionIsDone"
                    type="checkbox"
                    id="edit-is-done"
                    class="w-4 h-4 cursor-pointer"
                  />
                  <label for="edit-is-done" class="text-sm text-gray-700 cursor-pointer"
                    >完了</label
                  >
                </div>
                <div class="flex gap-2">
                  <button
                    @click="updateAction(action.id)"
                    :disabled="!editingActionName.trim()"
                    class="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white border-none rounded-md cursor-pointer text-sm font-medium transition-colors duration-300"
                  >
                    保存
                  </button>
                  <button
                    @click="cancelEditingAction"
                    class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white border-none rounded-md cursor-pointer text-sm font-medium transition-colors duration-300"
                  >
                    キャンセル
                  </button>
                </div>
              </div>

              <!-- 表示モード -->
              <div v-else>
                <div class="flex justify-between items-start md:flex-row flex-col md:gap-0 gap-2.5">
                  <div class="flex items-center gap-2.5 flex-1">
                    <button
                      @click="toggleActionStatus(action.id, action.is_done)"
                      :class="[
                        'px-2 py-1 rounded-full text-xs font-medium cursor-pointer border-none transition-colors duration-300',
                        action.is_done
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
                      ]"
                    >
                      {{ action.is_done ? "完了" : "未完了" }}
                    </button>
                    <span class="font-medium text-slate-700">{{ action.name }}</span>
                  </div>
                  <div class="flex items-center gap-2 md:flex-row flex-col md:gap-2 gap-1.5">
                    <span class="text-sm text-gray-600">
                      {{ formatDate(action.created_at) }}
                    </span>
                    <div class="flex gap-2">
                      <button
                        @click="startEditingAction(action.id, action.name, action.is_done)"
                        class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white border-none rounded-md cursor-pointer text-xs font-medium transition-colors duration-300"
                      >
                        編集
                      </button>
                      <button
                        @click="deleteAction(action.id, action.name)"
                        class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white border-none rounded-md cursor-pointer text-xs font-medium transition-colors duration-300"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- アクションボタン -->
      <div class="flex gap-4 p-8 bg-gray-50 border-t border-gray-200 md:flex-row flex-col">
        <button
          @click="toggleTaskStatus"
          :class="[
            'px-6 py-3 border-none rounded-md cursor-pointer text-sm font-medium transition-all duration-300',
            task.is_done
              ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
              : 'bg-green-500 hover:bg-green-600 text-white',
          ]"
        >
          {{ task.is_done ? "未完了に戻す" : "完了にする" }}
        </button>
        <button
          @click="editTask"
          class="px-6 py-3 border-none rounded-md cursor-pointer text-sm font-medium transition-all duration-300 bg-blue-500 hover:bg-blue-600 text-white"
        >
          編集
        </button>
        <button
          @click="deleteTask"
          class="px-6 py-3 border-none rounded-md cursor-pointer text-sm font-medium transition-all duration-300 bg-red-500 hover:bg-red-600 text-white"
        >
          削除
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  useTask,
  useTaskActions,
  useUpdateTask,
  useDeleteTask,
  useCreateTaskAction,
  useUpdateTaskAction,
  useDeleteTaskAction,
} from "@/api/hooks";

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

// アクション作成・更新・削除のミューテーション
const createActionMutation = useCreateTaskAction();
const updateActionMutation = useUpdateTaskAction();
const deleteActionMutation = useDeleteTaskAction();

// アクション追加フォームの状態
const isAddingAction = ref(false);
const newActionName = ref("");

// アクション編集の状態
const editingActionId = ref<number | null>(null);
const editingActionName = ref("");
const editingActionIsDone = ref(false);

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

// アクション追加
const startAddingAction = () => {
  isAddingAction.value = true;
  newActionName.value = "";
};

const cancelAddingAction = () => {
  isAddingAction.value = false;
  newActionName.value = "";
};

const addAction = async () => {
  if (!task.value || !newActionName.value.trim()) return;

  try {
    await createActionMutation.mutateAsync({
      taskId: task.value.id,
      data: {
        name: newActionName.value.trim(),
        is_done: false,
      },
    });
    cancelAddingAction();
  } catch (err) {
    console.error("Error creating action:", err);
  }
};

// アクション編集
const startEditingAction = (actionId: number, name: string, isDone: boolean) => {
  editingActionId.value = actionId;
  editingActionName.value = name;
  editingActionIsDone.value = isDone;
};

const cancelEditingAction = () => {
  editingActionId.value = null;
  editingActionName.value = "";
  editingActionIsDone.value = false;
};

const updateAction = async (actionId: number) => {
  if (!task.value || !editingActionName.value.trim()) return;

  try {
    await updateActionMutation.mutateAsync({
      taskId: task.value.id,
      actionId,
      data: {
        name: editingActionName.value.trim(),
        is_done: editingActionIsDone.value,
      },
    });
    cancelEditingAction();
  } catch (err) {
    console.error("Error updating action:", err);
  }
};

// アクションステータス切り替え
const toggleActionStatus = async (actionId: number, currentStatus: boolean) => {
  if (!task.value) return;

  try {
    await updateActionMutation.mutateAsync({
      taskId: task.value.id,
      actionId,
      data: {
        is_done: !currentStatus,
      },
    });
  } catch (err) {
    console.error("Error toggling action status:", err);
  }
};

// アクション削除
const deleteAction = async (actionId: number, actionName: string) => {
  if (!task.value) return;

  if (confirm(`アクション「${actionName}」を削除しますか？`)) {
    try {
      await deleteActionMutation.mutateAsync({
        taskId: task.value.id,
        actionId,
      });
    } catch (err) {
      console.error("Error deleting action:", err);
    }
  }
};
</script>
