function patchMessage(msg) {
  const message = JSON.parse(JSON.stringify(msg));

  message.embeds = message.embeds.map((e) => {
    // https://github.com/Juby210/view-raw/blob/master/components/ViewRawButton.jsx#L47
    delete e.id;
    jsonifyEmbedKeys(e);
    for (const k of Object.keys(e).filter((k) => typeof e[k] == "object")) {
      if (!Array.isArray(e[k])) jsonifyEmbedKeys(e[k]);
      else
        e[k].map((el) =>
          typeof el === "object" && !Array.isArray(el)
            ? jsonifyEmbedKeys(el)
            : el
        );
    }

    // convert hsl to hex
    if (e.color) {
      const data = [
        Number(e.color.split(", calc")[0].replace("hsl(", "")),
        100,
        Number(
          e.color
            .split("%), ")
            [e.color.split("%), ").length - 1].replace("%)", "")
        ),
      ];

      if (!data.some((x) => isNaN(x))) e.color = hslToHex(...data);
    }
    return e;
  });
  return message;
}

// https://github.com/Juby210/view-raw/blob/master/components/ViewRawButton.jsx#L62
function jsonifyEmbedKeys(e) {
  for (const k of Object.keys(e)) {
    const newKey = k
      .replace("URL", "_url")
      .replace(/[A-Z]/g, (l) => "_" + l.toLowerCase())
      .replace("raw_", "");
    if (newKey === k) continue;
    e[newKey] = e[k];
    delete e[k];
  }
  return e;
}

// https://stackoverflow.com/a/36722579
function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0"); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

module.exports = {
  patchMessage,
  jsonifyEmbedKeys,
  hslToHex,
};
