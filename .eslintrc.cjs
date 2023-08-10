module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        "plugin:svelte/recommended",
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
    ],
	plugins: ['@typescript-eslint', "unused-imports"],
	ignorePatterns: ['*.cjs'],
	overrides: [{
        files: ['*.svelte'],
        parser: "svelte-eslint-parser",
        parserOptions: {
            parser: "@typescript-eslint/parser",
          },
     }],
	parserOptions: {
		sourceType: 'module',
        ecmaVersion: 2020,
        project: './tsconfig.json',
        extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
    },
    rules: {
        'quotes': ['warn', 'single'],
        'semi': ['error', 'always'],
        'comma-dangle': ['warn', 'never'],
        'quote-props': ['warn', 'as-needed'],
        '@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true }],
        '@typescript-eslint/indent': ['warn', 4],
        'svelte/indent': ['warn', { indent: 4, indentScript: false }],
        'unused-imports/no-unused-imports': 'warn',
    }
};