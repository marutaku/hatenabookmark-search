# Hatena Bookmark for Raycast

## 概要

はてなブックマークをRaycastから利用するための拡張機能です。

### 機能
- はてなブックマークの検索
- はてなブックマークのホットエントリーの閲覧

## セットアップ手順

1. このリポジトリをクローンします
```bash
git clone https://github.com/marutaku/hatena-raycast.git
cd hatena-raycast
```

2. 依存パッケージをインストールします
```bash
npm install
```

3. はてなブックマークのAPIキーを取得します
    - はてなブックマークでは[WSSE認証](https://developer.hatena.ne.jp/ja/documents/auth/apis/wsse)を使用しています
    - APIキーはユーザー設定画面の「APIキー」セクションから確認できます

4. 開発モードで起動します
```bash
npm run dev
```

5. Raycast上で以下の設定を行います
    - Username: はてなブックマークのユーザー名
    - API Key: 手順3で取得したAPIキー

## デプロイ方法

1. ビルドを実行します
```bash
npm run build
```

2. Raycastのストアに公開します
```bash
npm run publish
```

注意: 公開には[Raycastの開発者アカウント](https://developers.raycast.com/)が必要です。

## ライセンス

MIT License