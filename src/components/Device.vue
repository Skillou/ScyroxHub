<template>
  <div class="device-page">
    <!-- Top bar: language, home/setting, status -->
    <header class="topbar">
      <div class="left">
        <el-select
          v-model="language"
          class="lang"
          size="small"
          @change="onLangChange"
        >
          <el-option
            v-for="l in languages"
            :key="l.value"
            :value="l.value"
            :label="l.text"
          />
        </el-select>
      </div>
      <div class="center">
        <h1 class="title">{{ t("WebDrive") }}</h1>
        <p class="subtitle">{{ t("Subtitle") }}</p>
      </div>
      <div class="right">
        <el-button
          class="iconfont icon-HomePair"
          type="text"
          @click="emit('home-click')"
        />
        <el-button
          icon="el-icon-setting"
          type="text"
          @click="emit('setting-click')"
        />
      </div>
    </header>

    <!-- Connection & battery card -->
    <section class="status">
      <div class="status-item">
        <span>{{ t("Connection") }}:</span>
        <el-tag :type="hidState.connected ? 'success' : 'danger'">
          {{ hidState.connected ? t("Connected") : t("Disconnected") }}
        </el-tag>
        <el-button
          v-if="!hidState.connected"
          size="mini"
          @click="requestPair"
          >{{ t("Connect") }}</el-button
        >
      </div>
      <div class="status-item">
        <span>{{ t("Battery") }}:</span>
        <el-progress
          :percentage="batteryDisplay"
          :show-text="false"
          style="width: 160px"
        />
        <span class="ml8">{{ batteryDisplay }}%</span>
        <i v-if="battery.charging" class="el-icon-lightning" />
      </div>
      <div class="status-item">
        <span>{{ t("Profile") }}:</span>
        <el-select v-model="profile" size="small" @change="onProfileChange">
          <el-option
            v-for="i in 3"
            :key="i"
            :label="`${t('Profile')} ${i - 1}`"
            :value="i - 1"
          />
        </el-select>
      </div>
      <div class="status-item">
        <span>{{ t("VersionDongle") }}: {{ versions.dongle }}</span>
        <span class="ml8">{{ t("VersionDevice") }}: {{ versions.device }}</span>
      </div>
    </section>

    <!-- Layout: left column options, right image/cascaders -->
    <main class="grid">
      <div class="col left">
        <!-- Polling rate -->
        <CommonReportRate
          v-model="reportIdx"
          :rates="reportRates"
          @select="(_, opt) => onReportRate(opt)"
        />

        <!-- DPI settings -->
        <DpiSetting
          v-model:dpiValue="dpiValue"
          :values="dpiSlots"
          :currentIndex="currentDpiIndex"
          :dpiMaxCount="dpiCount"
          @change="onDpiSlider"
          @update:currentIndex="
            (i) => {
              currentDpiIndex = i;
              hid.setCurrentDPI(i);
            }
          "
          @slot-edit="(i, v) => hid.setDPIValue(i, v)"
        />

        <!-- Sensor block -->
        <CommonSensor
          :lods="lodOptions"
          :sleepTimes="sleepOptions"
          :modelLod="lodIdx"
          :modelSleep="sleepIdx"
          :ripple="sensor.ripple"
          :angle="sensor.angle"
          :longDistance="longDistance"
          :longDistanceShow="supportLongDistance"
          :sensor20K="sensor.sensor20K"
          :disableSensor20K="hidState.isWired"
          :longDistanceTips="t('LongDistanceTips')"
          :dialogSensor20K="t('Sensor20KDialog')"
          :sensor20kTips="t('Sensor20KTips')"
          @lod-select="(_, opt) => onLodSelect(opt)"
          @sleep-select="(_, opt) => onSleepSelect(opt)"
          @update:ripple="(v) => hid.setRipple(v ? 1 : 0)"
          @update:angle="(v) => hid.setFixLine(v ? 1 : 0)"
          @longDistance-confirm="
            () => hid.setLongDistance(longDistance ? 1 : 0)
          "
          @sensor20K-confirm="() => hid.setSensor20K(sensor.sensor20K ? 1 : 0)"
        />

        <!-- Debounce & pairing & restore -->
        <CommonDebounce
          :motionSync="sensor.motionSync"
          :performance="sensor.performance"
          :performanceText="sensor.performance ? t('BoostOn') : t('BoostOff')"
          :debounceTime="debounceTime"
          :pairText="t('PairText')"
          :startPair="t('StartPair')"
          :pairDialogVisible="pairDialog"
          :dialogVisible="restoreDialog"
          :dialogText="t('RestoreDialog')"
          :dialogButton="true"
          @update:motionSync="(v) => hid.setMotionSync(v ? 1 : 0)"
          @update:performance="(v) => hid.setPerformanceState(v ? 1 : 0)"
          @update:debounceTime="
            (v) => {
              debounceTime = v;
              hid.setDebounceTime(v);
            }
          "
          @pair-open="
            () => {
              pairDialog = true;
            }
          "
          @pair-start="() => hid.enterPairMode(0, 0)"
          @pair-cancel="
            () => {
              pairDialog = false;
            }
          "
          @restore-click="() => hid.setDeviceRestore()"
        />
      </div>

      <!-- Right column: mouse image with cascaders for keys -->
      <div class="col right">
        <CommonMouse
          :loadFinish="true"
          :mouseImageStyle="mouseImageStyle"
          :locs="keyLocs"
          :keyOptions="keyOptions"
          :keys="keys"
          :currentIndex="currentKeyIndex"
          @select-change="onKeySelect"
          @span-click="onKeySpanClick"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from "vue";
