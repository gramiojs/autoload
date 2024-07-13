import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { type Options, fdir } from "fdir";
import { Plugin } from "gramio";
import type { PicomatchOptions } from "picomatch";
import { getPath } from "./utils";

/** Params that used in {@link AutoloadOptions.onLoad | onLoad} and {@link AutoloadOptions.onFinish | onFinish} hooks */
export interface AutoloadOptionsPathParams {
	absolute: string;
	relative: string;
}

/** Options for {@link autoload} plugin with options for {@link Options | fdir} and  {@link PicomatchOptions | picomatch}*/
export interface AutoloadOptions {
	/** Configure `fdir` options */
	fdir?: Options;
	/** Configure `picomatch` options */
	picomatch?: PicomatchOptions;
	/**
	 * [Glob patterns](<https://en.wikipedia.org/wiki/Glob_(programming)>)
	 * @default "**\/*.{ts,js,cjs,mjs}"
	 * */
	patterns?: string | string[];

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
	const fileSources = {};

	const patterns =
		typeof options?.patterns === "string"
			? [options?.patterns]
			: options?.patterns ?? ["**/*.{ts,js,cjs,mjs}"];
	const path = options?.path ?? "./commands";
	const directoryPath = getPath(path);

	const plugin = new Plugin("@gramio/autoload");

	// esbuild-plugin-autoload glob-start
	const paths = await new fdir(options?.fdir || {})
		.globWithOptions(patterns, options?.picomatch || {})
		.crawl(directoryPath)
		.withPromise();
	// esbuild-plugin-autoload glob-end

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
