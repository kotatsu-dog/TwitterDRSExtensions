// ユーザープロフィールページかどうかを判定
function isUserProfilePage() {
  const url = window.location.pathname;
  const match = url.match(/^\/([a-zA-Z0-9_]{1,15})(?:\/|$)/);
  return match && !['explore', 'home', 'messages', 'notifications'].includes(match[1]);
}

// ボタンを追加
function injectSearchButton() {
  if (!isUserProfilePage()) return;

  // 既に挿入済みなら処理しない
  if (document.getElementById('twitter-date-search-btn')) return;

  // ユーザー名を取得
  const userMatch = window.location.pathname.match(/^\/([a-zA-Z0-9_]{1,15})/);
  const username = userMatch ? userMatch[1] : null;
  if (!username) return;

  // 「もっと見る」ボタンを探す
  const moreBtn = document.querySelector('button[aria-label="もっと見る"][data-testid="userActions"]');
  if (!moreBtn) return;

  // その親divを取得
  const container = moreBtn.parentElement;
  if (!container) return;

  // 親divをflex・下揃えに（他の.r-obd0qtには影響しないようstyle属性で指定）
  if (container) {
    container.style.display = 'flex';
    container.style.alignItems = 'flex-start';
  }

  // 新しいボタンを作成
  const button = document.createElement('button');
  button.id = 'twitter-date-search-btn';
  button.setAttribute('type', 'button');
  button.setAttribute('aria-label', '期間検索');
  button.style.cssText = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid #ccc;
    background: transparent;
    cursor: pointer;
    margin-right: 8px;
    transition: all 0.2s;
    color: #1d9bf0;
    vertical-align: middle;
    position: relative;
    top: 0;
  `;
  button.innerHTML = '📅';
  button.onmouseover = () => {
    button.style.background = 'rgba(29, 155, 240, 0.1)';
    button.style.borderColor = '#1d9bf0';
    button.style.opacity = '0.8';
    button.style.transition = 'opacity 0.2s';
  };
  button.onmouseout = () => {
    button.style.background = 'transparent';
    button.style.borderColor = '#ccc';
    button.style.opacity = '1';
  };

  button.onclick = () => showSearchForm(username);

  // 「もっと見る」ボタンの左側に挿入
  container.insertBefore(button, moreBtn);
}

// ポップアップフォームを表示
function showSearchForm(username) {
    // ESCキーで閉じるイベント
    function escCloseHandler(e) {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', escCloseHandler);
      }
    }

  // 既存のモーダルを削除
  const existing = document.getElementById('twitter-date-search-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'twitter-date-search-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;

  const today = new Date().toISOString().split('T')[0];
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: white;
    border-radius: 16px;
    padding: 24px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    color: #0f1419;
  `;

  dialog.innerHTML = `
    <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px; text-align: center;">
      @${username} の期間検索
    </h2>

    <div style="margin-bottom: 16px;">
      <label style="display: block; font-weight: 600; margin-bottom: 8px;">開始日</label>
      <input type="date" id="start-date" value="${oneYearAgo}" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; font-size: 14px;">
    </div>

    <div style="margin-bottom: 16px;">
      <label style="display: block; font-weight: 600; margin-bottom: 8px;">終了日</label>
      <input type="date" id="end-date" value="${today}" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; font-size: 14px;">
    </div>

    <div style="margin-bottom: 24px; display: flex; align-items: center; gap: 8px;">
      <input type="checkbox" id="exclude-replies" style="width: 16px; height: 16px; cursor: pointer;">
      <label for="exclude-replies" style="font-size: 14px; cursor: pointer;">リプライを除外する</label>
    </div>

    <div style="display: flex; gap: 12px; justify-content: center;">
      <button id="search-btn" style="flex: 1; padding: 10px; background: #1d9bf0; color: white; border: none; border-radius: 24px; font-weight: 700; cursor: pointer; font-size: 15px; transition: opacity 0.2s; text-align: center;">
        検索
      </button>
      <button id="cancel-btn" style="flex: 1; padding: 10px; background: transparent; border: 1px solid #ccc; border-radius: 24px; font-weight: 700; cursor: pointer; font-size: 15px; transition: opacity 0.2s; text-align: center;">
        キャンセル
      </button>
    </div>
  `;
  // ボタンのホバーアニメーション
  setTimeout(() => {
    const searchBtn = document.getElementById('search-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    if (searchBtn) {
      searchBtn.onmouseover = () => { searchBtn.style.opacity = '0.8'; };
      searchBtn.onmouseout = () => { searchBtn.style.opacity = '1'; };
    }
    if (cancelBtn) {
      cancelBtn.onmouseover = () => { cancelBtn.style.opacity = '0.8'; };
      cancelBtn.onmouseout = () => { cancelBtn.style.opacity = '1'; };
    }
  }, 0);

  modal.appendChild(dialog);
  document.body.appendChild(modal);

  // ESCキーで閉じるリスナー追加
  setTimeout(() => {
    document.addEventListener('keydown', escCloseHandler);
  }, 0);

  document.getElementById('search-btn').onclick = () => {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const excludeReplies = document.getElementById('exclude-replies').checked;

    if (!startDate || !endDate) {
      alert('開始日と終了日を指定してください');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('開始日が終了日より後になっています');
      return;
    }

    // 検索クエリを生成
    // まだTwitterからXに変わったことを認めたくない。帰ってこいブルーバード。
    let query = `from:${username} since:${startDate} until:${endDate}`;
    if (excludeReplies) query += ' -filter:replies';
    const searchUrl = `https://twitter.com/search?q=${encodeURIComponent(query)}&f=live`;

    // 検索履歴を保存
    chrome.storage.local.get('searchHistory', (data) => {
      const history = data.searchHistory || [];
      history.unshift({
        username,
        startDate,
        endDate,
        excludeReplies,
        timestamp: new Date().toISOString()
      });
      chrome.storage.local.set({ searchHistory: history.slice(0, 20) });
    });

    // 検索結果ページへジャンプ
    window.location.href = searchUrl;
  };

  document.getElementById('cancel-btn').onclick = () => {
    modal.remove();
    document.removeEventListener('keydown', escCloseHandler);
  };
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.remove();
      document.removeEventListener('keydown', escCloseHandler);
    }
  };
}

// ページロード時とSPA遷移時にボタンを挿入
injectSearchButton();
window.addEventListener('popstate', injectSearchButton);

// MutationObserverで動的な要素変更に対応
const observer = new MutationObserver(() => {
  injectSearchButton();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false
});
