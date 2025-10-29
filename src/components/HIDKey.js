const keyCodeMap = {
  Escape: {
    value: 0x29,
    text: "Esc",
    type: 1,
  },
  F1: {
    value: 0x3a,
    text: "F1",
    type: 1,
  },
  F2: {
    value: 0x3b,
    text: "F2",
    type: 1,
  },
  F3: {
    value: 0x3c,
    text: "F3",
    type: 1,
  },
  F4: {
    value: 0x3d,
    text: "F4",
    type: 1,
  },
  F5: {
    value: 0x3e,
    text: "F5",
    type: 1,
  },
  F6: {
    value: 0x3f,
    text: "F6",
    type: 1,
  },
  F7: {
    value: 0x40,
    text: "F7",
    type: 1,
  },
  F8: {
    value: 0x41,
    text: "F8",
    type: 1,
  },
  F9: {
    value: 0x42,
    text: "F9",
    type: 1,
  },
  F10: {
    value: 0x43,
    text: "F10",
    type: 1,
  },
  F11: {
    value: 0x44,
    text: "F11",
    type: 1,
  },
  F12: {
    value: 0x45,
    text: "F12",
    type: 1,
  },

  Backquote: {
    value: 0x35,
    text: "`",
    type: 1,
  },
  Digit1: {
    value: 0x1e,
    text: "1",
    type: 1,
  },
  Digit2: {
    value: 0x1f,
    text: "2",
    type: 1,
  },
  Digit3: {
    value: 0x20,
    text: "3",
    type: 1,
  },
  Digit4: {
    value: 0x21,
    text: "4",
    type: 1,
  },
  Digit5: {
    value: 0x22,
    text: "5",
    type: 1,
  },
  Digit6: {
    value: 0x23,
    text: "6",
    type: 1,
  },
  Digit7: {
    value: 0x24,
    text: "7",
    type: 1,
  },
  Digit8: {
    value: 0x25,
    text: "8",
    type: 1,
  },
  Digit9: {
    value: 0x26,
    text: "9",
    type: 1,
  },
  Digit0: {
    value: 0x27,
    text: "0",
    type: 1,
  },
  Minus: {
    value: 0x2d,
    text: "-",
    type: 1,
  },
  Equal: {
    value: 0x2e,
    text: "+",
    type: 1,
  },
  Backspace: {
    value: 0x2a,
    text: "←",
    type: 1,
  },

  Tab: {
    value: 0x2b,
    text: "Tab",
    type: 1,
  },
  KeyQ: {
    value: 0x14,
    text: "Q",
    type: 1,
  },
  KeyW: {
    value: 0x1a,
    text: "W",
    type: 1,
  },
  KeyE: {
    value: 0x08,
    text: "E",
    type: 1,
  },
  KeyR: {
    value: 0x15,
    text: "R",
    type: 1,
  },
  KeyT: {
    value: 0x17,
    text: "T",
    type: 1,
  },
  KeyY: {
    value: 0x1c,
    text: "Y",
    type: 1,
  },
  KeyU: {
    value: 0x18,
    text: "U",
    type: 1,
  },
  KeyI: {
    value: 0x0c,
    text: "I",
    type: 1,
  },
  KeyO: {
    value: 0x12,
    text: "O",
    type: 1,
  },
  KeyP: {
    value: 0x13,
    text: "P",
    type: 1,
  },
  BracketLeft: {
    value: 0x2f,
    text: "[",
    type: 1,
  },
  BracketRight: {
    value: 0x30,
    text: "]",
    type: 1,
  },
  Backslash: {
    value: 0x31,
    text: "]",
    type: 1,
  },

  CapsLock: {
    value: 0x39,
    text: "CapsLock",
    type: 1,
  },
  KeyA: {
    value: 0x04,
    text: "A",
    type: 1,
  },
  KeyS: {
    value: 0x16,
    text: "S",
    type: 1,
  },
  KeyD: {
    value: 0x07,
    text: "D",
    type: 1,
  },
  KeyF: {
    value: 0x09,
    text: "F",
    type: 1,
  },
  KeyG: {
    value: 0x0a,
    text: "G",
    type: 1,
  },
  KeyH: {
    value: 0x0b,
    text: "H",
    type: 1,
  },
  KeyJ: {
    value: 0x0d,
    text: "J",
    type: 1,
  },
  KeyK: {
    value: 0x0e,
    text: "K",
    type: 1,
  },
  KeyL: {
    value: 0x0f,
    text: "L",
    type: 1,
  },
  Semicolon: {
    value: 0x33,
    text: ":",
    type: 1,
  },
  Quote: {
    value: 0x34,
    text: "'",
    type: 1,
  },
  Enter: {
    value: 0x28,
    text: "Enter",
    type: 1,
  },

  ShiftLeft: {
    value: 0x02,
    text: "LShift",
    type: 0,
  },
  KeyZ: {
    value: 0x1d,
    text: "Z",
    type: 1,
  },
  KeyX: {
    value: 0x1b,
    text: "X",
    type: 1,
  },
  KeyC: {
    value: 0x06,
    text: "C",
    type: 1,
  },
  KeyV: {
    value: 0x19,
    text: "V",
    type: 1,
  },
  KeyB: {
    value: 0x05,
    text: "B",
    type: 1,
  },
  KeyN: {
    value: 0x11,
    text: "N",
    type: 1,
  },
  KeyM: {
    value: 0x10,
    text: "M",
    type: 1,
  },
  Comma: {
    value: 0x36,
    text: ",",
    type: 1,
  },
  Period: {
    value: 0x37,
    text: ".",
    type: 1,
  },
  Slash: {
    value: 0x38,
    text: "/",
    type: 1,
  },
  ShiftRight: {
    value: 0x20,
    text: "RShift",
    type: 0,
  },

  ControlLeft: {
    value: 0x01,
    text: "LCtrl",
    type: 0,
  },
  MetaLeft: {
    value: 0x08,
    text: "LWin",
    type: 0,
  },
  AltLeft: {
    value: 0x04,
    text: "LAlt",
    type: 0,
  },
  Space: {
    value: 0x2c,
    text: "Space",
    type: 1,
  },
  AltRight: {
    value: 0x40,
    text: "RAlt",
    type: 0,
  },
  MetaRight: {
    value: 0x80,
    text: "RWin",
    type: 0,
  },
  ContextMenu: {
    value: 0x01,
    text: "FN",
    type: "7",
  },
  ControlRight: {
    value: 0x10,
    text: "RCtrl",
    type: 0,
  },

  PrintScreen: {
    value: 0x46,
    text: "Screen",
    type: 1,
  },
  ScrollLock: {
    value: 0x47,
    text: "Scroll",
    type: 1,
  },
  Pause: {
    value: 0x48,
    text: "Pause",
    type: 1,
  },
  Insert: {
    value: 0x49,
    text: "Insert",
    type: 1,
  },
  Home: {
    value: 0x4a,
    text: "Home",
    type: 1,
  },
  PageUp: {
    value: 0x4b,
    text: "PageUp",
    type: 1,
  },
  Delete: {
    value: 0x4c,
    text: "Del",
    type: 1,
  },
  End: {
    value: 0x4d,
    text: "End",
    type: 1,
  },
  PageDown: {
    value: 0x4e,
    text: "PageDn",
    type: 1,
  },
  ArrowUp: {
    value: 0x52,
    text: "↑",
    type: 1,
  },
  ArrowLeft: {
    value: 0x50,
    text: "←",
    type: 1,
  },
  ArrowDown: {
    value: 0x51,
    text: "↓",
    type: 1,
  },
  ArrowRight: {
    value: 0x4f,
    text: "→",
    type: 1,
  },

  NumLock: {
    value: 0x53,
    text: "NumLock",
    type: 1,
  },
  NumpadDivide: {
    value: 0x54,
    text: "Num/",
    type: 1,
  },
  NumpadMultiply: {
    value: 0x55,
    text: "Num*",
    type: 1,
  },
  NumpadSubtract: {
    value: 0x56,
    text: "Num-",
    type: 1,
  },
  NumpadAdd: {
    value: 0x57,
    text: "Num+",
    type: 1,
  },
  NumpadDecimal: {
    value: 0x63,
    text: "Num.",
    type: 1,
  },
  NumpadEnter: {
    value: 0x58,
    text: "Enter",
    type: 1,
  },
  Numpad1: {
    value: 0x59,
    text: "Num1",
    type: 1,
  },
  Numpad2: {
    value: 0x5a,
    text: "Num2",
    type: 1,
  },
  Numpad3: {
    value: 0x5b,
    text: "Num3",
    type: 1,
  },
  Numpad4: {
    value: 0x5c,
    text: "Num4",
    type: 1,
  },
  Numpad5: {
    value: 0x5d,
    text: "Num5",
    type: 1,
  },
  Numpad6: {
    value: 0x5e,
    text: "Num6",
    type: 1,
  },
  Numpad7: {
    value: 0x5f,
    text: "Num7",
    type: 1,
  },
  Numpad8: {
    value: 0x60,
    text: "Num8",
    type: 1,
  },
  Numpad9: {
    value: 0x61,
    text: "Num9",
    type: 1,
  },
  Numpad0: {
    value: 0x62,
    text: "Num0",
    type: 1,
  },
};

function keyToHID(key) {
  return keyCodeMap[key] || null;
}

function HIDToKey(context) {
  for (let key in keyCodeMap) {
    if (
      keyCodeMap[key].type == context.type &&
      keyCodeMap[key].value == context.value
    ) {
      return keyCodeMap[key];
    }
  }

  return null;
}

function textToHID(text) {
  for (let key in keyCodeMap) {
    if (keyCodeMap[key].text == text) {
      return keyCodeMap[key];
    }
  }

  return null;
}

export default {
  keyToHID,
  HIDToKey,
  textToHID,
};
