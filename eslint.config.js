import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default [
	{ ignores: ['dist/**', 'node_modules/**'] },
	...ts.config(
		js.configs.recommended,
		...(ts.configs?.recommended ?? []),
		...(svelte.configs?.recommended ?? []),
		prettier,
		...(svelte.configs?.prettier ?? []),
		{
			languageOptions: {
				globals: { ...globals.browser, ...globals.node }
			},
			rules: {
				'no-undef': 'off',
				'svelte/no-navigation-without-resolve': 'off',
				'svelte/prefer-svelte-reactivity': 'off',
				'svelte/no-at-html-tags': 'off',
				'svelte/no-useless-mustaches': 'off'
			}
		},
		{
			files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
			languageOptions: {
				parserOptions: {
					projectService: true,
					extraFileExtensions: ['.svelte'],
					parser: ts.parser,
					svelteConfig
				}
			}
		}
	)
];
