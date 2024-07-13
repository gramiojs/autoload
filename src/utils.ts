import path from "node:path";
import process from "node:process";

export function getPath(dir: string) {
	if (path.isAbsolute(dir)) return dir;
	if (path.isAbsolute(process.argv[1]))
		return path.join(process.argv[1], "..", dir);

	return path.join(process.cwd(), process.argv[1], "..", dir);
}
export type SoftString<T extends string> = T | (string & {});
