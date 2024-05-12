// @ts-nocheck
import { isAbsolute, join } from "node:path";

export function getPath(dir: string) {
	if (typeof process === "undefined") return dir;

	if (isAbsolute(dir)) return dir;
	if (isAbsolute(process.argv[1])) return join(process.argv[1], "..", dir);

	return join(process.cwd(), process.argv[1], "..", dir);
}
