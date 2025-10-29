<script setup>
import { ref } from "vue";

const device = ref(null);
const log = ref([]);
const dpiValue = ref([17, 17, 0, 51]); // Valeur DPI à envoyer (3 premiers octets fixes)
const currentDPI = ref(null); // DPI actuel affiché

// Fonction pour logger
function addLog(message) {
  log.value.push(message);
  console.log(message);
}

// Connexion HID
async function connectHID() {
  try {
    const devices = await navigator.hid.requestDevice({
      filters: [{ vendorId: 0x3554 }] // VID Scyrox
    });
    if (devices.length === 0) {
      addLog("Aucun périphérique trouvé");
      return;
    }

    device.value = devices[0];
    await device.value.open();
    addLog(`✅ Connecté à ${device.value.productName}`);

    // Quand la souris envoie un rapport
    device.value.oninputreport = (event) => {
      const data = new Uint8Array(event.data.buffer);
      addLog(`📥 Report ID=${event.reportId} data=${data}`);

      // Décodage DPI actuel : dernier octet
      if (data.length >= 4) {
        currentDPI.value = data[3];
        addLog(`🎯 DPI actuel mis à jour: ${currentDPI.value}`);
      }
    };
  } catch (err) {
    addLog("❌ Erreur connexion: " + err);
  }
}

// Envoyer une commande DPI
async function setDPI() {
  if (!device.value) {
    addLog("⚠️ Pas de périphérique ouvert");
    return;
  }
  try {
    const buffer = new Uint8Array([17, 17, 0, dpiValue.value[3]]); // 4 octets DPI
    await device.value.sendFeatureReport(1, buffer); // Report ID = 1
    addLog("🚀 Commande DPI envoyée: " + buffer.join(","));
  } catch (err) {
    addLog("❌ Erreur setDPI: " + err);
  }
}

</script>

<template>
  <div class="p-6 max-w-xl mx-auto bg-gray-900 text-white rounded-xl shadow-lg">
    <h1 class="text-2xl font-bold mb-4">🎮 Scyrox V8 Control</h1>

    <button @click="connectHID" class="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600">
      Connecter la souris
    </button>

    <div class="mt-4">
      <h2 class="text-lg font-semibold">
        DPI actuel : 
        <span v-if="currentDPI !== null">{{ currentDPI }}</span>
        <span v-else>❓ Non lu</span>
      </h2>
    </div>

    <div class="mt-4">
      <label class="block mb-2">Valeur DPI (4 octets)</label>
      <div class="flex space-x-2">
        <!-- 3 premiers octets fixes -->
        <input v-model.number="dpiValue[0]" type="number" class="p-2 rounded bg-gray-700 w-16" disabled />
        <input v-model.number="dpiValue[1]" type="number" class="p-2 rounded bg-gray-700 w-16" disabled />
        <input v-model.number="dpiValue[2]" type="number" class="p-2 rounded bg-gray-700 w-16" disabled />
        <!-- Dernier octet modifiable -->
        <input v-model.number="dpiValue[3]" type="number" class="p-2 rounded bg-gray-800 w-16" />
      </div>
    </div>

    <button @click="setDPI" class="mt-4 px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600">
      Appliquer DPI
    </button>

    <div class="mt-6 bg-gray-800 p-4 rounded max-h-64 overflow-y-auto">
      <h2 class="font-semibold">Logs:</h2>
      <div v-for="(msg, i) in log" :key="i" class="text-sm">{{ msg }}</div>
    </div>
  </div>
</template>
