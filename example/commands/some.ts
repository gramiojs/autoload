import type { BotType } from "..";

export const beta = (bot: BotType) =>
	bot.command("start", (context) => context.send("hello!"));
