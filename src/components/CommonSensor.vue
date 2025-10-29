<template>
  <div class="sensor-panel">
    <div class="col">
      <!-- LOD row -->
      <div class="row middle between">
        <div class="row middle">
          <span class="label">LOD</span>
          <div class="col slider-wrap">
            <div id="runway-lod" class="slider_runway small"></div>
            <div class="options small">
              <div v-for="(opt, idx) in lods" :key="idx" class="opt">
                <label
                  class="opt-label"
                  :style="{
                    color:
                      idx === modelLod ? '#eeec52' : 'rgba(255,255,255,0.35)',
                  }"
                >
                  {{ opt.option }}
                </label>
                <el-button
                  class="opt-btn"
                  :style="btnStyle(idx === modelLod)"
                  @click="onLodClick(idx)"
                />
              </div>
            </div>
          </div>
        </div>

        <el-checkbox v-model="rippleLocal" @change="onRippleChange">
          <span>{{ t("Ripple") }}</span>
        </el-checkbox>
        <el-checkbox v-model="angleLocal" @change="onAngleChange">
          <span>{{ t("Angle") }}</span>
        </el-checkbox>
      </div>

      <!-- Long distance + Sleep time + Sensor20K -->
      <div class="row middle between block">
        <el-checkbox
          v-if="longDistanceShow"
          v-model="longDistanceLocal"
          @change="onLongDistanceChange"
          style="margin-top: -6px"
        >
          <span>{{ t("LongDistance") }}</span>
        </el-checkbox>

        <div class="row middle">
          <span class="label">{{ t("SleepTime") }}</span>
          <div class="col slider-wrap ml16">
            <div id="runway-sleep" class="slider_runway"></div>
            <div class="options">
              <div v-for="(opt, idx) in sleepTimes" :key="idx" class="opt">
                <label
                  class="opt-label"
                  :style="{
                    color:
                      idx === modelSleep ? '#eeec52' : 'rgba(255,255,255,0.35)',
                  }"
                >
                  {{ opt.option }}
                </label>
                <el-button
                  class="opt-btn"
                  :style="btnStyle(idx === modelSleep)"
                  @click="onSleepClick(idx)"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="row middle">
          <el-checkbox
            :disabled="disableSensor20K"
            v-model="sensor20kLocal"
            @change="onSensor20KChange"
          >
            <span>{{ t("Sensor20K") }}</span>
          </el-checkbox>
          <el-tooltip effect="dark" :content="sensor20kTips" placement="right">
            <i class="el-icon-question ml6" />
          </el-tooltip>
        </div>
      </div>
    </div>

    <!-- Dialogs -->
    <el-dialog
      :visible="dialogLongDistanceVisible"
      @update:visible="(v) => (dialogLongDistanceVisible = v)"
    >
      <span class="text-light">{{ longDistanceTips }}</span>
      <template #footer>
        <el-button @click="onLongDistanceCancel">{{ t("Cancel") }}</el-button>
        <el-button type="primary" @click="onLongDistanceConfirm">{{
          t("OK")
        }}</el-button>
      </template>
    </el-dialog>

    <el-dialog
      :visible="dialogSensor20KVisible"
      @update:visible="(v) => (dialogSensor20KVisible = v)"
    >
      <span class="text-light">{{ dialogSensor20K }}</span>
      <template #footer>
        <el-button @click="onSensor20KCancel">{{ t("Cancel") }}</el-button>
        <el-button type="primary" @click="onSensor20KConfirm">{{
          t("OK")
        }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

/** i18n */
const messages: Record<string, Record<string, string>> = {
  "zh-CN": {
    Ripple: "波纹控制",
    Angle: "直线修正",
    LongDistance: "远距离模式",
    SleepTime: "休眠时间",
    Sensor20K: "20K 传感器",
    Cancel: "取 消",
    OK: "确 定",
  },
  fr: {
    Ripple: "Correction ripple",
    Angle: "Correction de ligne",
    LongDistance: "Mode longue portée",
    SleepTime: "Veille",
    Sensor20K: "Capteur 20K",
    Cancel: "Annuler",
    OK: "OK",
  },
  en: {
    Ripple: "Ripple control",
    Angle: "Angle snapping",
    LongDistance: "Long-range mode",
    SleepTime: "Sleep time",
    Sensor20K: "20K sensor",
    Cancel: "Cancel",
    OK: "OK",
  },
};
const lang =
  (localStorage.getItem("scyrox_lang") as "zh-CN" | "fr" | "en") || "zh-CN";
const t = (k: string) => messages[lang]?.[k] ?? k;

/** Types */
interface Opt {
  option: string;
  value?: number;
}

/** Props */
const props = defineProps<{
  lods: Opt[];
  sleepTimes: Opt[];
  modelLod: number;
  modelSleep: number;
  ripple: boolean;
  angle: boolean;
  longDistance: boolean;
  longDistanceShow: boolean;
  sensor20K: boolean;
  disableSensor20K: boolean;
  longDistanceTips?: string;
  dialogSensor20K?: string;
  sensor20kTips?: string;
}>();

/** Emits */
const emit = defineEmits<{
  (e: "update:modelLod", idx: number): void;
  (e: "update:modelSleep", idx: number): void;
  (e: "update:ripple", v: boolean): void;
  (e: "update:angle", v: boolean): void;
  (e: "update:longDistance", v: boolean): void;
  (e: "update:sensor20K", v: boolean): void;
  (e: "lod-select", idx: number, opt: Opt): void;
  (e: "sleep-select", idx: number, opt: Opt): void;
  (e: "longDistance-confirm"): void;
  (e: "longDistance-cancel"): void;
  (e: "sensor20K-confirm"): void;
  (e: "sensor20K-cancel"): void;
}>();

/** Local models for checkboxes */
const rippleLocal = ref(props.ripple);
const angleLocal = ref(props.angle);
const longDistanceLocal = ref(props.longDistance);
const sensor20kLocal = ref(props.sensor20K);

/** Dialogs */
const dialogLongDistanceVisible = ref(false);
const dialogSensor20KVisible = ref(false);

/** Methods */
function btnStyle(active: boolean) {
  return {
    backgroundColor: active ? "#eeec52" : "#949494",
    borderColor: active ? "#eeec52" : "#949494",
  };
}

function onLodClick(idx: number) {
  emit("update:modelLod", idx);
  emit("lod-select", idx, props.lods[idx]);
}
function onSleepClick(idx: number) {
  emit("update:modelSleep", idx);
  emit("sleep-select", idx, props.sleepTimes[idx]);
}

function onRippleChange(v: boolean) {
  emit("update:ripple", v);
}
function onAngleChange(v: boolean) {
  emit("update:angle", v);
}

function onLongDistanceChange(v: boolean) {
  longDistanceLocal.value = v;
  dialogLongDistanceVisible.value = true;
}
function onLongDistanceConfirm() {
  emit("update:longDistance", longDistanceLocal.value);
  emit("longDistance-confirm");
  dialogLongDistanceVisible.value = false;
}
function onLongDistanceCancel() {
  emit("longDistance-cancel");
  dialogLongDistanceVisible.value = false;
}

function onSensor20KChange(v: boolean) {
  sensor20kLocal.value = v;
  dialogSensor20KVisible.value = true;
}
function onSensor20KConfirm() {
  emit("update:sensor20K", sensor20kLocal.value);
  emit("sensor20K-confirm");
  dialogSensor20KVisible.value = false;
}
function onSensor20KCancel() {
  emit("sensor20K-cancel");
  dialogSensor20KVisible.value = false;
}
</script>

<style scoped>
.sensor-panel {
  display: flex;
  flex-direction: column;
}
.col {
  display: flex;
  flex-direction: column;
}
.row {
  display: flex;
}
.middle {
  align-items: center;
}
.between {
  justify-content: space-between;
}
.block {
  margin-top: 12px;
}
.label {
  margin-right: 12px;
}
.slider_runway {
  width: 300px;
  height: 2px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.15),
    rgba(255, 255, 255, 0.35)
  );
  border-radius: 1px;
}
.slider_runway.small {
  width: 120px;
}
.options {
  position: relative;
  display: flex;
  flex-direction: row;
  width: 300px;
  justify-content: space-around;
  margin-top: 6px;
}
.options.small {
  width: 120px;
}
.opt {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.opt-label {
  position: relative;
  top: -8px;
  font-size: 12px;
}
.opt-btn {
  position: relative;
  top: -4px;
  width: 16px;
  height: 16px;
  padding: 0;
  min-height: 16px;
  border-radius: 50%;
}
.ml6 {
  margin-left: 6px;
}
.ml16 {
  margin-left: 16px;
}
.text-light {
  color: #fff;
}
</style>
