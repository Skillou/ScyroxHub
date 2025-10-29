<template>
  <div class="debounce-panel">
    <div class="row center even">
      <!-- Motion Sync -->
      <div class="inner">
        <el-checkbox
          class="iconfont icon-MotionSync"
          :style="{
            color: motionSyncModel ? '#eeec52' : 'white',
            backgroundColor: 'transparent',
            border: 0,
            fontSize: '32px',
            padding: '12px 20px',
          }"
          v-model="motionSyncModel"
          @change="(v) => emit('update:motionSync', !!v)"
        />
        <span>{{ t("MotionSync") }}</span>
      </div>

      <!-- Performance mode (toggle by click) -->
      <div class="inner">
        <i
          class="iconfont icon-Mode"
          :style="{
            color: performanceModel ? '#eeec52' : 'white',
            backgroundColor: 'transparent',
            border: 0,
            fontSize: '32px',
            padding: '12px 20px',
            cursor: 'pointer',
          }"
          @click="togglePerformance"
        />
        <span>{{ performanceText }}</span>
      </div>

      <!-- Debounce time -->
      <div class="inner">
        <span>{{ t("DebounceTime") }}</span>
        <el-input-number
          v-model="debounceModel"
          :min="0"
          :max="30"
          size="mini"
          style="margin-top: 10px"
          @change="onDebounceChange"
        />
      </div>

      <!-- Pairing -->
      <div class="inner">
        <el-button
          class="iconfont icon-Pair"
          :style="btnIconStyle"
          @click="openPairDialog"
        />
        <span>{{ t("MousePair") }}</span>
      </div>

      <!-- Restore -->
      <div class="inner">
        <el-button
          class="iconfont icon-Restore"
          :style="btnIconStyle"
          @click="emit('restore-click')"
        />
        <span>{{ t("Restore") }}</span>
      </div>
    </div>

    <!-- Pair dialog -->
    <el-dialog
      :visible="pairDialogVisible"
      close-on-click-modal="false"
      width="30%"
      @update:visible="(v) => (pairDialogVisible = v)"
      @close="emit('pair-close')"
    >
      <span class="text-light">{{ pairText }}</span>
      <template #footer>
        <el-button @click="emit('pair-cancel')">{{ t("Cancel") }}</el-button>
        <el-button
          type="primary"
          @mouseenter="emit('pair-hover')"
          @click="emit('pair-start')"
          >{{ startPair }}</el-button
        >
      </template>
    </el-dialog>

    <!-- Generic dialog passthrough -->
    <common-dialog
      :title="''"
      :visible="dialogVisible"
      :content="dialogText"
      :showButton="dialogButton"
      @update:visible="(v) => emit('update:dialogVisible', v)"
      @dialog-result="(res) => emit('dialog-result', res)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

/** i18n minimal */
const messages: Record<string, Record<string, string>> = {
  "zh-CN": {
    MotionSync: "Motion Sync",
    DebounceTime: "消抖时间",
    MousePair: "鼠标配对",
    Restore: "恢复出厂设置",
    Cancel: "取 消",
  },
  fr: {
    MotionSync: "Motion Sync",
    DebounceTime: "Anti-rebond",
    MousePair: "Appairage souris",
    Restore: "Rétablir usine",
    Cancel: "Annuler",
  },
  en: {
    MotionSync: "Motion Sync",
    DebounceTime: "Debounce Time",
    MousePair: "Mouse pairing",
    Restore: "Restore defaults",
    Cancel: "Cancel",
  },
};
const lang =
  (localStorage.getItem("scyrox_lang") as "zh-CN" | "fr" | "en") || "zh-CN";
const t = (k: string) => messages[lang]?.[k] ?? k;

/** Props */
const props = defineProps<{
  motionSync: boolean;
  performance: boolean;
  performanceText: string;
  debounceTime: number;
  pairText: string;
  startPair: string;
  pairDialogVisible: boolean;
  dialogVisible: boolean;
  dialogText: string;
  dialogButton: boolean;
}>();

/** Emits */
const emit = defineEmits<{
  (e: "update:motionSync", v: boolean): void;
  (e: "update:performance", v: boolean): void;
  (e: "update:debounceTime", v: number): void;
  (e: "pair-open"): void;
  (e: "pair-start"): void;
  (e: "pair-cancel"): void;
  (e: "pair-hover"): void;
  (e: "pair-close"): void;
  (e: "restore-click"): void;
  (e: "update:dialogVisible", v: boolean): void;
  (e: "dialog-result", v: any): void;
}>();

/** Local models */
const motionSyncModel = ref(props.motionSync);
watch(
  () => props.motionSync,
  (v) => (motionSyncModel.value = v)
);

const performanceModel = ref(props.performance);
watch(
  () => props.performance,
  (v) => (performanceModel.value = v)
);

const debounceModel = ref(props.debounceTime);
watch(
  () => props.debounceTime,
  (v) => (debounceModel.value = v)
);

const pairDialogVisible = ref(props.pairDialogVisible);
watch(
  () => props.pairDialogVisible,
  (v) => (pairDialogVisible.value = v)
);

/** Methods */
function togglePerformance() {
  performanceModel.value = !performanceModel.value;
  emit("update:performance", performanceModel.value);
}
function onDebounceChange(v: number) {
  emit("update:debounceTime", v);
}
function openPairDialog() {
  pairDialogVisible.value = true;
  emit("pair-open");
}

const btnIconStyle = {
  backgroundColor: "transparent",
  border: 0,
  color: "white",
  fontSize: "32px",
  padding: "12px 20px",
};
</script>

<style scoped>
.debounce-panel {
  display: flex;
  flex-direction: column;
}
.row {
  display: flex;
}
.center {
  align-items: center;
}
.even {
  justify-content: space-evenly;
}
.inner {
  display: flex;
  align-items: center;
  gap: 8px;
}
.text-light {
  color: #fff;
}
</style>
