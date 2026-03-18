import { event } from "./analytics";

export function initConsoleEasterEgg() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="80" viewBox="0 0 500 80">
  <style>
    .runner { animation: run 3s linear infinite; }
    @keyframes run {
      0% { transform: translateX(500px); }
      100% { transform: translateX(-80px); }
    }
  </style>
  <line x1="0" y1="55" x2="500" y2="55" stroke="#1E90FF" stroke-width="3"/>
  <text class="runner" y="50" font-size="30">🦔💨</text>
</svg>`;

  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  console.log(
    "%c ",
    `background-image: url('${dataUrl}'); padding: 40px 250px; background-size: 500px 80px; background-repeat: no-repeat; background-position: center;`
  );

  event("console_easter_egg");

  console.log(
    "%c ⚡ I knew you will look at console! ⚡",
    "color: #FFD700; font-size: 20px; font-weight: bold; text-shadow: 1px 1px 2px #000;"
  );

  const msg = " Want to collaborate? Reach out william.tan2251 at gmail ";
  const border = "═".repeat(msg.length + 2);
  console.log(
    `%c╔${border}╗\n║ ${msg} ║\n╚${border}╝`,
    "color: #1E90FF; font-size: 13px; font-family: monospace;"
  );
}
