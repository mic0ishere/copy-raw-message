const { React, getModule } = require("powercord/webpack");
const copyMessageContents = require("./copyMessageContents");

const classes = getModule(["icon", "isHeader"], false);
const { Button } =
  getModule((m) => m?.default?.displayName === "MiniPopover", false) || {};

class CopyRawButton extends React.PureComponent {
  constructor(props) {
    super(props);
    this.message = props.message;
  }

  clickHandler(event) {
    event.preventDefault();
    copyMessageContents(this.message);
  }

  render() {
    return (
      <Button
        className={`copy-raw-message`}
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
    );
  }
}

// Might as well.
module.exports =
  window.KLibrary?.Tools?.ReactTools?.WrapBoundary?.(CopyRawButton) ||
  CopyRawButton;
