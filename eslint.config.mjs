import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import perfectionistPlugin from 'eslint-plugin-perfectionist'
import prettierPlugin from 'eslint-plugin-prettier'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const memberGroups = {
    customGroups: [
        { elementNamePattern: '^(id|uuid)$', groupName: 'identity' },
        { elementNamePattern: '^on[A-Z]', groupName: 'callbacks' },
    ],
    groups: ['identity', 'unknown', 'callbacks'],
    order: 'asc',
    type: 'alphabetical',
}

const eslintConfig = defineConfig([
    js.configs.recommended,
    ...tseslint.configs.recommended,
    reactHooks.configs.flat.recommended,
    reactRefresh.configs.vite,
    globalIgnores([
        'dist/**',
        '.wrangler/**',
        '.superpowers/**',
        'out/**',
        'playwright-report/**',
        'test-results/**',
    ]),
    {
        files: ['**/*.{ts,tsx,js,jsx,mjs}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            import: importPlugin,
            perfectionist: perfectionistPlugin,
            prettier: prettierPlugin,
            react: reactPlugin,
        },
        rules: {
            ...eslintConfigPrettier.rules,
            '@typescript-eslint/consistent-type-imports': [
                'error',
                { prefer: 'type-imports' },
            ],
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            'import/order': [
                'error',
                {
                    'alphabetize': { caseInsensitive: true, order: 'asc' },
                    'groups': [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index',
                    ],
                    'newlines-between': 'always',
                    'pathGroups': [
                        {
                            group: 'external',
                            pattern: 'react',
                            position: 'before',
                        },
                        {
                            group: 'external',
                            pattern: 'react-*',
                            position: 'before',
                        },
                        {
                            group: 'internal',
                            pattern: '@/**',
                            position: 'after',
                        },
                    ],
                    'pathGroupsExcludedImportTypes': ['react'],
                },
            ],
            'no-console': ['warn', { allow: ['error'] }],
            'no-unused-vars': 'error',
            'perfectionist/sort-interfaces': ['error', memberGroups],
            'perfectionist/sort-named-imports': [
                'warn',
                { order: 'asc', type: 'alphabetical' },
            ],
            'perfectionist/sort-object-types': ['error', memberGroups],
            'perfectionist/sort-objects': [
                'warn',
                {
                    customGroups: [
                        {
                            elementNamePattern: '^on[A-Z]',
                            groupName: 'callbacks',
                        },
                    ],
                    groups: ['unknown', 'callbacks'],
                    order: 'asc',
                    type: 'alphabetical',
                },
            ],
            'prettier/prettier': 'error',
            'react/jsx-no-bind': [
                'error',
                {
                    allowArrowFunctions: false,
                    allowBind: false,
                    allowFunctions: false,
                    ignoreDOMComponents: false,
                },
            ],
            'react/jsx-sort-props': [
                'warn',
                {
                    callbacksLast: true,
                    ignoreCase: true,
                    locale: 'auto',
                    multiline: 'last',
                    reservedFirst: ['key', 'ref'],
                    shorthandFirst: true,
                    shorthandLast: false,
                },
            ],
            'react/no-unstable-nested-components': 'off',
        },
        settings: {
            'import/resolver': {
                typescript: true,
            },
        },
    },
    {
        files: ['src/components/ui/**'],
        rules: {
            'react-refresh/only-export-components': 'off',
        },
    },
    {
        files: ['**/*.types.ts', '**/*.d.ts'],
        rules: {
            'no-unused-vars': 'off',
        },
    },
])

export default eslintConfig
