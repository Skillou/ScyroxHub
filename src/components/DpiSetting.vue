<template>
  <div class="dpi-settings">
    <div class="row middle">
      <span class="title" lan="DPISetting">{{ t("DPISetting") }}</span>
      <el-slider
        class="slider"
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

    <div class="row center">
      <div class="slots">
        <div v-for="(val, idx) in visibleSlots" :key="idx" class="slot">
          <span
            class="slot-pill"
            :class="{ active: currentIndex === idx }"
            @click="handleDPIIndexClick(idx)"
            @dblclick="handleDPIDoubleClick(idx)"
            style="
              border: 1px solid #666;
              border-radius: 3px;
              background: #222;
              width: 53px;
              height: 15px;
            "
          >
            {{ val }}
          </span>
          <div class="triangle" v-show="currentIndex === idx"></div>
        </div>
      </div>
      <el-input-number
        v-model="localMaxCount"
        :min="1"
        :max="5"
        size="small"
        @change="handleDPICountChange"
      />
    </div>

    <el-dialog v-model="dialogVisible">
      <div class="dialog-col">
        <span class="tip" style="color: white">{{ inputDPIValueTips }}</span>
        <el-input
          class="dialog-input"
          placeholder="100~30000"
          v-model.number="inputDpi"
          @input="handleValueInput"
          style="width: 80%; margin-top: 5px"
        />
      </div>
      <template #footer>
        <el-button lan="Cancel" @click="handleDPIValueCancelClick">{{
          t("Cancel")
        }}</el-button>
        <el-button type="primary" lan="OK" @click="handleDPIValueOKClick">{{
          t("OK")
        }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import HIDHandle from "./HIDHandle";

const messages = {
  /* ... tes messages ... */
} as const;
const lang = ref(
  (localStorage.getItem("scyrox_lang") as "zh-CN" | "fr" | "en") || "zh-CN"
);
const t = (k: string) => messages[lang.value]?.[k] ?? k;
window.addEventListener("storage", (e) => {
  if (e.key === "scyrox_lang" && e.newValue) lang.value = e.newValue as any;
});
const inputDPIValueTips = computed(() => t("EnterDPITip"));

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
// Option live sync si tu ne veux pas @input :
/*
watch(localDpiValue, (v) => {
  if (v !== props.dpiValue) emit("update:dpiValue", v);
});
*/

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
  // Toujours remonter au parent
  emit("update:dpiValue", val);
  emit("change", val);

  // Essayer d'envoyer au HID sans bloquer l'UI
  try {
    if (HIDHandle?.device && HIDHandle.device.opened) {
      // await HIDHandle.setDPI?.(val);
    } else {
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
