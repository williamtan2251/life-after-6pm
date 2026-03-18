export function initConsoleEasterEgg() {
  const width = 40;
  const runner = "🦔💨";
  const platform = "━".repeat(width + 6);
  let pos = width;

  const id = setInterval(() => {
    if (pos < 0) {
      clearInterval(id);
      console.clear();

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
      return;
    }

    console.clear();
    const pad = " ".repeat(pos);
    console.log(
      `%c${pad}${runner}\n${platform}`,
      "font-size: 14px; line-height: 18px; font-family: monospace; color: #1E90FF;"
    );
    pos -= 4;
  }, 200);
}