import CommonReportRate from "@/components/CommonReportRate.vue";
import DpiSetting from "./DpiSetting.vue";
import CommonDebounce from "@/components/CommonDebounce.vue";
import CommonMouse from "@/components/CommonMouse.vue";
import HIDHandle from "@/components/HIDHandle";
import BatteryHandle from "@/components/BatteryHandle";

/** Emits vers App.vue */
const emit = defineEmits<{
  (e: "home-click"): void;
  (e: "setting-click"): void;
}>();

/** i18n light */
const messages: Record<string, Record<string, string>> = {
  "zh-CN": {
    WebDrive: "Scyrox Web Drive",
    Subtitle: "个性化定制你的设备",
    Connection: "连接",
    Connected: "在线",
    Disconnected: "离线",
    Connect: "连接",
    Battery: "电量",
    Profile: "配置",
    VersionDongle: "接收器版本",
    VersionDevice: "设备版本",
    LongDistanceTips: "开启远距离模式会增加功耗",
    Sensor20KDialog: "切换20K会重启传感器",
    Sensor20KTips: "部分设备不支持",
    BoostOn: "火力全开",
    BoostOff: "标准模式",
    PairText: "准备配对，按下接收器按钮…",
    StartPair: "开始配对",
    RestoreDialog: "恢复出厂设置将清空当前配置",
  },
  fr: {
    WebDrive: "Scyrox Web Drive",
    Subtitle: "Personnalisez votre appareil",
    Connection: "Connexion",
    Connected: "Connecté",
    Disconnected: "Hors ligne",
    Connect: "Connecter",
    Battery: "Batterie",
    Profile: "Profil",
    VersionDongle: "Version dongle",
    VersionDevice: "Version souris",
    LongDistanceTips: "Le mode longue portée augmente la consommation",
    Sensor20KDialog: "Le basculement 20K redémarre le capteur",
    Sensor20KTips: "Non supporté sur certains modèles",
    BoostOn: "Boost activé",
    BoostOff: "Boost désactivé",
    PairText: "Prêt à appairer, appuyez sur le dongle…",
    StartPair: "Démarrer",
    RestoreDialog: "La restauration efface la config",
  },
  en: {
    WebDrive: "Scyrox Web Drive",
    Subtitle: "Personalize your device",
    Connection: "Connection",
    Connected: "Online",
    Disconnected: "Offline",
    Connect: "Connect",
    Battery: "Battery",
    Profile: "Profile",
    VersionDongle: "Dongle ver.",
    VersionDevice: "Device ver.",
    LongDistanceTips: "Long-range increases power usage",
    Sensor20KDialog: "Switching 20K restarts sensor",
    Sensor20KTips: "Unsupported on some models",
    BoostOn: "Boost On",
    BoostOff: "Boost Off",
    PairText: "Ready to pair. Press the dongle button…",
    StartPair: "Start",
    RestoreDialog: "Factory reset will wipe settings",
  },
};
const language = ref(
  (localStorage.getItem("scyrox_lang") as "zh-CN" | "fr" | "en") || "zh-CN"
);
const t = (k: string) => messages[language.value]?.[k] ?? k;
const languages = [
  { value: "zh-CN", text: "中文" },
  { value: "fr", text: "Français" },
  { value: "en", text: "English" },
];
function onLangChange(v: string) {
  localStorage.setItem("scyrox_lang", v);
}

/** HID/state (simplifié; adapte à ton store) */
const hid = HIDHandle; // si export default { … } de ton module actuel
const hidState = reactive({ connected: false, isWired: false });
const versions = reactive({ dongle: "v0.0", device: "v0.0" });
const profile = ref(0);

// état batterie pour le template (charging %)
const battery = reactive({ level: 20, charging: false, voltage: 0 });

// affichage lissé via le module BatteryHandle
const batteryDisplay = computed(() => BatteryHandle.getDisplayLevel());

