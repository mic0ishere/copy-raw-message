const {
  React,
  getModule,
  getModuleByDisplayName,
} = require("powercord/webpack");

const classes = getModule(["icon", "isHeader"], false);
const { Button } =
  getModule((m) => m?.default?.displayName === "MiniPopover", false) || {};
const Tooltip = getModuleByDisplayName("Tooltip", false);

class CopyRawButton extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      copied: null,
    };
    this.message = JSON.parse(JSON.stringify(props.message));

    this.message.embeds = this.message.embeds.map((e) => {
      // https://github.com/Juby210/view-raw/blob/master/components/ViewRawButton.jsx#L47
      delete e.id;
      this.jsonifyEmbedKeys(e);
      for (const k of Object.keys(e).filter((k) => typeof e[k] == "object")) {
        if (!Array.isArray(e[k])) this.jsonifyEmbedKeys(e[k]);
        else
          e[k].map((el) =>
            typeof el === "object" && !Array.isArray(el)
              ? this.jsonifyEmbedKeys(el)
              : el
          );
      }

      // convert hsl to hex
      if (e.color)
        e.color = this.hslToHex(
          Number(e.color.split(", calc")[0].replace("hsl(", "")),
          100,
          Number(e.color.split("%), ")[1].replace("%)", ""))
        );
      return e;
    });

    this.tooltip = props.tooltip;
    this.copyFunction = props.copyFunction;
  }

  // https://github.com/Juby210/view-raw/blob/master/components/ViewRawButton.jsx#L62
  jsonifyEmbedKeys(e) {
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
  hslToHex(h, s, l) {
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

  clickHandler(event) {
    event.preventDefault();
    this.setState({ copied: true });
    setTimeout(() => {
      this.setState({ copied: null });
    }, 3000);
    this.copyFunction(this.message);
  }

  render() {
    return (
      <Tooltip
        color={this.state.copied ? "green" : "black"}
        position="top"
        text={this.state.copied ? "Copied!" : this.tooltip}
      >
        {({ onMouseLeave, onMouseEnter }) => (
          <Button
            className={`copy-raw-message`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={(e) => {
              this.clickHandler(e);
            }}
          >
            <svg
              x="0"
              y="0"
              aria-hidden="false"
              width="20"
              height="20"
              viewBox="0 0 512.002 512.002"
              fill="currentColor"
              class={classes.icon}
            >
              <path
                fill="currentColor"
                d="M320 448v40c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24V120c0-13.255 10.745-24 24-24h72v296c0 30.879 25.121 56 56 56h168zm0-344V0H152c-13.255 0-24 10.745-24 24v368c0 13.255 10.745 24 24 24h272c13.255 0 24-10.745 24-24V128H344c-13.2 0-24-10.8-24-24zm120.971-31.029L375.029 7.029A24 24 0 00358.059 0H352v96h96v-6.059a24 24 0 00-7.029-16.97z"
              />
            </svg>
          </Button>
        )}
      </Tooltip>
    );
  }
}

module.exports =
  window.KLibrary?.Tools?.ReactTools?.WrapBoundary?.(CopyRawButton) ||
  CopyRawButton;
