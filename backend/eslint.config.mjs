import js from "@eslint/js";
import tseslint from 'typescript-eslint';
import globals from "globals";


export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: [
            '*.cjs',
            '*.html',
            'postcss.config.js',
            'eslint.config.mjs',
            'rollup.config.js',
            ".cache/**/*",
            "build/**/*",
            "dist/**/*",
            ".babelrc.js",
            "./index.js",
            "sample/**/*"
        ],
    },
    {
        files: ["*.test.ts", "*.spec.ts", "*.test.tsx", "*.spec.tsx"],
        languageOptions: {
            parser: tseslint.parser,
            globals: {
                ...globals.node,
                ...globals.es2021,
            },
            parserOptions: {
                sourceType: 'module',
                ecmaVersion: 2020,
                project: './tsconfig.spec.json',
            },
        },
    },
    {
        languageOptions: {
            parser: tseslint.parser,
            globals: {
                ...globals.node,
                ...globals.es2021,
            },
            parserOptions: {
                sourceType: 'module',
                ecmaVersion: 2020,
                project: './tsconfig.json',
            },
        },
        rules: {
            "prettier/prettier": "off",
            '@typescript-eslint/no-namespace': 'off',
            // '@typescript-eslint/ban-types': 'error',
            '@typescript-eslint/adjacent-overload-signatures': 'error',
            '@typescript-eslint/array-type': 'error',
            '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
            '@typescript-eslint/no-inferrable-types': 'error',
            '@typescript-eslint/no-misused-new': 'error',
            '@typescript-eslint/no-this-alias': 'error',
            '@typescript-eslint/prefer-for-of': 'error',
            '@typescript-eslint/prefer-function-type': 'error',
            '@typescript-eslint/prefer-namespace-keyword': 'error',
            'no-inner-declarations': 'off', // we have es6blocked scoped functions.
            '@typescript-eslint/triple-slash-reference': 'error',
            // '@typescript-eslint/type-annotation-spacing': 'error',
            '@typescript-eslint/unified-signatures': 'error',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/unbound-method': 'warn',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-unnecessary-type-assertion': 'error',
            'object-curly-spacing': ['error', 'always'],

            '@typescript-eslint/explicit-member-accessibility': [
                'error',
                {
                    accessibility: 'explicit'
                }
            ],
            '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
            'no-console': 'warn',
            'no-return-await': 'error',
            'arrow-body-style': 'error',
            'arrow-parens': [
                'error',
                'always'
            ],
            'comma-dangle': [
                'error',
                {
                    objects: 'never',
                    arrays: 'never',
                    functions: 'never'
                }
            ],
            // 'prefer-arrow/prefer-arrow-functions': 'error',
            'prefer-arrow-callback': 'error',
            'prefer-const': 'error',
            'quote-props': [
                'error',
                'consistent-as-needed'
            ],
            'no-var': 'error',
            'new-parens': 'error',
            'no-caller': 'error',
            'no-cond-assign': 'error',
            'no-debugger': 'error',
            'no-empty': 'error',
            'no-eval': 'error',
            'no-multiple-empty-lines': 'warn',
            'no-new-wrappers': 'error',
            'no-redeclare': 'error',
            'no-shadow': [
                'error',
                {
                    hoist: 'all'
                }
            ],
            'no-throw-literal': 'error',
            'no-trailing-spaces': 'error',
            'no-undef-init': 'error',
            'no-underscore-dangle': 'error',
            'no-unsafe-finally': 'error',
            'no-unused-labels': 'error',
            'spaced-comment': 'error',
            'use-isnan': 'error',
            'max-len': [
                'warn',
                {
                    code: 140
                }
            ],
            'dot-notation': 'error',
            'eqeqeq': 'error',
            'eol-last': 'error',
            'linebreak-style': ['error', 'unix'],
            'block-spacing': ['error', 'always'],
            'object-curly-spacing': ['error', 'always'],
            // 'import/no-deprecated': 'warn', // eslint deprecation rule sucks. just wrns on deprecated IMPORTs
            'tsdoc/syntax': 'off'

            // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
            // e.g. '@typescript-eslint/explicit-function-return-type': 'off',
        },
    },
);