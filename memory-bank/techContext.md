# 技術コンテキスト

## 開発環境

- Node.js
- pnpm (パッケージマネージャー)
- TypeScript
- Raycast拡張機能開発環境

## 主要な依存関係

1. Raycast関連
   - @raycast/api: ^1.94.0
   - @raycast/utils: ^1.17.0

2. React関連
   - react: ^19.1.0
   - react-dom: ^19.1.0
   - @types/react: 19.0.10

3. テスト関連
   - vitest: ^3.0.9
   - @testing-library/react: ^16.2.0
   - @testing-library/react-hooks: ^8.0.1
   - jsdom: ^26.0.0

4. 開発ツール
   - typescript: ^5.8.2
   - eslint: ^9.22.0
   - prettier: ^3.5.3

## ビルド・開発スクリプト

- `ray build`: 拡張機能のビルド
- `ray develop`: 開発モードでの実行
- `ray lint`: コードの静的解析
- `vitest`: テストの実行

## 開発フロー

1. コード品質管理
   - ESLintによる静的解析
   - Prettierによるコードフォーマット
   - TypeScriptによる型チェック

2. テスト戦略
   - ユニットテスト（Vitest）
   - Reactコンポーネントテスト
   - カスタムフックのテスト

3. 開発プロセス
   - TypeScriptでの実装
   - ESLint/Prettierによるコード整形
   - テストの実行
   - Raycast拡張機能としてのビルド
