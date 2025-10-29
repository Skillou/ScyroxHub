<template>
  <div class="page">
    <!-- App Bar -->
    <header class="appbar glass">
      <div class="left">
        <el-button class="round ghost" :icon="Back" @click="router.back()" />
      </div>
      <div class="center">
        <h1 class="brand">Scyrox</h1>
        <p class="subtitle">{{ t("Personalize") }}</p>
      </div>
      <div class="right">
        <el-select
          v-model="language"
          size="small"
          class="lang"
          @change="onLangChange"
        >
          <el-option
            v-for="l in languages"
            :key="l.value"
            :label="l.text"
            :value="l.value"
          />
        </el-select>
      </div>
    </header>

    <!-- Status Cards -->
    <section class="grid cards">
      <div class="card stat">
        <div class="card-title">
          <i class="el-icon-connection"></i>
          <span>{{ t("Connection") }}</span>
          <el-tag
            :type="connected ? 'success' : 'danger'"
            size="small"
            class="ml-8"
          >
            {{ connected ? t("Connected") : t("Disconnected") }}
          </el-tag>
          <el-button
            v-if="!connected"
            class="ml-auto"
            size="small"
            type="primary"
            @click="reconnectNow"
          >
            {{ t("Connect") }}
          </el-button>
        </div>
        <div class="row-wrap">
          <div class="kv">
            <span class="k">{{ t("VersionDongle") }}</span>
            <span class="v">{{ versions.dongle || "—" }}</span>
          </div>
          <div class="kv">
            <span class="k">{{ t("VersionDevice") }}</span>
            <span class="v">{{ versions.device || "—" }}</span>
          </div>
          <div class="kv">
            <span class="k">{{ t("Profile") }}</span>
            <el-select
              v-model="profile"
              size="small"
              class="w-120"
              @change="(v:number)=>HIDHandle.setProfile?.(v)"
            >
              <el-option
                v-for="i in 3"
                :key="i"
                :label="`${t('Profile')} ${i - 1}`"
                :value="i - 1"
              />
            </el-select>
          </div>
          <div class="battery">
            <div class="b-head">
              <span>{{ t("Battery") }}</span>
              <i v-if="battery.charging" class="el-icon-lightning"></i>
            </div>
            <div class="b-bar">
              <div class="b-fill" :style="{ width: batteryLevel + '%' }"></div>
              <div class="b-text">{{ batteryLevel }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- DPI Card -->
      <div class="card dpi">
        <div class="card-title">
          <i class="el-icon-aim"></i>
          <span>{{ t("DPISetting") }}</span>
          <el-tag v-if="!dpiReady" type="warning" size="small" class="ml-8">
            {{ t("PlugToEdit") }}
          </el-tag>
          <div class="ml-auto hint">{{ t("DpiHint") }}</div>
        </div>

        <DpiSetting
          v-if="true"
          :dpi-value="dpiValue"
          :values="dpiValues"
          :current-index="currentDpiIndex"
          :dpi-max-count="dpiMaxCount"
          :min="dpiMin"
          :max="dpiMax"
          :step="dpiStep"
          @update:dpiValue="onUpdateDpiValue"
          @update:values="onUpdateDpiValues"
          @update:currentIndex="onUpdateCurrentIndex"
          @update:dpiMaxCount="onUpdateDpiMaxCount"
          @change="onDpiChange"
        />

        <div v-if="!dpiReady" class="warning">
          {{ t("ConnectToChangeDpi") }}
          <div class="micro">
            debug: ready={{ dpiReady }} | values={{ dpiValues.join(", ") }}
          </div>
        </div>
      </div>
    </section>

    <!-- Footer actions -->
    <footer class="footer">
      <el-button class="ghost" @click="router.push('/device')">
        <i class="el-icon-s-operation mr-6"></i> {{ t("OpenDeviceHub") }}
      </el-button>
      <div class="spacer"></div>
      <el-button class="ghost" @click="openUpdateDialog('dongle')">
        <i class="el-icon-refresh mr-6"></i> {{ t("UpdateNow") }}
      </el-button>
    </footer>

    <!-- Update dialog (placeholder UX) -->
    <el-dialog
      v-model="dialogVisible"
      :title="t('Prompt')"
      width="420px"
      :close-on-click-modal="false"
    >
      <span>{{ dialogText }}</span>
      <template #footer>
        <el-button size="small" @click="dialogVisible = false">{{
          t("Cancel")
        }}</el-button>
        <el-button size="small" type="primary" @click="simulateUpdate">{{
          t("StartUpdate")
        }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Back } from "@element-plus/icons-vue";
import DpiSetting from "./DpiSetting.vue";
import HIDHandle from "./HIDHandle";
// (optionnel) import BatteryHandle si tu veux le lissage ; sinon lecture directe
// import BatteryHandle from "./BatteryHandle";

/* ---------------- i18n ---------------- */
const messages: Record<string, Record<string, string>> = {
  "zh-CN": {
    Personalize: "自定义你的设备",
    Connection: "连接",
    Connected: "在线",
    Disconnected: "离线",
    Connect: "连接",
    Battery: "电量",
    Profile: "配置",
    VersionDongle: "接收器版本",
    VersionDevice: "设备版本",
    DPISetting: "DPI设置",
    PlugToEdit: "插入并连接以编辑",
    DpiHint: "点击档位可切换，双击可编辑值",
    ConnectToChangeDpi: "连接兼容设备以修改 DPI。",
    OpenDeviceHub: "Ouvrir le hub",
    UpdateNow: "立即更新",
    Prompt: "提示",
    Cancel: "取 消",
    StartUpdate: "开始更新",
  },
  fr: {
    Personalize: "Personnalisez votre appareil",
    Connection: "Connexion",
    Connected: "Connecté",
    Disconnected: "Hors ligne",
    Connect: "Connecter",
    Battery: "Batterie",
    Profile: "Profil",
    VersionDongle: "Version dongle",
    VersionDevice: "Version souris",
    DPISetting: "Réglage DPI",
    PlugToEdit: "Branchez et connectez pour modifier",
    DpiHint: "Clique un slot pour basculer, double-clique pour éditer",
    ConnectToChangeDpi: "Connecte une souris compatible pour modifier le DPI.",
    OpenDeviceHub: "Ouvrir le hub",
    UpdateNow: "Mettre à jour",
    Prompt: "Alerte",
    Cancel: "Annuler",
    StartUpdate: "Démarrer",
  },
  en: {
    Personalize: "Personalize your device",
    Connection: "Connection",
    Connected: "Online",
    Disconnected: "Offline",
    Connect: "Connect",
    Battery: "Battery",
    Profile: "Profile",
    VersionDongle: "Dongle ver.",
    VersionDevice: "Device ver.",
    DPISetting: "DPI Settings",
    PlugToEdit: "Plug & connect to edit",
    DpiHint: "Click a slot to switch, double-click to edit",
    ConnectToChangeDpi: "Connect a compatible mouse to change DPI.",
    OpenDeviceHub: "Open hub",
    UpdateNow: "Update now",
    Prompt: "Prompt",
    Cancel: "Cancel",
    StartUpdate: "Start",
  },
};
type Lang = "zh-CN" | "fr" | "en";
const languages = [
  { value: "zh-CN", text: "中文 (简体)" },
  { value: "fr", text: "Français" },
  { value: "en", text: "English" },
] as const;

const router = useRouter();
const saved = (localStorage.getItem("scyrox_lang") as Lang) || "zh-CN";
const language = ref<Lang>(
  ["zh-CN", "fr", "en"].includes(saved) ? saved : "zh-CN"
);
const t = (k: string) => messages[language.value]?.[k] ?? k;
function onLangChange(v: Lang) {
  localStorage.setItem("scyrox_lang", v);
  window.dispatchEvent(new CustomEvent("scyrox-lang-changed", { detail: v }));
}

/* ---------------- HID / Device state ---------------- */
const connected = ref(false);
const versions = reactive({ dongle: "v0.0", device: "v0.0" });
const profile = ref(0);

const battery = reactive({ level: 0, charging: false, voltage: 0 });
const batteryLevel = computed(() => {
  // Si tu veux utiliser BatteryHandle (lissage), remplace par BatteryHandle.getDisplayLevel()
  return Math.max(0, Math.min(100, battery.level | 0));
});

async function ensureConnected() {
  try {
    if (!HIDHandle?.device || !HIDHandle.device.opened) {
      await HIDHandle.reconnect?.();
      if (!HIDHandle?.device || !HIDHandle.device.opened) {
        await HIDHandle.connect?.();
      }
    }
    connected.value = !!(HIDHandle?.device && HIDHandle.device.opened);
    if (connected.value) {
      // Récupère versions/batterie depuis deviceInfo si dispo
      const info: any = (HIDHandle as any).deviceInfo || {};
      versions.dongle = info.version?.dongle ?? versions.dongle;
      versions.device = info.version?.device ?? versions.device;
      const bat = info.battery ?? {};
      battery.level = bat.level ?? battery.level;
      battery.charging = !!bat.charging;
      battery.voltage = bat.voltage ?? battery.voltage;
      profile.value = info.profile ?? profile.value;
    }
  } catch (e) {
    connected.value = false;
  }
}
async function reconnectNow() {
  await ensureConnected();
}

/* ---------------- DPI state ----------------
   Basé sur ta structure réelle HIDHandle.mouseCfg:
   mouseCfg.dpis[i].value, mouseCfg.currentDpi (index), etc.
------------------------------------------------ */
const dpiReady = ref(false);
const dpiValues = ref<number[]>([
  400, 800, 1600, 3200, 6200, 8000, 12000, 16000,
]);
const dpiValue = ref(800);
const currentDpiIndex = ref(1);
const dpiMaxCount = ref(5);
const dpiMin = ref(100);
const dpiMax = ref(30000);
const dpiStep = ref(50);

function loadDpiFromMouseCfg() {
  try {
    const cfg: any = (HIDHandle as any).mouseCfg;
    if (!cfg) {
      dpiReady.value = false;
      return;
    }
    // dpis : [{value,color}, ...]
    if (Array.isArray(cfg.dpis) && cfg.dpis.length > 0) {
      const vals = cfg.dpis
        .map((d: any) => Number(d.value || 0))
        .filter((n: number) => n > 0);
      if (vals.length) dpiValues.value = vals;
      dpiMaxCount.value = vals.length;
    }
    // currentDpi : index (0..7)
    if (typeof cfg.currentDpi === "number") {
      currentDpiIndex.value = cfg.currentDpi;
      dpiValue.value =
        dpiValues.value[cfg.currentDpi] ?? dpiValues.value[0] ?? 800;
    } else {
      dpiValue.value = dpiValues.value[0] ?? 800;
      currentDpiIndex.value = 0;
    }
    // plages si tu les as (sinon garde defaults)
    // (ta version de HIDHandle ne semble pas exposer DPIRange)
    dpiMin.value = 100;
    dpiMax.value = 30000;
    dpiStep.value = 50;

    dpiReady.value = true;
  } catch (e) {
    console.warn("[Settings] loadDpiFromMouseCfg error:", e);
    dpiReady.value = false;
  }
}

onMounted(async () => {
  await ensureConnected();
  loadDpiFromMouseCfg();

  // Si HID devient prêt plus tard (après Home), on rafraîchit
  window.addEventListener("scyrox-hid-ready", () => {
    ensureConnected().then(loadDpiFromMouseCfg);
  });
});

/* --------- Handlers remontés par DpiSetting --------- */
async function onUpdateDpiValue(val: number) {
  dpiValue.value = val;
  if (!connected.value) await ensureConnected();
  try {
    await (HIDHandle as any).setDPIValue?.(currentDpiIndex.value, val);
    await (HIDHandle as any).setCurrentDPI?.(currentDpiIndex.value);
  } catch (e) {
    console.warn("[Settings] setDPIValue/setCurrentDPI failed:", e);
  } finally {
    // petite resync
    setTimeout(loadDpiFromMouseCfg, 200);
  }
}
async function onUpdateDpiValues(vals: number[]) {
  dpiValues.value = vals.slice(0);
  // Certaines versions ont setAllDPIValues; si pas dispo, on fait au cas par cas
  if (!connected.value) await ensureConnected();
  try {
    if (typeof (HIDHandle as any).setAllDPIValues === "function") {
      await (HIDHandle as any).setAllDPIValues(vals);
    } else {
      for (let i = 0; i < vals.length; i++) {
        await (HIDHandle as any).setDPIValue?.(i, vals[i]);
      }
    }
  } catch (e) {
    console.warn("[Settings] setAllDPIValues fallback failed:", e);
  } finally {
    setTimeout(loadDpiFromMouseCfg, 300);
  }
}
function onUpdateCurrentIndex(idx: number) {
  currentDpiIndex.value = idx;
  dpiValue.value = dpiValues.value[idx] ?? dpiValue.value;
}
function onUpdateDpiMaxCount(count: number) {
  dpiMaxCount.value = Math.max(1, Math.min(8, Number(count) || 1));
  // Si tu as une API pour limiter le nombre de profils DPI, appelle-la ici (optionnel)
  (HIDHandle as any).setDPIProfileCount?.(dpiMaxCount.value);
}
function onDpiChange(_val: number) {
  /* Optionnel : action live sur slider change */
}

/* --------- Update placeholder --------- */
const dialogVisible = ref(false);
const dialogText = ref("Firmware updater (placeholder).");
function openUpdateDialog(_target: "dongle" | "mouse") {
  dialogVisible.value = true;
}
async function simulateUpdate() {
  dialogVisible.value = false;
  // ici déclenche ton vrai process DFU/HID si nécessaire
}
</script>

<style scoped>
/* Layout */
.page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 18px clamp(12px, 3vw, 28px);
}

