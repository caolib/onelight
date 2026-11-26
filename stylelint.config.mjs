// 只做「语法/低级错误 + 颜色集中」两类检查，不套完整风格规范，
// 避免主题里大量的 !important、选择器覆盖被刷成噪音。
export default {
  customSyntax: 'postcss-scss',
  plugins: ['stylelint-scss'],
  rules: {
    'block-no-empty': true,
    // 颜色字面量只允许出现在 abstracts 变量文件里（见下方 overrides）
    'color-no-hex': true,
    'color-named': 'never',
    'declaration-block-no-duplicate-properties': [
      true,
      { ignore: ['consecutive-duplicates-with-different-values'] },
    ],
    'property-no-unknown': true,
    'selector-pseudo-element-no-unknown': true,
    'unit-no-unknown': true,
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': true,
  },
  overrides: [
    {
      files: ['src/abstracts/**/*.scss'],
      rules: {
        'color-no-hex': null,
        'color-named': null,
      },
    },
  ],
};
