const { Plugin } = require("powercord/entities");
const { findInReactTree } = require("powercord/util");
const { getModule, React } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");

const CopyRawButton = require("./CopyRawButton");

module.exports = class CopyRawMessage extends Plugin {
  startPlugin() {
    this.loadStylesheet("style.css");
    this.addButtons();
  }

  pluginWillUnload() {
    this.addButtons(true, true);
    document
      .querySelectorAll(".copy-raw-message")
      .forEach((e) => (e.style.display = "none"));
  }

  async addButtons(repatch, unpatch) {
    if (repatch) {
      uninject("copy-raw-message");
    }
    if (unpatch) return;
    const MiniPopover = await getModule(
      (m) => m?.default?.displayName === "MiniPopover"
    );
    inject("copy-raw-message", MiniPopover, "default", (_, res) => {
      const props = findInReactTree(res, (r) => r?.message);
      if (
        !props ||
        (props.message.content.length < 1 &&
          props.message.attachments.length < 1)
      )
        return res;
      res.props.children.unshift(
        React.createElement(CopyRawButton, {
          message: props.message,
        })
      );
      return res;
    });
    MiniPopover.default.displayName = "MiniPopover";
  }
};