/* App Bar */
.appbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 12px clamp(10px, 2vw, 20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.appbar .left {
  justify-self: start;
}
.appbar .center {
  justify-self: center;
  text-align: center;
}
.appbar .right {
  justify-self: end;
}
.brand {
  margin: 0;
  letter-spacing: 0.5px;
  font-weight: 800;
  font-size: 22px;
}
.subtitle {
  margin: 0;
  opacity: 0.7;
  font-size: 12px;
}
.lang {
  width: 140px;
}
.round.ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
}

/* Glass effect */
.glass {
  background: radial-gradient(
      1200px 600px at 10% -40%,
      rgba(120, 120, 255, 0.16),
      transparent
    ),
    radial-gradient(
      800px 500px at 100% 0%,
      rgba(0, 180, 255, 0.12),
      transparent
    ),
    rgba(20, 20, 24, 0.65);
  backdrop-filter: blur(10px);
}

/* Cards grid */
.grid.cards {
  display: grid;
  gap: 16px;
  grid-template-columns: 1.05fr 1fr;
}
.card {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: clamp(14px, 2.4vw, 20px);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.04),
    rgba(255, 255, 255, 0.02)
  );
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}
.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  margin-bottom: 12px;
}
.ml-8 {
  margin-left: 8px;
}
.ml-auto {
  margin-left: auto;
}
.w-120 {
  width: 120px;
}
.hint {
  opacity: 0.6;
  font-size: 12px;
}

/* Status block */
.stat .row-wrap {
  display: grid;
  grid-template-columns: repeat(2, minmax(200px, 1fr));
  gap: 12px 18px;
  align-items: center;
}
.kv {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
}
.kv .k {
  opacity: 0.8;
}
.kv .v {
  font-weight: 600;
}

.battery {
  grid-column: 1 / -1;
  margin-top: 6px;
}
.b-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.b-bar {
  position: relative;
  height: 14px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.06)
  );
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.b-fill {
  height: 100%;
  background: linear-gradient(90deg, #40e0ff, #6a8bff, #9c6aff);
  filter: saturate(1.1);
  transition: width 0.25s ease;
}
.b-text {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

/* DPI card */
.dpi .warning {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 204, 0, 0.08);
  border: 1px solid rgba(255, 204, 0, 0.2);
}
.micro {
  opacity: 0.6;
  font-size: 12px;
  margin-top: 6px;
}

/* Footer */
.footer {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 2px;
}
.footer .ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
}
.spacer {
  flex: 1;
}
.mr-6 {
  margin-right: 6px;
}

/* Responsive */
@media (max-width: 980px) {
  .grid.cards {
    grid-template-columns: 1fr;
  }
}
</style>
