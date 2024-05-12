import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { type GlobOptionsWithFileTypesTrue, glob } from "glob";
import { Plugin } from "gramio";
import { getPath } from "./utils";

/** Params that used in {@link AutoloadOptions.onLoad | onLoad} and {@link AutoloadOptions.onFinish | onFinish} hooks */
export interface AutoloadOptionsPathParams {
	absolute: string;
	relative: string;
}

/** Options for {@link autoload} plugin extended by {@link GlobOptionsWithFileTypesTrue} */
export interface AutoloadOptions
	extends Omit<GlobOptionsWithFileTypesTrue, "cwd" | "withFileTypes"> {
	/**
	 * [Glob patterns](<https://en.wikipedia.org/wiki/Glob_(programming)>)
	 * @default "**\/*.{ts,js,cjs,mjs}"
	 * */
	pattern?: string;
	/**
	 * The path to the folder
	 * @default "./commands"
	 * */
	path?: string;
	/** The hook that is called when loading a file */
	onLoad?: (path: AutoloadOptionsPathParams) => unknown;
	/** The hook that is called after loading all files */
	onFinish?: (paths: AutoloadOptionsPathParams[]) => unknown;
}

/**
 * Autoload commands plugin for GramIO.
 * @example
 * ## Register the plugin
 *
 * ```ts
 * // index.ts
 * import { Bot } from "gramio";
 * import { autoload } from "@gramio/autoload";
 *
 * const bot = new Bot(process.env.TOKEN as string)
 *     .extend(autoload())
 *     .onStart(console.log);
 *
 * bot.start();
 *
 * export type BotType = typeof bot;
 * ```
 *
 * ## Create command
 *
 * ```ts
 * // commands/command.ts
 * import type { BotType } from "..";
 *
 * export default (bot: BotType) =>
 *     bot.command("start", (context) => context.send("hello!"));
 * ```
 */
export async function autoload(options?: AutoloadOptions): Promise<Plugin> {
	const pattern = options?.pattern ?? "**/*.{ts,js,cjs,mjs}";
	const path = options?.path ?? "./commands";
	const directoryPath = getPath(path);

	const plugin = new Plugin("@gramio/autoload");

	const paths = await glob(pattern, {
		cwd: directoryPath,
		...options,
	});

	for await (const path of paths) {
		const absolute = String(pathToFileURL(join(directoryPath, path)));
		if (options?.onLoad) options.onLoad({ absolute, relative: path });

		const file = await import(absolute);
		if (!file.default) throw new Error(`${path} don't provide export default`);

		plugin.group(file.default);
	}

	if (options?.onFinish)
		options.onFinish(
			paths.map((path) => ({
				absolute: String(pathToFileURL(join(directoryPath, path))),
				relative: path,
			})),
		);

	return plugin;
}
