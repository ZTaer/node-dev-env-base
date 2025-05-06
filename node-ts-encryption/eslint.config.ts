import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylisticJs from '@stylistic/eslint-plugin-js';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import nodePlugin from 'eslint-plugin-n';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';

export default tseslint.config(
  // 官方推荐配置
  eslint.configs.recommended,

  // Node.js 脚本推荐配置
  nodePlugin.configs['flat/recommended-script'],

  // TypeScript 严格检查配置
  ...tseslint.configs.strictTypeChecked,

  // TypeScript 风格检查配置
  ...tseslint.configs.stylisticTypeChecked,

  // 忽略特定文件
  {
    ignores: ['**/node_modules/*', '**/*.mjs', '**/*.js'],
  },

  // TypeScript 解析器设置
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
  },

  // 插件定义
  {
    plugins: {
      '@stylistic/js': stylisticJs,
      '@stylistic/ts': stylisticTs,
      import: importPlugin,
      prettier: prettierPlugin,
    },
  },

  // 规则定义
  {
    rules: {
      /*** import 插件规则 ***/
      'import/newline-after-import': 'error',
      'import/order': 'error',
      'import/first': 'error',
      'import/no-unresolved': 'off',

      /*** 通用 JS/TS 代码风格 ***/
      'prefer-const': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'comma-dangle': ['warn', 'always-multiline'],
      'no-extra-boolean-cast': 0,
      quotes: ['warn', 'single'],
      'max-len': ['warn', { code: 80 }],

      /*** stylistic 风格相关 ***/
      '@stylistic/js/no-extra-semi': 'warn',
      '@stylistic/ts/semi': ['warn', 'always'],
      '@stylistic/ts/member-delimiter-style': [
        'warn',
        {
          multiline: { delimiter: 'comma', requireLast: true },
          singleline: { delimiter: 'comma', requireLast: false },
          overrides: {
            interface: {
              singleline: { delimiter: 'semi', requireLast: false },
              multiline: { delimiter: 'semi', requireLast: true },
            },
          },
        },
      ],

      /*** TypeScript 专用规则 ***/
      '@typescript-eslint/explicit-member-accessibility': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
      '@typescript-eslint/restrict-plus-operands': [
        'warn',
        { allowNumberAndString: true },
      ],
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-shadow': 'warn',
      '@typescript-eslint/no-misused-promises': 0,
      '@typescript-eslint/no-floating-promises': 0,
      '@typescript-eslint/no-confusing-void-expression': 0,
      '@typescript-eslint/no-unsafe-enum-comparison': 0,
      '@typescript-eslint/no-unnecessary-type-parameters': 0,
      '@typescript-eslint/no-unnecessary-condition': 0,
      '@typescript-eslint/no-non-null-assertion': 0,
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/indent': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/semi': 'off',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      // 允许使用 any
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',

      /*** Node 插件规则 ***/
      'n/no-process-env': 1,
      'n/no-missing-import': 0,
      'n/no-unpublished-import': 0,

      /*** 其他语法优化规则 ***/
      'arrow-body-style': ['off', 'as-needed'],
      indent: 'off',
      semi: 'off',
      'consistent-return': 'warn',
      'array-callback-return': 'warn',
      'prefer-destructuring': 'off',
      'no-param-reassign': 'off',
      'no-else-return': 'off',
      'no-plusplus': 'warn',
      'no-restricted-globals': 'off',
      'no-unneeded-ternary': 'off',

      /*** Prettier 规则集成 ***/
      'prettier/prettier': [
        'warn',
        {
          semi: true,
          singleQuote: true,
          printWidth: 80,
          trailingComma: 'all',
          endOfLine: 'auto',
        },
      ],
    },
  },
);
