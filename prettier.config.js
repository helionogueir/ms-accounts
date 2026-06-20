export default {
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  printWidth: 80,
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  bracketSpacing: true,
  overrides: [
    {
      files: '.prettierrc',
      options: {
        parser: 'json',
      },
    },
  ],
  importOrder: [
    '<THIRD_PARTY_MODULES>',
    '^src/domain/(.*)$',
    '^src/application/(.*)$',
    '^src/presentation/(.*)$',
    '^src/infrastructure/(.*)$',
    '^[./]',
  ],
  importOrderParserPlugins: ['typescript', 'decorators-legacy'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}
