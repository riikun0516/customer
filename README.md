# COBIS（Connect Of Business System） - デスクトップランチャー（Electron）

[COBIS Web本体](https://github.com/riikun0516/customer-web.git) を、デスクトップアプリのウィンドウで開くためのシンプルなランチャーです。表示している内容はWeb版と完全に同じで、機能差はありません。Windows / macOS 両対応です。

## できること

- 初回起動時にWeb本体のURLを設定するだけで、以降はそのURLを自動的に開きます
- メニューの「ファイル > 接続先URLを変更」からいつでも接続先を変更可能
- ページ内リンクはアプリ内で遷移し、外部サイトへのリンクはシステムのブラウザで開きます

## 動作要件

- Node.js 18以上を推奨
- 接続先となる [Web本体](https://github.com/riikun0516/customer-web.git) が別途デプロイ済みであること

## セットアップ・開発時の起動

```bash
git clone https://github.com/riikun0516/customer.git
cd customer
npm install
npm start
```

初回起動時に表示される画面で、Web本体のURL（例: `https://your-domain.com/`）を入力してください。

## Win / Mac 向けインストーラーの作成

```bash
npm install

# Windows用（.exe / NSISインストーラー）
npm run dist:win

# Mac用（.dmg）
npm run dist:mac
```

`dist_build/` フォルダに配布用ファイルが生成されます。

- Mac用ビルドはMac環境（またはCI）での実行を推奨します
- アイコンは未設定のためElectronの既定アイコンになります。差し替える場合は `assets/icon.ico`（Windows）・`assets/icon.icns`（Mac）を追加し、`package.json` の `build.win.icon` / `build.mac.icon` に指定してください

## 接続先SSL証明書について

接続先WebアプリはHTTPS（正規のSSL証明書）での公開を前提としています。自己署名証明書やSSL証明書の設定が不完全な場合、Chromiumベースの本アプリでは `ERR_CERT_AUTHORITY_INVALID` 等のエラーで接続できないことがあります。ブラウザで正常に開けるのにこのアプリだけ開けない場合は、まず接続先サーバー側の証明書チェーン（中間証明書の設定など）をご確認ください。

## ディレクトリ構成

```
.
├── main.js              メインプロセス（ウィンドウ制御・接続先URL管理）
├── preload.js            レンダラーへの安全なAPI公開
├── renderer/
│   ├── settings.html     接続先URL設定画面
│   └── settings.js
└── package.json
```

## ライセンス

社内利用を想定した非公開プロジェクトです。
