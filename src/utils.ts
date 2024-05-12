import { isAbsolute, join } from "node:path";

export function getPath(dir: string) {
	// @ts-ignore Deno moment
	if (typeof process === "undefined") return dir;

	if (isAbsolute(dir)) return dir;
	// @ts-ignore Deno moment
	if (isAbsolute(process.argv[1])) return join(process.argv[1], "..", dir);

	// @ts-ignore Deno moment
	return join(process.cwd(), process.argv[1], "..", dir);
}