onMounted(async () => {
  try {
    await (hid as any).reconnect?.();
    hidState.connected = true;
    versions.dongle =
      (hid as any).deviceInfo?.version?.dongle ?? versions.dongle;
    versions.device =
      (hid as any).deviceInfo?.version?.device ?? versions.device;

    // initialise le smoothing batterie
    const addr = (hid as any).deviceInfo?.addr ?? [0, 0, 0];
    const batInfo = (hid as any).deviceInfo?.battery ?? battery;
    BatteryHandle.batteryHandleInit(addr, batInfo);
  } catch {
    hidState.connected = false;
  }
});

function requestPair() {
  // Ouvre le sélecteur HID puis tente la connexion
  (hid as any)
    .requestDevice?.([])
    .then(() => (hid as any).connect?.())
    .catch(() => {});
}

function onProfileChange(v: number) {
  profile.value = v;
  (hid as any).setProfile?.(v);
}

// Report rate options
const reportRates = [
  { option: "125Hz" },
  { option: "250Hz" },
  { option: "500Hz" },
  { option: "1000Hz" },
  { option: "2000Hz" },
  { option: "4000Hz" },
  { option: "8000Hz" },
];
const reportIdx = ref(3);
function onReportRate(opt: { option: string }) {
  const hz = parseInt(opt.option);
  (hid as any).setReportRate?.(hz);
}

// DPI
const dpiSlots = ref([400, 800, 1600, 3200, 6200, 8000, 12000, 16000]);
const dpiValue = ref(800);
const currentDpiIndex = ref(1);
const dpiCount = ref(4);
function onDpiSlider(v: number) {
  (hid as any).setDPIValue?.(currentDpiIndex.value, v);
}

// Sensor
const sensor = reactive({
  ripple: false,
  angle: false,
  motionSync: false,
  performance: false,
  sensor20K: false,
});
const debounceTime = ref(8);
const longDistance = ref(false);
const supportLongDistance = computed(() => !hidState.isWired);
const lodOptions = [{ option: "Low" }, { option: "Mid" }, { option: "High" }];
const sleepOptions = [
  { option: "1m" },
  { option: "3m" },
  { option: "5m" },
  { option: "10m" },
];
const lodIdx = ref(0);
const sleepIdx = ref(1);
function onLodSelect(opt: any) {
  const map = { Low: 1, Mid: 2, High: 3 };
  (hid as any).setLOD?.(map[opt.option] ?? 1);
}
function onSleepSelect(opt: any) {
  const map: any = { "1m": 1, "3m": 3, "5m": 5, "10m": 10 };
  (hid as any).setPerformanceTime?.(map[opt.option] ?? 3);
}

// Pair/restore dialogs
const pairDialog = ref(false);
const restoreDialog = ref(false);

// Mouse image + cascaders (positions factices à remplacer)
const mouseImageStyle = {
  backgroundImage: "url(/img/mouse.png)",
  width: "520px",
  height: "380px",
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
};
const keyLocs = ref<Array<{ top: string; left: string }>>([
  { top: "40px", left: "200px" }, // LMB
  { top: "40px", left: "300px" }, // RMB
  { top: "100px", left: "250px" }, // scroll
  { top: "140px", left: "360px" }, // side1
  { top: "170px", left: "360px" }, // side2
]);
const keyOptions = ref<any[]>([]); // -> alimente via HIDKey
const keys = ref<any[]>([]);
const currentKeyIndex = ref(-1);
function onKeySelect(index: number, value: any) {
  currentKeyIndex.value = index;
  /* encode via HIDKey puis */ (hid as any).setKeyFunction?.(index, value);
}
function onKeySpanClick() {
  /* open cascader/extra menu if needed */
}

onMounted(async () => {
  try {
    await (hid as any).reconnect?.();
    hidState.connected = true;

    versions.dongle =
      (hid as any).deviceInfo?.version?.dongle ?? versions.dongle;
    versions.device =
      (hid as any).deviceInfo?.version?.device ?? versions.device;

    // Init battery smoothing
    const addr = (hid as any).deviceInfo?.addr ?? [0, 0, 0];
    const batInfo = (hid as any).deviceInfo?.battery ?? battery;
    BatteryHandle.batteryHandleInit(addr, batInfo); // <-- ici (pas bat.init)
  } catch {
    hidState.connected = false;
  }
});
</script>

<style scoped>
.device-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}
.topbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}
.topbar .left {
  justify-self: start;
}
.topbar .center {
  justify-self: center;
  text-align: center;
}
.topbar .right {
  justify-self: end;
  display: flex;
  gap: 6px;
}
.title {
  margin: 0;
}
.subtitle {
  margin: 0;
  opacity: 0.7;
  font-size: 12px;
}
.lang {
  width: 140px;
}

.status {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 12px;
  align-items: center;
}
.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ml8 {
  margin-left: 8px;
}

.grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
  align-items: start;
}
.col.left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.col.right {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
</style>
