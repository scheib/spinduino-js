function enable() {
  pinMode(D5, 'input_pullup');
  digitalWrite(D4, 1);
  digitalWrite(D8, 1);
}

function disable() {
  pinMode(D5, 'input');
  digitalWrite(D4, 0);
  digitalWrite(D3, 0);
  digitalWrite(D8, 0);
}

function zigzag() {
  const text = [
    "        R               G       ",
    "       R R             G G      ",
    "      R   R           G   G     ",
    "     R     R         G     G    ",
    "    R       R       G       G   ",
    "   R         R     G         G  ",
    "  R           R   G           G ",
    " R             R G             G",
    "R               G               "
  ];
  let leds = null;
  let colorIdx = 1;
  function render() {
    leds = new Uint8Array(text[0].length * 30);
    for (let idx = 0; idx < text[0].length; idx++) {
      for (let i = 0; i < 9; i++) {
        let base = 4 + i * 4;
        let chr = text[i][idx % text[0].length];
        switch (chr) {
          case 'R': leds[30 * idx + i * 3 + ((colorIdx) % 3)] = 0x1f; break;
          case 'G': leds[30 * idx + i * 3 + ((colorIdx + 2) % 3)] = 0x1f; break;
          case 'B': leds[30 * idx + i * 3 + ((colorIdx + 1) % 3)] = 0x1f; break;
        }
      }
    }
  }
  render();
  spinner.schedule(leds, 1.5);
}

function flipflop() {
  let state = 0;
  function alternating() {
    spinner.clear();
    state = 1 - state;
    for (let i = state; i <= 10; i += 2) {
      spinner.setPixel(i, 0x060200);
    }
    spinner.write();
  }
  let interval = setInterval(alternating);
  return () => clearInterval(interval);
}

function redBlue() {
  const watch = setWatch(e => {
    spinner.setPixel(8, e.state ? 0xff : 0xff << 16, 1);
  }, D5, true);
  return () => clearWatch(watch);
}

function redBlue2() {
  const watch = setWatch(e => {
    let i = 0;
    for (i = 0; i < 10; i++) {
      spinner.setPixel(i, e.state ? 1 : 1 << 16, 1);
    }
  }, D5, true);
  return () => clearWatch(watch);
}

function snake() {
  let spinCount = 1;
  let lastTime = getTime();
  const watch = setWatch(e => {
    let delta = getTime() - lastTime;
    lastTime = getTime();
    spinCount++;
    spinner.setPixel(8, 0xff << 16, 1);
    setTimeout(() => spinner.setPixel(8, 0, 1), delta * spinCount / 120 * 1000);
    if (delta > 1) {
      spinCount = 1;
    }
  }, D5, { repeat: true, edge: 'rising' });
  return () => clearWatch(watch);
}

const programs = [
  redBlue,
  zigzag,
  flipflop,
  redBlue2,
  snake,
];

let programId = 0;
let endProgram = null;
function onClick() {
  spinner.stop();
  if (endProgram) {
    endProgram();
    endProgram = null;
  }
  if (programId < programs.length) {
    enable();
    spinner.clear(true);
    endProgram = programs[programId]();
    programId++;
  } else {
    disable();
    digitalPulse(LED, 0, 100);
    programId = 0;
  }
}

function onInit() {
  setWatch(onClick, BTN1, { edge: 'rising', repeat: true, debounce: 100 });
}
