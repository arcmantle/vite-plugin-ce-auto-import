import { existsSync, readFileSync } from 'node:fs';

import type { PluginOption, ResolvedConfig } from 'vite';

import { createTagCache, getUsedTags } from './tag-cache.js';


export interface AutoImportPluginProps {
	directories:    { path: string; whitelist?: RegExp[]; blacklist?: RegExp[]; }[];
	prefixes:       RegExp[];
	loadWhitelist:  RegExp[];
	loadBlacklist?: RegExp[];
	cache?:         Map<string, string>;
}

export interface AutoImportLoadProps {
	id:             string;
	config:         ResolvedConfig;
	cache:          Map<string, string>;
	prefixes:       RegExp[];
	loadWhitelist:  RegExp[];
	loadBlacklist?: RegExp[];
	tagPattern?:    RegExp;
}


export const componentAutoImportLoad = (props: AutoImportLoadProps): string | undefined => {
	const {
		id,
		config,
		cache,
		prefixes,
		loadWhitelist,
		loadBlacklist,
		tagPattern,
	} = props;

	const whitelisted = loadWhitelist?.some(reg => reg.test(id)) ?? true;
	const blacklisted = loadBlacklist?.some(reg => reg.test(id)) ?? false;
	if (!whitelisted || blacklisted)
		return;

	if (!existsSync(id))
		return;

	let code = readFileSync(id, { encoding: 'utf8' });

	const tagsUsed = getUsedTags(code, prefixes, tagPattern);
	if (!tagsUsed.size)
		return;

	/* for each tag, create an import statement that uses the previously cached component path. */
	const imports = Array
		.from(tagsUsed)
		.filter(tag => cache.has(tag))
		.map(tag => `import '${ cache.get(tag)
			?.replaceAll('\\', '/')
			.replace(config.root, '')
			.replace('.ts', '.js')
		}';`);

	const msg = `/* Component imports injected from: @arcmantle/vite-plugin-ce-auto-import */`;
	imports.unshift(msg);
	imports.push(`/*  */`);

	code = imports.join('\n') + '\n' + code;

	return code;
};

export const componentAutoImporter = (props: AutoImportPluginProps): PluginOption => {
	const {
		cache = new Map(),
		directories,
		prefixes,
		loadWhitelist,
		loadBlacklist,
	} = props;

	let config: ResolvedConfig;
	const tagPattern = /<\/([\w-]+)>/g;

	return {
		name:    'vite-plugin-ce-auto-import',
		enforce: 'pre',

		configResolved(cfg) {
			config = cfg;
		},

		async buildStart() {
			await createTagCache({
				directories,
				cache,
			});
		},

		load(id) {
			const transformed = componentAutoImportLoad({
				id,
				config,
				cache,
				prefixes,
				loadWhitelist,
				loadBlacklist,
				tagPattern,
			});

			if (transformed)
				return transformed;
		},
	} satisfies PluginOption;
};
