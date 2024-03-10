import { join } from "node:path";
import { type GlobOptionsWithFileTypesTrue, glob } from "glob";
import { Plugin } from "gramio";
import { getPath } from "utils";

export interface AutoloadOptions
	extends Omit<GlobOptionsWithFileTypesTrue, "cwd" | "withFileTypes"> {
	pattern?: string;
	path?: string;
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
		const fullPath = join(directoryPath, path);

		const file = await import(fullPath);
		if (!file.default) throw new Error(`${path} don't provide export default`);

		plugin.group(file.default);
	}

	return plugin;
}
