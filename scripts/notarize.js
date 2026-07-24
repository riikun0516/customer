const { notarize } = require('@electron/notarize');

/**
 * electron-builder の afterSign フック。
 * Mac用ビルド（npm run dist:mac）完了後、コード署名済みの .app をAppleに送信して公証を行う。
 *
 * 必要な環境変数（未設定の場合は公証をスキップし、警告を出して続行する）:
 *   APPLE_ID                     Apple ID（メールアドレス）
 *   APPLE_APP_SPECIFIC_PASSWORD  appleid.apple.com で発行したApp用パスワード
 *   APPLE_TEAM_ID                developer.apple.com のメンバーシップページに記載のチームID
 *
 * コード署名自体は electron-builder が自動的に行う（ログイン用キーチェーンに
 * "Developer ID Application" 証明書がインストールされていれば自動検出される）。
 */
exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const { APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, APPLE_TEAM_ID } = process.env;

  if (!APPLE_ID || !APPLE_APP_SPECIFIC_PASSWORD || !APPLE_TEAM_ID) {
    console.log(
      '[notarize] APPLE_ID / APPLE_APP_SPECIFIC_PASSWORD / APPLE_TEAM_ID が未設定のため、公証をスキップします。' +
      '（配布用ビルドではこれらを設定してください）'
    );
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appBundleId = context.packager.config.appId;

  console.log(`[notarize] ${appName}.app の公証を開始します（数分かかることがあります）...`);

  await notarize({
    appBundleId,
    appPath: `${appOutDir}/${appName}.app`,
    appleId: APPLE_ID,
    appleIdPassword: APPLE_APP_SPECIFIC_PASSWORD,
    teamId: APPLE_TEAM_ID,
  });

  console.log('[notarize] 公証が完了しました。');
};
