import { Bot } from "gramio";
import { autoload } from "../src";

const bot = new Bot(process.env.TOKEN as string)
	.extend(
		autoload({
			import: (file) => Object.keys(file).at(0) || "default",
		}),
	)
	.onStart(console.log);

bot.start();

export type BotType = typeof bot;
