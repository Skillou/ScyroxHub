<template>
  <div class="report-rate">
    <div class="row middle between">
      <span class="label">{{ t("PollingRate") }}</span>
      <div class="col">
        <div id="runway" class="slider_runway"></div>
        <div class="options">
          <div v-for="(opt, idx) in rates" :key="idx" class="opt">
            <label
              class="opt-label"
              :style="{
                color:
                  idx === modelValue ? '#eeec52' : 'rgba(255,255,255,0.35)',
              }"
            >
              {{ opt.option }}
            </label>
            <el-button
              class="opt-btn"
              :aria-pressed="idx === modelValue"
              :style="{
                backgroundColor: idx === modelValue ? '#eeec52' : '#949494',
                borderColor: idx === modelValue ? '#eeec52' : '#949494',
              }"
              @click="onClick(idx)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

/** i18n léger */
const messages: Record<string, Record<string, string>> = {
  "zh-CN": { PollingRate: "报告率" },
  fr: { PollingRate: "Taux de polling" },
  en: { PollingRate: "Polling rate" },
};
const lang =
  (localStorage.getItem("scyrox_lang") as "zh-CN" | "fr" | "en") || "zh-CN";
const t = (k: string) => messages[lang]?.[k] ?? k;

/** Props / v-model */
interface RateOpt {
  option: string;
  value?: number;
}
const props = defineProps<{
  /** index sélectionné */
  modelValue: number;
  /** liste d'options affichées (ex: [{ option: '125Hz' }, { option: '250Hz' }, ...]) */
  rates: RateOpt[];
}>();
const emit = defineEmits<{
  (e: "update:modelValue", idx: number): void;
  /** Emis quand un choix est cliqué (idx, option) */
  (e: "select", idx: number, opt: RateOpt): void;
}>();

function onClick(idx: number) {
  emit("update:modelValue", idx);
  emit("select", idx, props.rates[idx]);
}
</script>

<style scoped>
.report-rate {
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
.col {
  display: flex;
  flex-direction: column;
}
.slider_runway {
  width: 500px;
  height: 2px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.15),
    rgba(255, 255, 255, 0.35)
  );
  border-radius: 1px;
}
.options {
  position: relative;
  display: flex;
  flex-direction: row;
  width: 500px;
  justify-content: space-around;
  margin-top: 6px;
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
.label {
  text-align: left;
}
</style>
