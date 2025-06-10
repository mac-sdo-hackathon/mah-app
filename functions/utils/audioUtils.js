/**
 * 音声処理関連のユーティリティ関数
 */

/**
 * Base64データをBlobに変換
 * @param {string} base64 - Base64エンコードされたデータ
 * @param {string} mimeType - MIMEタイプ
 * @returns {Blob} - Blobオブジェクト
 */
function base64ToBlob(base64, mimeType) {
  console.log('Converting base64 to blob:', base64.slice(0, 100));
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length)
    .fill(0)
    .map((_, i) => byteCharacters.charCodeAt(i));
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Base64データをBufferに変換（Node.js環境用）
 * @param {string} base64 - Base64エンコードされたデータ
 * @returns {Buffer} - Bufferオブジェクト
 */
function base64ToBuffer(base64) {
  return Buffer.from(base64, 'base64');
}

module.exports = {
  base64ToBlob,
  base64ToBuffer,
};
