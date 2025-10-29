<template>
  <div class="common-mouse" :style="mouseImageStyle">
    <div class="overlay" v-if="loadFinish">
      <el-cascader
        v-for="(item, index) in locs"
        :key="index"
        ref="setCascaderRef"
        class="hotspot"
        :style="{ top: item.top, left: item.left }"
        :options="keyOptions"
        :placeholder="''"
        :show-all-levels="false"
        v-model="internalKeys[index]"
        @change="(val) => emit('select-change', index, val)"
        @focus="(ev) => emit('focus', index, ev)"
        @visible-change="() => emit('focus', index)"
      >
        <template #default="{ node, data }">
          <span
            class="slot-full"
            @click.stop="emit('span-click', node, data)"
            >{{ data.label }}</span
          >
        </template>
      </el-cascader>
      <!-- marker triangle on selected hotspot (optional hook) -->
      <div
        v-for="(item, index) in locs"
        :key="'tri-' + index"
        class="triangle"
        v-show="currentIndex === index"
        :style="{
          top: calcTriangleTop(item.top),
          left: calcTriangleLeft(item.left),
        }"
      />
    </div>

    <!-- Fire key dialog -->
    <el-dialog
      :visible="dialogFireKeyVisible"
      @update:visible="(v) => (dialogFireKeyVisible = v)"
    >
      <el-form :model="fireKeyForm">
        <el-form-item
          :label="t('Times')"
          label-width="200px"
          class="text-light"
        >
          <el-input v-model="fireKeyForm.times" autocomplete="off" />
        </el-form-item>
        <el-form-item
          :label="t('Interval')"
          label-width="200px"
          class="text-light"
        >
          <el-input v-model="fireKeyForm.interval" autocomplete="off" />
        </el-form-item>
      </el-form>
      <span class="text-light">{{ tips }}</span>
      <template #footer>
        <el-button @click="onFireKeyCancel">{{ t("Cancel") }}</el-button>
        <el-button type="primary" @click="onFireKeyOK">{{ t("OK") }}</el-button>
      </template>
    </el-dialog>

    <!-- Combo key dialog -->
    <el-dialog
      :visible="dialogComboKeyVisible"
      @update:visible="(v) => (dialogComboKeyVisible = v)"
      @close="() => emit('combo-close')"
    >
      <el-form :model="comboKeyForm">
        <el-form-item
          :label="t('InputKey')"
          label-width="180px"
          class="text-light"
        >
          <el-input v-model="comboKeyForm.keyCode" disabled />
        </el-form-item>
        <el-form-item label="" label-width="180px">
          <el-checkbox
            v-for="(m, i) in modifyItems"
            :key="i"
            v-model="comboKeyForm.modifyValues"
            :label="m"
            @change="(val:any) => emit('modify-change', val)"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="onComboCancel">{{ t("Cancel") }}</el-button>
        <el-button type="primary" @click="onComboOK">{{ t("OK") }}</el-button>
      </template>
    </el-dialog>

    <!-- Reserve left dialog -->
    <el-dialog
      :visible="dialogReserveLeftVisible"
      @update:visible="(v) => (dialogReserveLeftVisible = v)"
    >
      <span class="text-light">{{ t("KeepLeftKey") }}</span>
      <template #footer>
        <el-button @click="dialogReserveLeftVisible = false">{{
          t("Cancel")
        }}</el-button>
        <el-button type="primary" @click="dialogReserveLeftVisible = false">{{
          t("OK")
        }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from "vue";

/** i18n léger */
const messages: Record<string, Record<string, string>> = {
  "zh-CN": {
    Times: "次数",
    Interval: "间隔 (ms)",
    Cancel: "取 消",
    OK: "确 定",
    InputKey: "输入按键",
    KeepLeftKey: "为避免失去主键，建议保留左键功能。",
  },
  fr: {
    Times: "Nombre de tirs",
    Interval: "Intervalle (ms)",
    Cancel: "Annuler",
    OK: "OK",
    InputKey: "Touche saisie",
    KeepLeftKey:
      "Pour éviter de bloquer le clic principal, gardez le bouton gauche.",
  },
  en: {
    Times: "Times",
    Interval: "Interval (ms)",
    Cancel: "Cancel",
    OK: "OK",
    InputKey: "Input key",
    KeepLeftKey: "To avoid losing primary click, keep the left button.",
  },
};
const lang =
  (localStorage.getItem("scyrox_lang") as "zh-CN" | "fr" | "en") || "zh-CN";
const t = (k: string) => messages[lang]?.[k] ?? k;

/** Props / Emits */
const props = defineProps<{
  loadFinish: boolean;
  mouseImageStyle?: Record<string, any>;
  locs: Array<{ top: string; left: string }>;
  keyOptions: any[];
  keys: any[];
  currentIndex?: number;
  modifyItems?: string[];
  tips?: string;
}>();
const emit = defineEmits<{
  (e: "select-change", index: number, value: any): void;
  (e: "focus", index: number, ev?: FocusEvent): void;
  (e: "span-click", node: any, data: any): void;
  (e: "firekey-ok", payload: { times: string; interval: string }): void;
  (e: "firekey-cancel"): void;
  (e: "combo-ok", payload: { keyCode: string; modifyValues: string[] }): void;
  (e: "combo-cancel"): void;
  (e: "combo-close"): void;
  (e: "modify-change", val: any): void;
}>();

// local clone of v-model array to avoid mutating props directly
const internalKeys = ref<any[]>([]);
watch(
  () => props.keys,
  (v) => (internalKeys.value = Array.isArray(v) ? [...v] : []),
  { immediate: true }
);

// Cascader refs (array)
const cascaderRefs = ref<any[]>([]);
function setCascaderRef(el: any) {
  if (el) cascaderRefs.value.push(el);
}

// Triangle helpers (optional): adjust based on pill height
const currentIndex = computed(() => props.currentIndex ?? -1);
const calcTriangleTop = (t: string) => `calc(${t} + 28px)`;
const calcTriangleLeft = (l: string) => `calc(${l} + 20px)`;

// Dialogs state
const dialogFireKeyVisible = ref(false);
const fireKeyForm = ref({ times: "", interval: "" });

const dialogComboKeyVisible = ref(false);
const comboKeyForm = ref<{ keyCode: string; modifyValues: string[] }>({
  keyCode: "",
  modifyValues: [],
});

const dialogReserveLeftVisible = ref(false);

// Exposed actions to open dialogs from parent (optional)
function openFireDialog(
  defaults?: Partial<{ times: string; interval: string }>
) {
  fireKeyForm.value = {
    times: defaults?.times ?? "",
    interval: defaults?.interval ?? "",
  };
  dialogFireKeyVisible.value = true;
}
function openComboDialog(
  defaults?: Partial<{ keyCode: string; modifyValues: string[] }>
) {
  comboKeyForm.value = {
    keyCode: defaults?.keyCode ?? "",
    modifyValues: defaults?.modifyValues ?? [],
  };
  dialogComboKeyVisible.value = true;
}
function openReserveLeftDialog() {
  dialogReserveLeftVisible.value = true;
}
// (You can also expose these via defineExpose if parent needs to call them)

// Dialog handlers
function onFireKeyOK() {
  emit("firekey-ok", { ...fireKeyForm.value });
  dialogFireKeyVisible.value = false;
}
function onFireKeyCancel() {
  emit("firekey-cancel");
  dialogFireKeyVisible.value = false;
}

function onComboOK() {
  emit("combo-ok", { ...comboKeyForm.value });
  dialogComboKeyVisible.value = false;
}
function onComboCancel() {
  emit("combo-cancel");
  dialogComboKeyVisible.value = false;
}
</script>

<style scoped>
.common-mouse {
  position: relative;
  display: flex;
  flex-direction: column;
}
.overlay {
  position: relative;
}
.hotspot {
  position: absolute;
  width: 140px;
}
.slot-full {
  display: block;
  width: 100%;
}
.triangle {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #aaa;
}
.text-light {
  color: #fff;
}
</style>
