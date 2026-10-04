import {
	access,
	copyFile,
	cp,
	readdir,
	readFile,
	writeFile,
} from "node:fs/promises";

const sourceDirectory = "dist/server";
const bundleDirectory = ".cloudflare/output/v0/workers/default/bundle";
const workerConfigPath = ".cloudflare/output/v0/workers/default/worker.config.json";
const staticSourceDirectory = `${sourceDirectory}/_next/static`;
const staticBundleDirectory = `${bundleDirectory}/_next/static`;

const generatedFiles = (await readdir(sourceDirectory)).filter(
	(fileName) => fileName.endsWith(".js")
);

await access(workerConfigPath);

const workerConfig = JSON.parse(await readFile(workerConfigPath, "utf8"));
workerConfig.manifest ??= {};
workerConfig.manifest.modules ??= {};

for (const fileName of generatedFiles) {
	await copyFile(
		`${sourceDirectory}/${fileName}`,
		`${bundleDirectory}/${fileName}`
	);
	workerConfig.manifest.modules[fileName] = { type: "esm" };
}

await cp(staticSourceDirectory, staticBundleDirectory, {
	recursive: true,
	force: true,
});

const staticFiles = await readdir(staticSourceDirectory, {
	recursive: true,
});

for (const fileName of staticFiles) {
	if (fileName.endsWith(".js")) {
		workerConfig.manifest.modules[`_next/static/${fileName}`] = {
			type: "esm",
		};
	}
}

await writeFile(workerConfigPath, `${JSON.stringify(workerConfig)}\n`);

console.log(`Copied ${generatedFiles.length} Vinext sidecars to the Cloudflare Worker bundle.`);
