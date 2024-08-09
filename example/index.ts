import { Bot } from "gramio";
import { autoload } from "../dist";

const bot = new Bot(process.env.TOKEN as string)
	.extend(
		await autoload({
			import: (file) => Object.keys(file).at(0) || "default",
			onLoad: console.log,
		}),
	)
	.onStart(console.log);

bot.start();

export type BotType = typeof bot;
