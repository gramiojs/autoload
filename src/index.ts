import path from "node:path";
import url from "node:url";
import { type Options, fdir } from "fdir";
import { Plugin } from "gramio";
import type { PicomatchOptions } from "picomatch";
import { type SoftString, getPath } from "./utils.js";

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
	 * import a specific `import` from a file
	 * @example import first export
	 * ```ts
	 * import: (file) => Object.keys(file).at(0) || "default",
	 * ```
	 * @default "default"
	 */
	// biome-ignore lint/suspicious/noExplicitAny: import return any
	import?: SoftString<"default"> | ((file: any) => string);
	/**
	 * [Glob patterns](<https://en.wikipedia.org/wiki/Glob_(programming)>)
	 * @default "**\/*.{ts,js,cjs,mjs}"
	 * */
	patterns?: string | string[];
	/**
	 * Throws an error if no matches are found.
	 * @default true
	 */
	failGlob?: boolean;
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
export async function autoload(options?: AutoloadOptions) {
	const failGlob = options?.failGlob ?? true;
	const patterns =
		typeof options?.patterns === "string"
			? [options?.patterns]
			: options?.patterns ?? ["**/*.{ts,js,cjs,mjs}"];
	const pathToAutoload = options?.path ?? "./commands";
	const directoryPath = getPath(pathToAutoload);
	const getImportName = options?.import ?? "default";

	const plugin = new Plugin("@gramio/autoload");

	const paths = await new fdir(options?.fdir || {})
		.globWithOptions(patterns, options?.picomatch || {})
		.crawl(directoryPath)
		.withPromise();

	if (failGlob && paths.length === 0)
		throw new Error(
			"No matches found. You can disable this error by setting the failGlob parameter to false in the options of autoload plugin",
		);

	for await (const filePath of paths) {
		const absolute = String(
			url.pathToFileURL(path.join(directoryPath, filePath)),
		);
		if (options?.onLoad) options.onLoad({ absolute, relative: filePath });

		const file = await import(absolute);

		const importName =
			typeof getImportName === "string" ? getImportName : getImportName(file);

		if (!file[importName])
			throw new Error(`${filePath} don't provide export ${importName}`);

		plugin.group(file[importName]);
	}

	if (options?.onFinish)
		options.onFinish(
			paths.map((filePath) => ({
				absolute: String(url.pathToFileURL(path.join(directoryPath, filePath))),
				relative: filePath,
			})),
		);

	return plugin;
}
