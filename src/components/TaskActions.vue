<template>
  <div class="mb-8">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-slate-700 text-lg font-semibold m-0 pb-2 border-b-2 border-gray-200 flex-1">
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
    <div v-if="isAddingAction" class="bg-blue-50 p-4 rounded-md border-l-4 border-blue-500 mb-3">
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

    <div v-if="loading" class="text-center py-5 text-gray-600">読み込み中...</div>
    <div v-else-if="error" class="text-center py-5 text-red-600">
      {{ error }}
    </div>
    <div v-else-if="actions.length === 0 && !isAddingAction" class="text-center py-5 text-gray-600">
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
              :id="`edit-is-done-${action.id}`"
              class="w-4 h-4 cursor-pointer"
            />
            <label :for="`edit-is-done-${action.id}`" class="text-sm text-gray-700 cursor-pointer">
              完了
            </label>
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
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useCreateTaskAction, useUpdateTaskAction, useDeleteTaskAction } from "@/api/hooks";
import type { components } from "@/types/api";

type TaskActionResource = components["schemas"]["TaskActionResource"];

interface Props {
  taskId: number;
  actions: TaskActionResource[];
  loading: boolean;
  error: string;
}

const props = defineProps<Props>();

// ミューテーション
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
  if (!newActionName.value.trim()) return;

  try {
    await createActionMutation.mutateAsync({
      taskId: props.taskId,
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
  if (!editingActionName.value.trim()) return;

  try {
    await updateActionMutation.mutateAsync({
      taskId: props.taskId,
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
  try {
    await updateActionMutation.mutateAsync({
      taskId: props.taskId,
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
  if (confirm(`アクション「${actionName}」を削除しますか？`)) {
    try {
      await deleteActionMutation.mutateAsync({
        taskId: props.taskId,
        actionId,
      });
    } catch (err) {
      console.error("Error deleting action:", err);
    }
  }
};
</script>
