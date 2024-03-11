import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { type GlobOptionsWithFileTypesTrue, glob } from "glob";
import { Plugin } from "gramio";
import { getPath } from "utils";

export interface AutoloadOptionsPathParams {
	absolute: string;
	relative: string;
}

export interface AutoloadOptions
	extends Omit<GlobOptionsWithFileTypesTrue, "cwd" | "withFileTypes"> {
	pattern?: string;
	path?: string;
	onLoad?: (path: AutoloadOptionsPathParams) => unknown;
	onFinish?: (paths: AutoloadOptionsPathParams[]) => unknown;
}

export async function autoload(options?: AutoloadOptions) {
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
