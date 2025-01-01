import { bench, run, summary } from "mitata";
import { fdir } from "fdir"
import { join } from "node:path";
import fs from "node:fs"

const PATTERN = "**/*.{ts,js,cjs,mjs}";
const directoryPath = join(process.cwd(), "..");

const IS_BUN = typeof Bun !== "undefined";

summary(() => {
	bench("fdir", () => {
		const paths = new fdir()
		.withRelativePaths()
		.globWithOptions([PATTERN], { })
		.crawl(directoryPath)
		.sync();
	});

	if(!IS_BUN) bench("fs.globSync", () => {
		const paths = fs.globSync(PATTERN, { cwd: directoryPath });
	});

	if(IS_BUN) bench("Bun.glob", () => {
		const paths = new Bun.Glob(PATTERN).scanSync({cwd: directoryPath});
	});
});

await run();