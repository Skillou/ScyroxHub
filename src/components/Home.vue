<template>
  <div class="app-shell">
    <!-- 1. bandeau haut -->
    <div class="topline">
      <p class="topline-text">{{ t("Welcome") }} — {{ t("SelectDevice") }}</p>
      <div class="topline-actions">
        <select
          v-model="selectLan"
          class="lanSelect"
          @change="lanChange"
          :aria-label="t('SelectLanguage')"
        >
          <option
            v-for="item in languages"
            :key="item.value"
            :value="item.value"
          >
            {{ item.text }}
          </option>
        </select>
      </div>
    </div>

    <!-- 2. header -->
    <header class="main-header">
      <div class="brand">
        <span class="logo">Scyrox</span>
      </div>
      <nav class="nav">
        <button class="nav-item nav-active">Dashboard</button>
        <button class="nav-item">Devices</button>
        <button class="nav-item">Support</button>
      </nav>
      <div class="header-actions">
        <button
          class="round-btn"
          @click="handlePairClick"
          :title="t('PairDevice')"
        >
          ⚡
        </button>
        <button class="round-btn">🔍</button>
        <button class="round-btn">👤</button>
      </div>
      <button class="mobile-menu">☰</button>
    </header>

    <!-- 3. contenu -->
    <main class="main">
      <section class="hero">
        <p class="hero-pill">SCYROX CENTER</p>
        <h1 class="hero-title">{{ t("Welcome") }}</h1>
        <p class="hero-text">
          {{ t("SelectDevice") }}
        </p>
        <p v-if="!isSupportHID" class="hero-warning">
          {{ t("NoSupportHID") }}
        </p>
      </section>

      <section class="section">
        <div class="section-head">
          <h2 class="section-title">Your devices</h2>
          <p class="section-sub">Tap a device to start pairing.</p>
        </div>
        <div class="devices-grid">
          <article
            v-for="(image, index) in devicesPaths"
            :key="index"
            class="device-card"
            @click="connectDevice(index)"
          >
            <div class="device-img-wrap">
              <img :src="image" :alt="`device-${index}`" loading="lazy" />
            </div>
            <div class="device-info">
              <h3 class="device-name">Scyrox Mouse {{ index + 1 }}</h3>
              <p class="device-meta">Online • tap to configure</p>
            </div>
          </article>
          <!-- petite carte vide "add device" -->
          <article class="device-card ghost" @click="handlePairClick">
            <div class="ghost-dot">+</div>
            <p>Add a device</p>
          </article>
        </div>
      </section>
    </main>

    <!-- 4. footer -->
    <footer class="footer">
      <p>© {{ new Date().getFullYear() }} Scyrox Electronic Limited</p>
      <div class="footer-links">
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">Support</a>
      </div>
    </footer>

    <!-- 5. modal maison -->
    <transition name="fade">
      <div
        v-if="pairDialogVisible"
        class="modal-backdrop"
        @click.self="handlePairClose"
      >
        <div class="modal">
          <h2 class="modal-title">{{ t("PairDevice") }}</h2>
          <p class="modal-text">
            {{ pairText }}
          </p>
          <div class="modal-actions">
            <button class="btn ghost" @click="handleCancelClick">
              {{ t("Cancel") }}
            </button>
            <button class="btn primary" @click="handleStartPairClick">
              {{ startPair }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import HIDHandle from "./HIDHandle";

/* ---- i18n léger ---- */
const messages: Record<string, Record<string, string>> = {
  "zh-CN": {
    Welcome: "欢迎使用Scyrox Web Drive",
    SelectDevice:
      "在这里您可以迅速配置您的Scyrox设备，尝试一些与众不同的设定，并按您的喜好个性化定制您的设备。",
    NoSupportHID: "当前浏览器不支持连接设备。请使用 Chrome、Edge 或 Opera。",
    Cancel: "取 消",
    PairDevice: "开始配对",
    SelectLanguage: "选择语言",
  },
  en: {
    Welcome: "Welcome to Scyrox Web Drive",
    SelectDevice:
      "Here you can quickly configure your Scyrox device, try unique settings, and personalize it to your taste.",
    NoSupportHID: "Your browser does not support device connections.",
    Cancel: "Cancel",
    PairDevice: "Start pairing",
    SelectLanguage: "Select language",
  },
  fr: {
    Welcome: "Bienvenue sur Scyrox Web Drive",
    SelectDevice:
      "Ici, tu peux configurer rapidement ton appareil Scyrox, tester des réglages originaux et le personnaliser.",
    NoSupportHID:
      "Ton navigateur ne supporte pas la connexion HID. Utilise Chrome, Edge ou Opera.",
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
const selectLan = ref<Lang>(isLang(savedLang) ? (savedLang as Lang) : "fr");
const t = (key: string) => messages[selectLan.value]?.[key] ?? key;

function lanChange() {
  localStorage.setItem("scyrox_lang", selectLan.value);
  window.dispatchEvent(
    new CustomEvent("scyrox-lang-changed", { detail: selectLan.value })
  );
}

/* ---- UI state ---- */
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

/* ---- filtres HID ---- */
const SCYROX_VENDOR_IDS = new Set<number>([13652]);
const SCYROX_PRODUCT_IDS = new Set<number>([62967, 62964, 62966]);
const SCYROX_REPORT_ID = 0x08;

function isScyroxDevice(dev: any): boolean {
  const byIds =
    SCYROX_VENDOR_IDS.has(dev.vendorId) &&
    SCYROX_PRODUCT_IDS.has(dev.productId);
  const hasExpectedReport = dev.collections?.some((c: any) =>
    c.outputReports?.some((r: any) => r.reportId === SCYROX_REPORT_ID)
  );
  const byName = (dev.productName || "").toLowerCase().includes("scyrox");
  return byIds || (hasExpectedReport && byName);
}

async function connectDevice(index: number) {
  if (!("hid" in navigator)) {
    isSupportHID.value = false;
    pairText.value = t("NoSupportHID");
    pairDialogVisible.value = true;
    return;
  }

  try {
    pairText.value = `${t("PairDevice")}…`;
    pairDialogVisible.value = true;

    const filters = Array.from(SCYROX_PRODUCT_IDS).map((pid) => ({
      vendorId: Array.from(SCYROX_VENDOR_IDS)[0],
      productId: pid,
    }));

    const ok = await (HIDHandle as any).requestDevice(filters);
    if (!ok) {
      pairText.value = "No Scyrox device selected.";
      return;
    }

    await (HIDHandle as any).connect?.();
    pairDialogVisible.value = false;
    window.dispatchEvent(new Event("scyrox-hid-ready"));
    router.push("/settings");
  } catch (err: any) {
    pairText.value = `Erreur: ${err?.message || err}`;
  }
}

/* ---- actions modal ---- */
function handlePairClick() {
  startPair.value = t("PairDevice");
  pairText.value = t("PairDevice");
  pairDialogVisible.value = true;
}
function handleStartPairClick() {
  connectDevice(0);
}
function handlePairClose() {
  pairDialogVisible.value = false;
}
function handleCancelClick() {
  pairDialogVisible.value = false;
}

/* ---- auto-reconnect ---- */
onMounted(async () => {
  isSupportHID.value = "hid" in navigator;
  try {
    const existing: any[] = (await (navigator as any).hid.getDevices?.()) || [];
    const scyroxExisting = existing.filter(isScyroxDevice);
    console.log("Already-authorized Scyrox devices:", scyroxExisting);
  } catch (e) {
    console.warn("getDevices failed:", e);
  }
});
</script>

<style scoped>
:root {
  --scyrox-primary: #dafe22;
  --scyrox-bg: #171717;
  --scyrox-bg-soft: #0f0f0f;
  --text-main: #ffffff;
  --text-muted: rgba(255, 255, 255, 0.6);
  --card: rgba(255, 255, 255, 0.03);
  --radius-lg: 22px;
}

.app-shell {
  min-height: 100vh;
  background: radial-gradient(
    circle at 10% 10%,
    #dafe2212 0%,
    #0f0f0f 55%,
    #0b0b0b 100%
  );
  color: var(--text-main);
  display: flex;
  flex-direction: column;
}

/* top bar */
.topline {
  background: var(--scyrox-primary);
  color: #000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px clamp(14px, 3vw, 34px);
  font-size: 0.85rem;
}
.topline-text {
  font-weight: 500;
}
.lanSelect {
  background: #fff;
  border-radius: 999px;
  border: none;
  padding: 3px 8px;
  font-size: 0.78rem;
}

/* header */
.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 14px clamp(14px, 3vw, 34px);
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
}
.brand .logo {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--scyrox-primary);
  font-style: italic;
}
.nav {
  display: flex;
  gap: 14px;
}
.nav-item {
  background: transparent;
  border: none;
  color: #fff;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 6px 10px;
  border-radius: 999px;
  transition: 0.15s ease;
}
.nav-item:hover {
  background: rgba(218, 254, 34, 0.12);
}
.nav-active {
  background: rgba(218, 254, 34, 0.12);
  border: 1px solid rgba(218, 254, 34, 0.4);
}
.header-actions {
  display: flex;
  gap: 8px;
}
.round-btn {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.03);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: 0.13s ease;
}
.round-btn:hover {
  background: rgba(218, 254, 34, 0.25);
}
.mobile-menu {
  display: none;
  background: transparent;
  border: none;
  font-size: 1.6rem;
  color: #fff;
}

