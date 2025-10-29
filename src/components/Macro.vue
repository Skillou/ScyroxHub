<template>
  <div class="macro-page">
    <!-- Header -->
    <div class="header">
      <h1 class="title">{{ t("Macro") }}</h1>
      <div class="header-actions">
        <span class="label">{{ t("MacroList") }}</span>
        <el-button size="small" @click="handleNewMacroClick">{{
          t("NewMacro")
        }}</el-button>
      </div>
    </div>

    <!-- Macro table -->
    <div class="macro-table-wrapper">
      <el-table
        class="macro-table"
        :data="macros"
        max-height="180"
        @current-change="handleMacroCurrentChange"
        :row-class-name="macroRowName"
        :header-cell-style="macroHeaderStyle"
        highlight-current-row
      >
        <el-table-column :label="t('MacroList')" width="320">
          <template #default="{ row }">
            <span class="ml-2">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column align="right">
          <template #default="{ $index, row }">
            <el-button
              icon="el-icon-edit"
              size="small"
              @click="handleEditName($index, row)"
            />
            <el-button
              icon="el-icon-delete"
              type="danger"
              size="small"
              @click="handleDeleteMacro($index, row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Keys header -->
    <div class="keys-header">
      <span class="label">{{ t("KeyList") }}</span>
      <el-button
        ref="recordButton"
        class="record-btn"
        size="small"
        @click="handleRecordClick"
      >
        <span :class="recordClass" aria-hidden="true" />
        {{ recordLabel }}
      </el-button>
    </div>

    <!-- Content row: keys table + right panel -->
    <div class="content-row">
      <!-- Keys table -->
      <div class="keys-table-wrapper">
        <el-table
          ref="keyTable"
          class="key-table"
          :data="selectedMacro?.events ?? []"
          max-height="320"
          highlight-current-row
          @current-change="handleKeyCurrentChange"
          :row-class-name="keyRowName"
          :header-cell-style="keyHeaderStyle"
          empty-text="—"
        >
          <el-table-column :label="t('Event')" width="220">
            <template #default="{ row, $index }">
              <div class="row-flex">
                <i v-show="row.status === 1" class="el-icon-top" />
                <i v-show="row.status === 0" class="el-icon-bottom" />
                <span class="ml-2 w-20 truncate">{{ row.text }}</span>
                <el-button
                  class="ml-1"
                  size="small"
                  icon="el-icon-edit"
                  @click="handleEditKeyClick($index, row)"
                />
              </div>
            </template>
          </el-table-column>

          <el-table-column :label="t('Delay')" width="170">
            <template #default="{ row, $index }">
              <div class="row-flex">
                <i class="el-icon-time ml-2" />
                <span class="ml-2 w-16">{{ row.delay }}</span>
                <el-button
                  class="ml-1"
                  size="small"
                  icon="el-icon-edit"
                  @click="handleDelayClick($index)"
                />
              </div>
            </template>
          </el-table-column>

          <el-table-column align="right">
            <template #default="{ row, $index }">
              <el-button
                size="small"
                type="danger"
                icon="el-icon-delete"
                @click="handleDeleteKeyClick($index)"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Right panel -->
      <div class="right-panel">
        <!-- Hidden focus catcher to get keydown/keyup when recording -->
        <div
          class="focus-catcher"
          tabindex="-1"
          @keydown="handleKeyDown"
          @keyup="handleKeyUp"
        />

        <!-- Delay mode -->
        <div class="group">
          <el-radio v-model="autoDelay" label="1">{{
            t("AutoDelay")
          }}</el-radio>
          <div class="row-flex">
            <el-radio v-model="autoDelay" label="2">{{
              t("DefaultDelay")
            }}</el-radio>
            <el-input
              v-show="!isRecording"
              v-model="defaultDelay"
              size="small"
              class="ml-2 w-28"
              placeholder="10~65535"
              @blur="handleDefaultDelayBlur"
            />
          </div>
        </div>

        <!-- Cycle options -->
        <div class="group">
          <el-radio v-model="cycleAction" label="254">{{
            t("UntilThisReleased")
          }}</el-radio>
          <el-radio v-model="cycleAction" label="255">{{
            t("UntilAnyPressed")
          }}</el-radio>
          <el-radio v-model="cycleAction" label="253">{{
            t("UntilThisPressed")
          }}</el-radio>
          <div class="row-flex mt-2">
            <el-radio v-model="cycleAction" label="1">{{
              t("CycleTimes")
            }}</el-radio>
            <el-input
              v-show="!isRecording"
              v-model="cycleTimes"
              size="small"
              class="ml-2 w-24"
              placeholder="1-250"
              @blur="handleCycleTimesBlur"
            />
          </div>
        </div>

        <!-- Insert event dropdown -->
        <div class="group">
          <div class="row-between">
            <span>{{ t("InsertEvent") }}</span>
            <el-dropdown trigger="click" @command="handleInsertEventCommand">
              <span class="el-dropdown-link">
                {{ t("Choose") }}<i class="el-icon-arrow-down el-icon--right" />
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="(item, i) in insertEvent"
                    :key="i"
                    :command="item.command"
                  >
                    {{ item.text }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <el-button
          class="mt-2"
          size="small"
          type="primary"
          @click="handleSaveClick"
          >{{ t("Save") }}</el-button
        >
      </div>
    </div>

    <!-- Dialog: new/rename macro -->
    <el-dialog
      :visible="dialogMacroNameVisible"
      @update:visible="(v) => (dialogMacroNameVisible = v)"
    >
      <div class="dialog-col">
        <span class="text-muted">{{ inputMacroName }}</span>
        <el-input
          v-model="macroName"
          type="text"
          maxlength="30"
          class="w-4/5 mt-1"
        />
      </div>
      <template #footer>
        <el-button @click="handleMacroNameCancelClick">{{
          t("Cancel")
        }}</el-button>
        <el-button type="primary" @click="handleMacroNameOKClick">{{
          t("OK")
        }}</el-button>
      </template>
    </el-dialog>

    <!-- Dialog: edit key -->
    <el-dialog
      :visible="dialogInputKeyVisible"
      @update:visible="(v) => (dialogInputKeyVisible = v)"
    >
      <div class="dialog-col">
        <span class="text-muted">{{ inputKeyTips }}</span>
        <el-input
          ref="inputField"
          v-model="inputKey"
          class="w-4/5 mt-1"
          @focus="handleEditKeyFocus"
          @blur="handleEditKeyBlur"
          @input="handleEditKeyInput"
        />
      </div>
      <template #footer>
        <el-button @click="handleInputKeyCancelClick">{{
          t("Cancel")
        }}</el-button>
        <el-button type="primary" @click="handleInputKeyOKClick">{{
          t("OK")
        }}</el-button>
      </template>
    </el-dialog>

    <!-- Dialog: edit delay -->
    <el-dialog
      :visible="dialogInputDelayVisible"
      @update:visible="(v) => (dialogInputDelayVisible = v)"
    >
      <div class="dialog-col">
        <span class="text-muted">{{ inputDelayTips }}</span>
        <el-input
          v-model.number="inputDelay"
          type="number"
          placeholder="10~65535"
          class="w-4/5 mt-1"
        />
      </div>
      <template #footer>
        <el-button @click="handleInputDelayCancelClick">{{
          t("Cancel")
        }}</el-button>
        <el-button type="primary" @click="handleInputDelayOKClick">{{
          t("OK")
        }}</el-button>
      </template>
    </el-dialog>

    <!-- Dialog: generic confirm/info -->
    <el-dialog
      :visible="dialogVisible"
      @update:visible="(v) => (dialogVisible = v)"
    >
      <span>{{ dialogTips }}</span>
      <template #footer>
        <el-button @click="handleCancelClick">{{ t("Cancel") }}</el-button>
        <el-button type="primary" @click="handleOKClick">{{
          t("OK")
        }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue";

/**
 * Ultra-light i18n (remplace les attrs lan="...")
 */
const messages: Record<string, Record<string, string>> = {
  "zh-CN": {
    Macro: "宏",
    MacroList: "宏列表",
    NewMacro: "新建宏",
    KeyList: "按键列表",
    AutoDelay: "自动插入延时",
    DefaultDelay: "默认延时",
    UntilThisReleased: "循环直到此按键松开",
    UntilAnyPressed: "循环直到任意键按下",
    UntilThisPressed: "循环直到此按键再次按下",
    CycleTimes: "循环次数",
    InsertEvent: "插入事件",
    Save: "保存",
    Cancel: "取 消",
    OK: "确 定",
    Choose: "选择",
    Event: "事件",
    Delay: "延时",
    RecordingStart: "开始录制",
    RecordingStop: "停止录制",
  },
  fr: {
    Macro: "Macro",
    MacroList: "Liste des macros",
    NewMacro: "Nouvelle macro",
    KeyList: "Liste des touches",
    AutoDelay: "Insérer automatiquement des délais",
    DefaultDelay: "Délai par défaut",
    UntilThisReleased: "Boucler jusqu'au relâchement",
    UntilAnyPressed: "Boucler jusqu'à n'importe quelle pression",
    UntilThisPressed: "Boucler jusqu'à la prochaine pression",
    CycleTimes: "Nombre de cycles",
    InsertEvent: "Insérer un événement",
    Save: "Enregistrer",
    Cancel: "Annuler",
    OK: "OK",
    Choose: "Choisir",
    Event: "Événement",
    Delay: "Délai",
    RecordingStart: "Démarrer l'enregistrement",
    RecordingStop: "Arrêter l'enregistrement",
  },
  en: {
    Macro: "Macro",
    MacroList: "Macro List",
    NewMacro: "New Macro",
    KeyList: "Key List",
    AutoDelay: "Auto insert delay",
    DefaultDelay: "Default delay",
    UntilThisReleased: "Loop until this key released",
    UntilAnyPressed: "Loop until any key pressed",
    UntilThisPressed: "Loop until this key pressed again",
    CycleTimes: "Cycle times",
    InsertEvent: "Insert event",
    Save: "Save",
    Cancel: "Cancel",
    OK: "OK",
    Choose: "Choose",
    Event: "Event",
    Delay: "Delay",
    RecordingStart: "Start recording",
    RecordingStop: "Stop recording",
  },
};
const lang = ref<"zh-CN" | "fr" | "en">(
  (localStorage.getItem("scyrox_lang") as any) || "zh-CN"
);
const t = (k: string) => messages[lang.value]?.[k] ?? k;

/**
 * Types & state
 */
interface MacroEvent {
  status: 0 | 1;
  text: string;
  delay: number;
}
interface MacroRow {
  id: string;
  name: string;
  events: MacroEvent[];
}

const macros = ref<MacroRow[]>([{ id: "m1", name: "Example 1", events: [] }]);
const selectedMacroId = ref<string | null>(macros.value[0]?.id ?? null);
const selectedMacro = computed(
  () => macros.value.find((m) => m.id === selectedMacroId.value) || null
);

// Recording
const isRecording = ref(false);
const recordClass = computed(() => (isRecording.value ? "dot dot-on" : "dot"));
const recordLabel = computed(() =>
  isRecording.value ? t("RecordingStop") : t("RecordingStart")
);

// Delay behavior
const autoDelay = ref<"1" | "2">("1");
const defaultDelay = ref("30");

// Cycle options
const cycleAction = ref<"254" | "255" | "253" | "1">("254");
const cycleTimes = ref("1");

// Insert event list (placeholder)
const insertEvent = reactive([
  { text: "Left Click Down", command: "LD" },
  { text: "Left Click Up", command: "LU" },
  { text: "Right Click Down", command: "RD" },
  { text: "Right Click Up", command: "RU" },
  { text: "Delay 50ms", command: "D50" },
]);

// Dialogs state
const dialogMacroNameVisible = ref(false);
const macroName = ref("");
const inputMacroName = ref("");

const dialogInputKeyVisible = ref(false);
const inputKey = ref("");
const inputKeyTips = ref("");

const dialogInputDelayVisible = ref(false);
const inputDelay = ref<number | null>(null);
const inputDelayTips = ref("");

const dialogVisible = ref(false);
const dialogTips = ref("");

/**
 * Table helpers
 */
const macroRowName = () => "";
const keyRowName = () => "";
const macroHeaderStyle = () => ({ background: "#1d1d1d" });
const keyHeaderStyle = () => ({ background: "#1d1d1d" });

/**
 * Handlers - Macros
 */
function handleNewMacroClick() {
  inputMacroName.value = t("NewMacro");
  macroName.value = "";
  dialogMacroNameVisible.value = true;
}
function handleEditName(index: number, row: MacroRow) {
  inputMacroName.value = row.name;
  macroName.value = row.name;
  dialogMacroNameVisible.value = true;
}
function handleDeleteMacro(index: number, row: MacroRow) {
  const i = macros.value.findIndex((m) => m.id === row.id);
  if (i >= 0) macros.value.splice(i, 1);
  if (selectedMacroId.value === row.id)
    selectedMacroId.value = macros.value[0]?.id ?? null;
}
function handleMacroCurrentChange(curr: MacroRow) {
  selectedMacroId.value = curr?.id ?? null;
}

/**
 * Handlers - Keys/events
 */
function handleRecordClick() {
  isRecording.value = !isRecording.value;
  if (isRecording.value) startKeyboardCapture();
  else stopKeyboardCapture();
}

function handleKeyCurrentChange() {
  /* noop for now */
}
function handleEditKeyClick(index: number, row: MacroEvent) {
  inputKeyTips.value = t("Event");
  inputKey.value = row.text;
  dialogInputKeyVisible.value = true;
}
function handleDelayClick(index: number) {
  inputDelayTips.value = t("Delay");
  inputDelay.value = selectedMacro.value?.events[index]?.delay ?? null;
  dialogInputDelayVisible.value = true;
}
function handleDeleteKeyClick(index: number) {
  if (!selectedMacro.value) return;
  selectedMacro.value.events.splice(index, 1);
}

function handleDefaultDelayBlur() {
  const n = Number(defaultDelay.value);
  if (!Number.isFinite(n) || n < 10 || n > 65535) defaultDelay.value = "30";
}
function handleCycleTimesBlur() {
  const n = Number(cycleTimes.value);
  if (!Number.isFinite(n) || n < 1 || n > 250) cycleTimes.value = "1";
}

function handleInsertEventCommand(cmd: string) {
  if (!selectedMacro.value) return;
  const nowDelay = autoDelay.value === "2" ? Number(defaultDelay.value) : 0;
  const rec: MacroEvent = { status: 1, text: cmd, delay: nowDelay };
  selectedMacro.value.events.push(rec);
}

function handleSaveClick() {
  // Ici, sérialisez et envoyez vers votre périphérique HID
  dialogTips.value = "Saved.";
  dialogVisible.value = true;
}

/**
 * Keyboard capture (basic)
 */
function onKeyDown(e: KeyboardEvent) {
  if (!isRecording.value || !selectedMacro.value) return;
  const label = `DOWN ${e.code}`;
  selectedMacro.value.events.push({
    status: 1,
    text: label,
    delay: autoDelay.value === "2" ? Number(defaultDelay.value) : 0,
  });
}
function onKeyUp(e: KeyboardEvent) {
  if (!isRecording.value || !selectedMacro.value) return;
  const label = `UP ${e.code}`;
  selectedMacro.value.events.push({
    status: 0,
    text: label,
    delay: autoDelay.value === "2" ? Number(defaultDelay.value) : 0,
  });
}

function startKeyboardCapture() {
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
}
function stopKeyboardCapture() {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
}

function handleKeyDown(e: KeyboardEvent) {
  onKeyDown(e);
}
function handleKeyUp(e: KeyboardEvent) {
  onKeyUp(e);
}

onMounted(() => {});
onBeforeUnmount(() => stopKeyboardCapture());

/**
 * Dialog buttons
 */
function handleMacroNameCancelClick() {
  dialogMacroNameVisible.value = false;
}
function handleMacroNameOKClick() {
  const name = macroName.value.trim() || "Macro";
  if (inputMacroName.value === t("NewMacro")) {
    const id = `m_${Date.now()}`;
    macros.value.push({ id, name, events: [] });
    selectedMacroId.value = id;
  } else if (selectedMacro.value) {
    selectedMacro.value.name = name;
  }
  dialogMacroNameVisible.value = false;
}

function handleInputKeyCancelClick() {
  dialogInputKeyVisible.value = false;
}
function handleInputKeyOKClick() {
  if (!selectedMacro.value) return;
  // Replace current selected event text if needed; for simplicity we append
  selectedMacro.value.events.push({
    status: 1,
    text: inputKey.value,
    delay: autoDelay.value === "2" ? Number(defaultDelay.value) : 0,
  });
  dialogInputKeyVisible.value = false;
}

function handleEditKeyFocus() {
  /* optional */
}
function handleEditKeyBlur() {
  /* optional */
}
function handleEditKeyInput() {
  /* optional */
}

function handleInputDelayCancelClick() {
  dialogInputDelayVisible.value = false;
}
function handleInputDelayOKClick() {
  if (!selectedMacro.value) return;
  const val = Number(inputDelay.value ?? 0);
  if (!Number.isFinite(val) || val < 10 || val > 65535) {
    dialogInputDelayVisible.value = false;
    return;
  }
  // Append a pure delay event for simplicity
  selectedMacro.value.events.push({ status: 1, text: "DELAY", delay: val });
  dialogInputDelayVisible.value = false;
}

function handleCancelClick() {
  dialogVisible.value = false;
}
function handleOKClick() {
  dialogVisible.value = false;
}
</script>

<style scoped>
.macro-page {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.header {
  display: flex;
  flex-direction: column;
}
.title {
  margin: 2px 0;
  text-align: left;
}
.header-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.label {
  font-size: 16px;
}
.macro-table-wrapper {
  margin-top: 6px;
}
.keys-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}
.content-row {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 12px;
  margin-top: 6px;
}
.row-flex {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.row-between {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.right-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}
.group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.focus-catcher {
  outline: none;
}
.record-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: #666;
  display: inline-block;
}
.dot-on {
  animation: pulse 1s infinite alternate;
  background: #ff4d4f;
}
@keyframes pulse {
  from {
    opacity: 0.6;
  }
  to {
    opacity: 1;
  }
}
.ml-1 {
  margin-left: 4px;
}
.ml-2 {
  margin-left: 8px;
}
.mt-1 {
  margin-top: 4px;
}
.mt-2 {
  margin-top: 8px;
}
.w-16 {
  width: 64px;
}
.w-20 {
  width: 80px;
}
.w-24 {
  width: 96px;
}
.w-28 {
  width: 112px;
}
.w-4\/5 {
  width: 80%;
}
.text-muted {
  color: #c7c7c7;
}
.dialog-col {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
