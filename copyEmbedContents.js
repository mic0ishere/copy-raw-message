const { getModule } = require("powercord/webpack");
const { clipboard } = getModule(["clipboard"], false) || {};

module.exports = function (message) {
  let content = message.embeds.filter((x) => x.type === "rich");

  if (content.length === 1) content = content[0];

  clipboard.copy(JSON.stringify(content, null, 2));

  powercord.api.notices.sendToast("copy-raw-message", {
    header: "Copied to clipboard.",
    type: "success",
    timeout: 3e3,
  });
};
