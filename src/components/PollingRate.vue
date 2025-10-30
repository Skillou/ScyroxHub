<template>
  <div class="polling-card bubble">
    <div class="card-title">
      <i class="el-icon-time"></i>
      <span>{{ t("PollingRate") }}</span>
      <div class="ml-auto hint">{{ t("PollingHint") }}</div>
    </div>

    <div class="polling-body">
      <el-select
        v-model="localRate"
        size="small"
        placeholder="125 Hz – 8000 Hz"
        class="polling-select"
        @change="handleRateChange"
      >
        <el-option
          v-for="r in availableRates"
          :key="r"
          :label="r + ' Hz'"
          :value="r"
        />
      </el-select>

      <div class="micro">⚡ {{ t("CurrentPolling") }}: {{ localRate }} Hz</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from "vue";
import HIDHandle from "./HIDHandle";

/* -------- i18n simplifié -------- */
const messages = {
  fr: {
    PollingRate: "Taux de rapport",
    PollingHint: "Fréquence d'envoi des données",
    CurrentPolling: "Taux actuel",
  },
  en: {
    PollingRate: "Polling Rate",
    PollingHint: "Mouse report frequency",
    CurrentPolling: "Current rate",
  },
};
const lang = (localStorage.getItem("scyrox_lang") as "fr" | "en") || "fr";
const t = (k: string) => messages[lang][k] ?? k;

/* -------- Props & Emits -------- */
const props = defineProps<{ initialRate?: number }>();
const emit = defineEmits(["update:rate", "change"]);

const availableRates = [125, 250, 500, 1000, 2000, 4000, 8000];
const localRate = ref(props.initialRate ?? 1000);

/* -------- Logic HID -------- */
async function loadRateFromDevice() {
  try {
    // Si ton HID expose un getter direct :
    if (typeof (HIDHandle as any).getReportRate === "function") {
      const val = await (HIDHandle as any).getReportRate();
      if (val) localRate.value = val;
      return;
    }

    // Sinon, recharge depuis mouseCfg
    const cfg: any = (HIDHandle as any).mouseCfg;
    if (cfg?.reportRate) {
      localRate.value = cfg.reportRate;
      emit("update:rate", localRate.value);
    }
  } catch (e) {
    console.warn("[PollingRate] getRate failed:", e);
  }
}

async function handleRateChange(val: number) {
  try {
    await (HIDHandle as any).setReportRate?.(val);
    emit("update:rate", val);
    emit("change", val);
  } catch (e) {
    console.error("[PollingRate] setRate failed:", e);
  }
}

onMounted(() => {
  loadRateFromDevice();

  // Se relancer si le device HID se reconnecte
  window.addEventListener("scyrox-hid-ready", loadRateFromDevice);
});

onUnmounted(() => {
  window.removeEventListener("scyrox-hid-ready", loadRateFromDevice);
});

watch(
  () => props.initialRate,
  (v) => (localRate.value = v ?? 1000)
);
</script>

<style scoped>
:root {
  --accent: #dafe22;
  --accent-12: rgba(218, 254, 34, 0.12);
  --panel: rgba(255, 255, 255, 0.04);
  --panel-2: rgba(255, 255, 255, 0.02);
}

/* ---- Bubble style ---- */
.bubble {
  border-radius: 16px;
  padding: 16px;
  background: radial-gradient(
      900px 420px at 10% -20%,
      var(--accent-12),
      transparent
    ),
    linear-gradient(180deg, var(--panel), var(--panel-2));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.polling-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  margin-bottom: 6px;
}
.ml-auto {
  margin-left: auto;
}
.hint {
  font-size: 12px;
  opacity: 0.7;
}

.polling-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.polling-select {
  width: 180px;
}
.micro {
  font-size: 12px;
  opacity: 0.7;
}
</style>
