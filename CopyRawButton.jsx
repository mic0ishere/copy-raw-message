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
    this.message = props.message;
    this.tooltip = props.tooltip;
    this.type = props.type;
    this.copyFunction = props.copyFunction;
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
              aria-hidden="false"
              x="0"
              y="0"
              width="500"
              height="500"
              viewBox="0 0 512 512"
              fill="currentColor"
              class={classes.icon}
            >
              <path
                fill="currentColor"
                d="M320 448v40c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24V120c0-13.255 10.745-24 24-24h72v296c0 30.879 25.121 56 56 56h168zm0-344V0H152c-13.255 0-24 10.745-24 24v368c0 13.255 10.745 24 24 24h272c13.255 0 24-10.745 24-24V128H344c-13.2 0-24-10.8-24-24zm120.971-31.029L375.029 7.029A24 24 0 00358.059 0H352v96h96v-6.059a24 24 0 00-7.029-16.97z"
              />
              {this.type === "embed" && (
                <text
                  style={{
                    fontFamily: "Arial, sans-serif",
                    fontSize: "250px",
                    strokeLinejoin: "round",
                    strokeWidth: "4px",
                    whiteSpace: "pre",
                    fill: "var(--background-primary)",
                  }}
                  x="202.421"
                  y="255.155"
                  dx="-41.004"
                  dy="83.843"
                >
                  E
                </text>
              )}
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
