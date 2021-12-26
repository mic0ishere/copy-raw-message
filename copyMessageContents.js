const { getModule } = require("powercord/webpack");
const { clipboard } = getModule(["clipboard"], false) || {};

module.exports = function (message) {
  let content = message.content || "";
  if (message.attachments.length > 0) {
    const attachments = message.attachments
      .map((x) => x.url)
      .filter((x) => !content.includes(x))
      .join("\n");
    if (attachments.length > 0)
      content += `${
        content.endsWith("\n") || content.length === 0 ? "" : "\n"
      }${attachments}`;
  }
  clipboard.copy(content);

  powercord.api.notices.sendToast("copy-raw-message", {
    header: "Copied to clipboard.",
    type: "success",
    timeout: 3e3,
  });
};
