const msgEl = document.getElementById('msg');
const urlInput = document.getElementById('url');

function showMsg(text) {
  msgEl.textContent = text;
  msgEl.className = 'msg show';
}

(async () => {
  const current = await window.api.settings.get();
  if (current && current.url) {
    urlInput.value = current.url;
  }
})();

async function save() {
  const url = urlInput.value.trim();
  if (!url) {
    showMsg('URLを入力してください');
    return;
  }
  const btn = document.getElementById('btnSave');
  btn.disabled = true;
  btn.textContent = '接続中...';

  const result = await window.api.settings.save({ url });

  btn.disabled = false;
  btn.textContent = '接続';

  if (!result.ok) {
    showMsg(result.message);
  }
  // 成功時は main.js 側でこのウィンドウにWebアプリをロードし直すため、ここでは何もしない
}

document.getElementById('btnSave').addEventListener('click', save);
urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') save();
});
