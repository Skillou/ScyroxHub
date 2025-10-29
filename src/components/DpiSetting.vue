<template>
  <div class="dpi-settings bubble-wrap">
    <!-- Header -->
    <div class="row middle">
      <span class="title" lan="DPISetting">{{ t("DPISetting") }}</span>

      <el-slider
        class="slider bubble"
        v-model="localDpiValue"
        :min="min"
        :max="max"
        :step="step"
        show-input
        input-size="small"
        @input="(v) => emit('update:dpiValue', v)"
        @change="handleDPIValueChange"
      />
    </div>

    <!-- Slots + Count -->
    <div class="row center">
      <div class="slots">
        <div v-for="(val, idx) in visibleSlots" :key="idx" class="slot">
          <span
            class="slot-pill"
            :class="{ active: currentIndex === idx }"
            @click="handleDPIIndexClick(idx)"
            @dblclick="handleDPIDoubleClick(idx)"
            :title="val + ' DPI'"
          >
            {{ val }}
          </span>
          <div class="triangle" v-show="currentIndex === idx" />
        </div>
      </div>

      <div class="count bubble">
        <span class="count-label">{{ t("Slots") || "Slots" }}</span>
        <el-input-number
          v-model="localMaxCount"
          :min="1"
          :max="5"
          size="small"
          @change="handleDPICountChange"
        />
      </div>
    </div>

    <!-- Edit dialog -->
    <el-dialog v-model="dialogVisible" class="dpi-dialog">
      <div class="dialog-col">
        <span class="tip">{{ inputDPIValueTips }}</span>
        <el-input
          class="dialog-input"
          placeholder="100~30000"
          v-model.number="inputDpi"
          @input="handleValueInput"
        />
      </div>
      <template #footer>
        <el-button lan="Cancel" @click="handleDPIValueCancelClick">
          {{ t("Cancel") }}
        </el-button>
        <el-button type="primary" lan="OK" @click="handleDPIValueOKClick">
          {{ t("OK") }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import HIDHandle from "./HIDHandle";

const messages = {} as const;
const lang = ref(
  (localStorage.getItem("scyrox_lang") as "zh-CN" | "fr" | "en") || "zh-CN"
);
const t = (k: string) => (messages as any)[lang.value]?.[k] ?? k;
window.addEventListener("storage", (e) => {
  if (e.key === "scyrox_lang" && e.newValue) lang.value = e.newValue as any;
});
const inputDPIValueTips = computed(() => t("EnterDPITip") || "Enter 100–30000");

const props = defineProps<{
  dpiValue: number;
  values: number[];
  currentIndex: number;
  dpiMaxCount: number;
  min?: number;
  max?: number;
  step?: number;
}>();
const emit = defineEmits([
  "update:dpiValue",
  "update:values",
  "update:currentIndex",
  "update:dpiMaxCount",
  "change",
  "slot-edit",
]);

const min = computed(() => props.min ?? 100);
const max = computed(() => props.max ?? 30000);
const step = computed(() => props.step ?? 50);

const localDpiValue = ref(props.dpiValue);
watch(
  () => props.dpiValue,
  (v) => (localDpiValue.value = v)
);

const localMaxCount = ref(Math.min(Math.max(props.dpiMaxCount, 1), 5));
watch(
  () => props.dpiMaxCount,
  (v) => (localMaxCount.value = Math.min(Math.max(v, 1), 5))
);

const currentIndex = computed({
  get: () => props.currentIndex,
  set: (v) => emit("update:currentIndex", v),
});
const visibleSlots = computed(() => props.values.slice(0, localMaxCount.value));

const dialogVisible = ref(false);
const inputDpi = ref<number | null>(null);
let editingIndex = -1;

function handleDPIValueChange(val: number) {
  emit("update:dpiValue", val);
  emit("change", val);
  try {
    if (!(HIDHandle as any)?.device?.opened) {
      console.warn("Device HID non ouvert.");
    }
  } catch (e) {
    console.error(e);
  }
}

function handleDPIIndexClick(idx: number) {
  currentIndex.value = idx;
  localDpiValue.value = props.values[idx];
  emit("update:dpiValue", localDpiValue.value);
}

function handleDPIDoubleClick(idx: number) {
  editingIndex = idx;
  inputDpi.value = props.values[idx];
  dialogVisible.value = true;
}

function handleDPICountChange(v: number) {
  emit("update:dpiMaxCount", Math.min(Math.max(Number(v), 1), 5));
}

function handleValueInput() {
  if (inputDpi.value == null) return;
  if (inputDpi.value < min.value) inputDpi.value = min.value;
  if (inputDpi.value > max.value) inputDpi.value = max.value;
}
function handleDPIValueCancelClick() {
  dialogVisible.value = false;
}
function handleDPIValueOKClick() {
  if (inputDpi.value == null) return handleDPIValueCancelClick();
  const v = Math.round(inputDpi.value);
  const next = props.values.slice();
  next[editingIndex] = v;
  emit("update:values", next);
  emit("slot-edit", editingIndex, v);
  if (currentIndex.value === editingIndex) {
    localDpiValue.value = v;
    emit("update:dpiValue", v);
  }
  dialogVisible.value = false;
}
</script>

<style scoped>
:root {
  /* Accent bubble lime */
  --accent: #dafe22;
  --accent-20: rgba(218, 254, 34, 0.2);
  --accent-12: rgba(218, 254, 34, 0.12);
  --panel: rgba(255, 255, 255, 0.04);
  --panel-2: rgba(255, 255, 255, 0.02);
  --stroke: rgba(255, 255, 255, 0.08);
  --text-dim: rgba(255, 255, 255, 0.75);
}

/* -------- Layout bubble -------- */
.bubble-wrap {
  padding: 14px;
  border-radius: 16px;
  background: radial-gradient(
      900px 420px at 10% -20%,
      var(--accent-12),
      transparent
    ),
    linear-gradient(180deg, var(--panel), var(--panel-2));
  border: 1px solid var(--stroke);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.dpi-settings {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.row {
  display: flex;
  flex-direction: row;
  gap: 12px;
}
.middle {
  align-items: center;
}
.center {
  align-items: center;
  justify-content: space-between;
}

/* -------- Title -------- */
.title {
  min-width: 120px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

/* -------- Slider bubble -------- */
.slider {
  flex: 1;
  max-width: 740px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02),
    0 10px 28px rgba(0, 0, 0, 0.25);
}
.slider:hover {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03),
    0 12px 36px rgba(0, 0, 0, 0.3);
}

/* Affiner Element Plus (deep) */
:deep(.el-slider__runway) {
  height: 6px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.06)
  );
  border-radius: 999px;
}
:deep(.el-slider__bar) {
  height: 6px;
  background: linear-gradient(90deg, var(--accent), #c5ff4a);
}
:deep(.el-slider__button) {
  width: 16px;
  height: 16px;
  border: 2px solid #0f1012;
  background: var(--accent);
  box-shadow: 0 3px 10px rgba(218, 254, 34, 0.4);
}
:deep(.el-input-number),
:deep(.el-input) {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 10px;
}
:deep(.el-input__inner),
:deep(.el-input__wrapper) {
  background: transparent !important;
}

/* -------- Slots (pills) -------- */
.slots {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 12px;
  align-items: center;
}
.slot {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.slot-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: radial-gradient(
      200px 60px at 50% -40%,
      var(--accent-12),
      transparent 40%
    ),
    rgba(20, 20, 24, 0.75);
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.2px;
  cursor: pointer;
  user-select: none;
  transition: transform 0.08s ease, box-shadow 0.14s ease,
    border-color 0.14s ease, background 0.2s ease;
}
.slot-pill:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.24);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
.slot-pill.active {
  background: radial-gradient(
      250px 80px at 50% -40%,
      rgba(218, 254, 34, 0.28),
      transparent 50%
    ),
    linear-gradient(90deg, var(--accent), #c5ff4a);
  color: #0e0e10;
  border-color: transparent;
  box-shadow: 0 10px 30px rgba(218, 254, 34, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
}

/* Indicateur */
.triangle {
  margin-top: 6px;
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 9px solid var(--accent);
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.38));
}

/* -------- Count bubble -------- */
.count {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.2);
}
.count-label {
  opacity: 0.8;
  font-weight: 600;
}

/* -------- Dialog -------- */
.dpi-dialog :deep(.el-dialog) {
  border-radius: 16px;
  background: radial-gradient(
      800px 360px at 0% -20%,
      var(--accent-12),
      transparent
    ),
    linear-gradient(180deg, rgba(28, 28, 32, 0.96), rgba(24, 24, 28, 0.94));
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.dialog-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tip {
  color: var(--text-dim);
}
.dialog-input {
  margin-top: 4px;
}
</style>