/* main */
.main {
  width: min(1180px, 94vw);
  margin: 34px auto 36px;
  flex: 1;
}
.hero {
  margin-bottom: 26px;
}
.hero-pill {
  display: inline-flex;
  background: rgba(218, 254, 34, 0.1);
  border: 1px solid rgba(218, 254, 34, 0.35);
  border-radius: 999px;
  padding: 3px 14px;
  font-size: 0.73rem;
  letter-spacing: 0.23em;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.hero-title {
  font-size: clamp(2.3rem, 3.2vw, 3.4rem);
  font-weight: 700;
  margin-bottom: 10px;
}
.hero-text {
  max-width: 620px;
  color: var(--text-muted);
  line-height: 1.6;
}
.hero-warning {
  margin-top: 16px;
  background: rgba(255, 84, 84, 0.08);
  border: 1px solid rgba(255, 84, 84, 0.3);
  padding: 8px 12px;
  border-radius: 16px;
  color: #ffb4b4;
}

/* section devices */
.section {
  margin-top: 18px;
}
.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.section-title {
  font-size: 1.1rem;
  font-weight: 600;
}
.section-sub {
  font-size: 0.8rem;
  color: var(--text-muted);
}
.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 18px;
}
.device-card {
  background: radial-gradient(
    circle at 10% 0%,
    rgba(218, 254, 34, 0.045) 0%,
    rgba(255, 255, 255, 0.01) 50%
  );
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  padding: 14px 14px 16px;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.24);
  cursor: pointer;
  transition: 0.15s ease;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 200px;
}
.device-card:hover {
  transform: translateY(-3px);
  border: 1px solid rgba(218, 254, 34, 0.45);
}
.device-img-wrap {
  background: rgba(0, 0, 0, 0.12);
  border-radius: 16px;
  height: 110px;
  display: grid;
  place-items: center;
}
.device-card img {
  width: 90%;
  max-height: 100%;
  object-fit: contain;
}
.device-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.device-name {
  font-weight: 600;
  font-size: 0.9rem;
}
.device-meta {
  font-size: 0.74rem;
  color: var(--text-muted);
}
.device-card.ghost {
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
  border-style: dashed;
  border-color: rgba(218, 254, 34, 0.3);
}
.ghost-dot {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: rgba(218, 254, 34, 0.2);
  border: 1px solid rgba(218, 254, 34, 0.4);
  display: grid;
  place-items: center;
  font-size: 1.6rem;
}

/* footer */
.footer {
  border-top: 1px solid rgba(255, 255, 255, 0.025);
  padding: 18px clamp(14px, 3vw, 34px) 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.75rem;
}
.footer-links {
  display: flex;
  gap: 10px;
}
.footer-links a {
  color: inherit;
  text-decoration: none;
}
.footer-links a:hover {
  color: #fff;
}

/* modal maison */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.12s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(5px);
  display: grid;
  place-items: center;
  z-index: 50;
}
.modal {
  background: #101010;
  border: 1px solid rgba(218, 254, 34, 0.35);
  border-radius: 20px;
  width: min(400px, 92vw);
  padding: 22px 20px 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.32);
}
.modal-title {
  font-size: 1.05rem;
  margin-bottom: 10px;
}
.modal-text {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 18px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.btn {
  border: none;
  border-radius: 12px;
  padding: 6px 14px 7px;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.78rem;
}
.btn.primary {
  background: var(--scyrox-primary);
  color: #000;
}
.btn.ghost {
  background: rgba(255, 255, 255, 0.02);
  color: #fff;
}

/* responsive */
@media (max-width: 930px) {
  .nav {
    display: none;
  }
  .mobile-menu {
    display: block;
  }
  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }
  .footer {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
