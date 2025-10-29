<template>
  <div class="page">
    <!-- Top bar -->
    <div class="topbar">
      <div class="spacer" />
      <select
        v-model="selectLan"
        class="lanSelect"
        @change="lanChange"
        :aria-label="t('SelectLanguage')"
      >
        <option v-for="item in languages" :key="item.value" :value="item.value">
          {{ item.text }}
        </option>
      </select>
      <el-button
        class="iconfont icon-HomePair pairBtn"
        @click="handlePairClick"
        :aria-label="t('PairDevice')"
      />
    </div>

    <!-- Main -->
    <div class="main">
      <div class="welcomeBlock">
        <p class="welcome" :aria-label="t('Welcome')">{{ t("Welcome") }}</p>
        <p class="lead" :aria-label="t('SelectDevice')">
          {{ t("SelectDevice") }}
        </p>
        <h2 v-if="!isSupportHID" class="nohid" :aria-label="t('NoSupportHID')">
          {{ t("NoSupportHID") }}
        </h2>
      </div>

      <div class="devices">
        <div v-for="(image, index) in devicesPaths" :key="index" class="device">
          <img
            :src="image"
            loading="lazy"
            @click="connectDevice(index)"
            :alt="`device-${index}`"
          />
        </div>
      </div>
    </div>

    <!-- Pair dialog -->
    <el-dialog
      v-model="pairDialogVisible"
      width="30%"
      :close-on-click-modal="false"
      @close="handlePairClose"
    >
      <span class="dialogText">{{ pairText }}</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button size="small" @click="handleCancelClick">
            {{ t("Cancel") }}
          </el-button>
          <el-button
            size="small"
            type="primary"
            @mouseenter="handleStartPairMouseEnter"
            @click="handleStartPairClick"
          >
            {{ startPair }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import HIDHandle from "./HIDHandle"; // ✅ on passe par HIDHandle

/** ---------------- i18n léger ---------------- */
const messages: Record<string, Record<string, string>> = {
  "zh-CN": {
    Welcome: "欢迎使用Scyrox Web Drive",
    SelectDevice:
      "在这里您可以迅速配置您的Scyrox设备，尝试一些与众不同的设定，并按您的喜好个性化定制您的设备。完成配置后，后台无需常驻，只需保存、关闭并享受。",
    NoSupportHID:
      "当前浏览器不支持连接设备，我们推荐您使用 Chrome、Edge 或 Opera 浏览器。",
    Cancel: "取 消",
    PairDevice: "开始配对",
    SelectLanguage: "选择语言",
  },
  en: {
    Welcome: "Welcome to Scyrox Web Drive",
    SelectDevice:
      "Here you can quickly configure your Scyrox device, try unique settings, and personalize it to your taste. Once done, simply save, close, and enjoy—no need to keep this page open.",
    NoSupportHID:
      "Your browser does not support device connections. Use Chrome, Edge, or Opera.",
    Cancel: "Cancel",
    PairDevice: "Start pairing",
    SelectLanguage: "Select language",
  },
  fr: {
    Welcome: "Bienvenue sur Scyrox Web Drive",
    SelectDevice:
      "Ici, vous pouvez configurer rapidement votre appareil Scyrox, tester des réglages originaux et le personnaliser. Une fois terminé : enregistrez, fermez et profitez.",
    NoSupportHID:
      "Votre navigateur ne supporte pas la connexion HID. Nous recommandons Chrome, Edge ou Opera.",
    Cancel: "Annuler",
    PairDevice: "Démarrer l'appairage",
    SelectLanguage: "Choisir la langue",
  },
};

const languages = [
  { value: "zh-CN", text: "中文 (简体)" },
  { value: "en", text: "English" },
  { value: "fr", text: "Français" },
] as const;

type Lang = "zh-CN" | "en" | "fr";
const isLang = (v: any): v is Lang => ["zh-CN", "en", "fr"].includes(v);

const savedLang = localStorage.getItem("scyrox_lang");
const selectLan = ref<Lang>(isLang(savedLang) ? (savedLang as Lang) : "zh-CN");
const t = (key: string) => messages[selectLan.value]?.[key] ?? key;

function lanChange() {
  localStorage.setItem("scyrox_lang", selectLan.value);
  window.dispatchEvent(
    new CustomEvent("scyrox-lang-changed", { detail: selectLan.value })
  );
}

/** ---------------- UI state ---------------- */
const router = useRouter();
const pairDialogVisible = ref(false);
const pairText = ref("");
const startPair = ref(t("PairDevice"));
const isSupportHID = ref(true);
const devicesPaths = ref<string[]>([
  "/assets/devices/mouse-a.png",
  "/assets/devices/mouse-b.png",
  "/assets/devices/mouse-c.png",
]);

/** ---------------- Filtre Scyrox ----------------
 * Mets ici les VID/PID de tes produits Scyrox (en décimal).
 */
const SCYROX_VENDOR_IDS = new Set<number>([
  13652, // 0x3554 (exemple)
]);
const SCYROX_PRODUCT_IDS = new Set<number>([
  62967, // 0xF5D7
  62964, // 0xF5D4
  62966, // 0xF5D6
]);

/** reportId attendu (comme dans l’app originale) */
const SCYROX_REPORT_ID = 0x08;

/** Garde-fou runtime pour ne garder que les vrais devices Scyrox */
function isScyroxDevice(dev: any): boolean {
  const byIds =
    SCYROX_VENDOR_IDS.has(dev.vendorId) &&
    SCYROX_PRODUCT_IDS.has(dev.productId);

  const hasExpectedReport = dev.collections?.some((c: any) =>
    c.outputReports?.some((r: any) => r.reportId === SCYROX_REPORT_ID)
  );

  const byName = (dev.productName || "").toLowerCase().includes("scyrox");

  // On est strict: VID/PID OU (reportId+nom)
  return byIds || (hasExpectedReport && byName);
}

/** ---------------- Connexion via HIDHandle ---------------- */
async function connectDevice(index: number) {
  console.log("[Home] Click device index:", index);

  if (!("hid" in navigator)) {
    isSupportHID.value = false;
    pairText.value = t("NoSupportHID");
    pairDialogVisible.value = true;
    return;
  }

  try {
    pairText.value = `${t("PairDevice")}…`;
    pairDialogVisible.value = true;

    // 1) Filtres WebHID limités aux PID Scyrox
    const filters = Array.from(SCYROX_PRODUCT_IDS).map((pid) => ({
      vendorId: Array.from(SCYROX_VENDOR_IDS)[0],
      productId: pid,
    }));

    // 2) Demande de sélection + stockage du device dans HIDHandle
    const ok = await (HIDHandle as any).requestDevice(filters);
    if (!ok) {
      pairText.value = "Aucun appareil Scyrox sélectionné.";
      console.warn("[Home] No device selected.");
      return;
    }

    // 3) Connecte et sync les infos (installe oninputreport, etc.)
    await (HIDHandle as any).connect?.();

    pairDialogVisible.value = false;

    // Notifie les pages qui écoutent (Settings/Device)
    window.dispatchEvent(new Event("scyrox-hid-ready"));

    // 4) Redirection là où tu contrôles DPI etc.
    router.push("/settings"); // ou "/device" si tu veux la page hub
  } catch (err: any) {
    console.error("[Home] connectDevice error:", err);
    pairText.value = `Erreur: ${err?.message || err}`;
  }
}

/** Boutons/UX pairing */
function handlePairClick() {
  startPair.value = t("PairDevice");
  pairText.value = t("PairDevice");
  pairDialogVisible.value = true;
}
function handleStartPairClick() {
  connectDevice(0);
}
function handleStartPairMouseEnter() {}
function handlePairClose() {
  pairDialogVisible.value = false;
}
function handleCancelClick() {
  pairDialogVisible.value = false;
}

/** Auto-reconnect sur devices déjà autorisés, avec filtre Scyrox */
onMounted(async () => {
  isSupportHID.value = "hid" in navigator;

  try {
    const existing: any[] = (await (navigator as any).hid.getDevices?.()) || [];
    const scyroxExisting = existing.filter(isScyroxDevice);
    console.log("[Home] Already-authorized Scyrox devices:", scyroxExisting);

    // Option : auto-route si déjà autorisé
    // if (scyroxExisting.length > 0) router.push("/settings");
  } catch (e) {
    console.warn("[Home] getDevices failed:", e);
  }
});
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: 20px;
  gap: 20px;
}
.topbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
}
.spacer {
  flex: 1;
}
.lanSelect {
  margin-right: 12px;
  padding: 8px 12px;
  border-radius: 10px;
  background: #1f1f1f;
  color: #fff;
  border: 1px solid #333;
}
.pairBtn {
  background-color: transparent !important;
  border: 0 !important;
  color: white !important;
  font-size: 32px !important;
  padding: 12px 20px !important;
}
.main {
  display: flex;
  flex-direction: column;
  margin-top: 60px;
}
.welcomeBlock {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  text-align: center;
}
.welcome {
  font-size: 48px;
}
.lead {
  font-size: 18px;
  max-width: 1000px;
  margin: 40px 0 50px 0;
}
.nohid {
  color: #ffb4b4;
}
.devices {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;
  place-items: center;
}
.device img {
  width: 220px;
  max-width: 100%;
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}
.device img:hover {
  transform: translateY(-2px) scale(1.02);
}
.dialogText {
  color: white;
}
</style>
