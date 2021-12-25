const { Plugin } = require("powercord/entities");
const { findInReactTree } = require("powercord/util");
const { getModule, React } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");

const CopyRawButton = require("./CopyRawButton");
const copyMessageContents = require("./copyMessageContents");
const copyEmbedContents = require("./copyEmbedContents");

module.exports = class CopyRawMessage extends Plugin {
  startPlugin() {
    this.loadStylesheet("style.css");
    this.addButtons();
  }

  pluginWillUnload() {
    uninject("copy-raw-message");
    uninject("copy-raw-embed");
    uninject("copy-raw-message-context-menu");
    uninject("copy-raw-embed-context-menu");
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

    inject("copy-raw-message", MiniPopover, "default", (_, res) => {
      const props = findInReactTree(res, (r) => r?.message);
      if (
        !props ||
        (props.message.content?.length === 0 &&
          props.message.attachments?.length === 0)
      )
        return res;
      res.props.children.unshift(
        React.createElement(CopyRawButton, {
          message: props.message,
          tooltip: "Copy raw message",
          copyFunction: copyMessageContents,
        })
      );
      return res;
    });

    inject("copy-raw-embed", MiniPopover, "default", (_, res) => {
      const props = findInReactTree(res, (r) => r?.message);
      if (
        !props ||
        props.message.embeds?.filter((e) => e.type === "rich").length === 0
      )
        return res;

      res.props.children.unshift(
        React.createElement(CopyRawButton, {
          message: props.message,
          tooltip: "Copy raw embed(s)",
          copyFunction: copyEmbedContents,
        })
      );
      return res;
    });
    MiniPopover.default.displayName = "MiniPopover";

    inject(
      "copy-raw-message-context-menu",
      MessageContextMenu,
      "default",
      (args, res) => {
        if (
          !args[0]?.message ||
          !res?.props?.children ||
          (!args[0].message.content && !args[0].message.attachments[0]?.url)
        )
          return res;
        const copyId = res.props.children?.find(
          (x) => x.props?.children?.key == "devmode-copy-id"
        );
        const reactElement = React.createElement(MenuItem, {
          action: () => {
            copyMessageContents(args[0].message);
          },
          id: "copy-raw-message",
          label: "Copy Content [Raw]",
        });
        if (copyId)
          copyId.props.children = [reactElement, copyId.props.children];
        else
          res.props.children.splice(
            -1,
            0,
            React.createElement(MenuGroup, null, reactElement)
          );
        return res;
      }
    );
    inject(
      "copy-raw-message-context-menu",
      MessageContextMenu,
      "default",
      (args, res) => {
        if (
          !args[0]?.message ||
          !res?.props?.children ||
          !args[0].message.embeds ||
          args[0].message.embeds?.filter((e) => e.type === "rich").length === 0
        )
          return res;

        const copyId = res.props.children?.find(
          (x) => x.props?.children?.key == "devmode-copy-id"
        );
        const reactElement = React.createElement(MenuItem, {
          action: () => {
            copyEmbedContents(args[0].message);
          },
          id: "copy-raw-embed",
          label: "Copy Embed(s) [Raw]",
        });
        if (copyId)
          copyId.props.children = [reactElement, copyId.props.children];
        else
          res.props.children.splice(
            -1,
            0,
            React.createElement(MenuGroup, null, reactElement)
          );
        return res;
      }
    );
    MessageContextMenu.default.displayName = "MessageContextMenu";
  }
};
