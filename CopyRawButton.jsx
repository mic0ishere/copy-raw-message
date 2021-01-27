const {
	React,
	getModule,
	getModuleByDisplayName,
} = require("powercord/webpack");

const classes = getModule(["icon", "isHeader"], false);
const { clipboard } = getModule(["clipboard"], false) || {};
const Tooltip = getModuleByDisplayName("Tooltip", false);
const { Button } =
	getModule((m) => m?.default?.displayName === "MiniPopover", false) || {};

class CopyRawButton extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = { copied: false, message: this.patchMessage(props.message) };
	}

	patchMessage(msg) {
		const message = _.cloneDeep(msg);
		// Censor personal data.
		for (const data in message.author) {
			if (
				typeof message.author[data] !== "function" &&
				[
					"id",
					"username",
					"usernameNormalized",
					"discriminator",
					"avatar",
					"bot",
					"system",
					"publicFlags",
				].indexOf(data) === -1
			)
				delete message.author[data];
		}
		// JSONify embed keys. Making easier to use them in e.g. bots.
		message.embeds = message.embeds.map((e) => {
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
			return e;
		});
		return message;
	}
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

	clickHandler(event) {
		event.preventDefault();

		const { message } = this.state;

		if (message.content.length < 1 && message.attachments.length > 0)
			message.content += message.attachments.map(x => x.url).join("\n")
		else if (message.content.length > 0 && message.attachments.length > 0)
			message.attachments.map(x => x.url).forEach(x => {
				if (!message.content.includes(x)) message.content += `\n${x}`
			})
		clipboard.copy(message.content);
		this.setCopied('Message');
	}

	setCopied(type) {
		this.setState({ copied: type });
		setTimeout(
			() =>
				this.setState({
					copied: false,
				}),
			2e3
		);
	}

	render() {
		return (
			<Tooltip
				color={this.state.copied ? "green" : "black"}
				postion="top"
				text={
					this.state.copied
						? `Copied ${this.state.copied}!`
						: "Copy Raw"
				}
			>
				{({ onMouseLeave, onMouseEnter }) => (
					<Button
						className={`copy-raw-message`}
						onClick={(e) => {
							this.clickHandler(e);
						}}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
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

// Might as well.
module.exports =
	window.KLibrary?.Tools?.ReactTools?.WrapBoundary?.(CopyRawButton) ||
	CopyRawButton;
