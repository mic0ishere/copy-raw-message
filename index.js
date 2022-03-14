const { Plugin } = require("powercord/entities");
const { findInReactTree } = require("powercord/util");
const { getModule, React } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");

const CopyRawButton = require("./CopyRawButton");
const copyMessageContents = require("./copyMessageContents");
const copyEmbedContents = require("./copyEmbedContents");
const { patchMessage } = require("./lib");

module.exports = class CopyRawMessage extends Plugin {
  startPlugin() {
    this.loadStylesheet("style.css");
    this.addButtons();
  }

  pluginWillUnload() {
    uninject("copy-raw-popover");
    uninject("copy-raw-context-menu");
    document
      .querySelectorAll(".copy-raw-message")
      .forEach((e) => (e.style.display = "none"));
  }

  async addButtons() {
    const MiniPopover = await getModule(
      (m) => m?.default?.displayName === "MiniPopover"
    );
    const MessageContextMenu = await getModule(
      (m) => m?.default?.displayName === "MessageContextMenu"
    );
    const { MenuGroup, MenuItem } = await getModule(["MenuGroup", "MenuItem"]);

    if (MiniPopover) {
      inject("copy-raw-popover", MiniPopover, "default", (_, res) => {
        const props = findInReactTree(res, (r) => r?.message);
        if (!props) return res;

        const embeds = props.message?.embeds?.filter((e) => e.type === "rich");

        if (
          props.message?.content?.length > 0 ||
          props.message?.attachments?.length > 0
        ) {
          res.props.children.unshift(
            React.createElement(CopyRawButton, {
              message: patchMessage(props.message),
              tooltip: "Copy raw message",
              copyFunction: copyMessageContents,
              type: "message",
            })
          );
        }

        if (embeds.length > 0) {
          res.props.children.unshift(
            React.createElement(CopyRawButton, {
              message: patchMessage(props.message),
              tooltip: `Copy raw embed${embeds.length > 1 ? "s" : ""}`,
              copyFunction: copyEmbedContents,
              type: "embed",
            })
          );
        }

        return res;
      });
      MiniPopover.default.displayName = "MiniPopover";
    }

    if (MessageContextMenu) {
      inject(
        "copy-raw-context-menu",
        MessageContextMenu,
        "default",
        (args, res) => {
          const embeds = args[0]?.message?.embeds?.filter(
            (e) => e.type === "rich"
          );
          if (!res?.props?.children) return res;

          const copyId = res.props.children?.find(
            (x) => x.props?.children?.key == "message-devmode-copy-id"
          );
          const copyRawMessage = React.createElement(MenuItem, {
            action: () => {
              copyMessageContents(patchMessage(args[0].message));
            },
            id: "copy-raw-message",
            label: "Copy raw message",
          });

          const copyRawEmbed = React.createElement(MenuItem, {
            action: () => {
              copyEmbedContents(patchMessage(args[0].message));
            },
            id: "copy-raw-embed",
            label: `Copy raw embed${embeds.length > 1 ? "s" : ""}`,
          });

          const result = [];

          if (embeds.length > 0) {
            result.push(copyRawEmbed);
          }
          if (args[0].message.content.length > 0) {
            result.push(copyRawMessage);
          }

          if (copyId)
            copyId.props.children = [...result, copyId.props.children];
          else
            res.props.children.splice(
              -1,
              0,
              React.createElement(MenuGroup, null, result)
            );
          return res;
        }
      );
      MessageContextMenu.default.displayName = "MessageContextMenu";
    }
  }
};
