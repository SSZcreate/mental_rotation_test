/**
 * experiment.js
 * 
 * Main experimental timeline controller for Vandenberg & Kuse MRT
 */

// URLパラメータから初期参加者IDを取得する関数（任意）
function getInitialParticipantId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id') || 
         urlParams.get('participant_id') || 
         urlParams.get('pid') || 
         urlParams.get('subject') || 
         '';
}

let PARTICIPANT_ID = getInitialParticipantId();

// jsPsych インスタンスの初期化
const jsPsych = initJsPsych({
  on_finish: function() {
    renderResultsScreen();
  }
});

// 実験全体のタイムライン
const timeline = [];

// 1. ウェルカム & 参加者ID入力画面
const welcomeScreen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function() {
    const defaultVal = PARTICIPANT_ID;
    return `
      <div class="mrt-guide-container">
        <div class="mrt-guide-header">
          <h2 class="mrt-guide-title">${MRT_CONFIG.title}</h2>
          <div class="mrt-guide-subtitle">${MRT_CONFIG.subtitle}</div>
        </div>

        <!-- 参加者ID入力欄 -->
        <div class="participant-input-card">
          <label class="input-label" for="mrt-id-field">
            👤 <strong>参加者ID</strong> を入力してください <span style="color: #f87171;">*</span>
          </label>
          <div class="input-group-row">
            <input type="text" id="mrt-id-field" class="mrt-text-input" placeholder="例: P001、学籍番号、氏名など" value="${defaultVal}">
          </div>
          <div id="mrt-id-error" class="input-error-tip" style="display: none;">
            ⚠️ 参加者IDを入力してください
          </div>
        </div>

        <div class="guide-section">
          <h4>📋 テスト概要</h4>
          <p style="margin-bottom: 8px;">
            本テストは、頭の中で立体図形を回転させて把握する<strong>「3次元空間構造理解能力」</strong>を測定する心理学テストです。
          </p>
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); padding: 6px 14px; border-radius: 20px; font-size: 0.9rem; color: #38bdf8; font-weight: 600;">
            ⏱️ 想定所要時間: 約 5〜10分
          </div>
        </div>

        <div class="guide-section">
          <h4>⚙️ 実験の進め方</h4>
          <ul>
            <li>画面の左側に<strong>「基準図形（Target）」</strong>が提示されます。</li>
            <li>右側の4つの選択肢の中に、基準図形を空間内で回転させた<strong>「同じ図形」が正確に2つ</strong>含まれています。</li>
            <li>残り2つは、裏返し（鏡像・反転）になっている異なる図形です。</li>
            <li>正しい図形を<strong>2つ選択（クリック）</strong>して「次へ進む」を押してください。</li>
          </ul>
        </div>

        <div class="mrt-footer" style="margin-top: 30px;">
          <button id="btn-start-practice" class="btn-action" onclick="handleStartExperiment()">
            練習を開始する
          </button>
        </div>
      </div>

      <!-- 枠外の目立たないCSV確認リンク（ホバー時に変化） -->
      <div class="viewer-outside-wrap">
        <button type="button" class="viewer-subtle-outside-btn" onclick="openCsvViewerModal()">
          <span class="btn-icon">📁</span> 保存済みデータ (CSV) を読み込む
        </button>
      </div>

      <!-- CSVデータ読み込み用モーダルダイアログ -->
      <div id="csv-viewer-modal" class="modal-backdrop" style="display: none;">
        <div class="modal-card">
          <div class="modal-header">
            <h3 style="font-family: var(--font-heading); font-size: 1.3rem; color: var(--primary);">
              📁 実験結果データ (CSV) の確認
            </h3>
            <button type="button" class="modal-close-btn" onclick="closeCsvViewerModal()">✕</button>
          </div>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 12px; line-height: 1.5;">
            Google フォームからコピーした結果テキスト、または保存した CSV ファイルを読み込んで結果画面を再現・表示します。
          </p>

          <div style="margin-bottom: 14px;">
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #cbd5e1; margin-bottom: 6px;">
              CSVテキストの貼り付け：
            </label>
            <textarea id="modal-csv-input" class="modal-textarea" placeholder="ここにCSVテキスト（またはGoogleフォームの回答）を貼り付けてください..."></textarea>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 18px;">
            <div>
              <label for="modal-file-input" class="btn-upload-label">
                📂 CSVファイルを選択
              </label>
              <input type="file" id="modal-file-input" accept=".csv,text/csv,text/plain" style="display: none;" onchange="handleCsvFileSelected(event)">
              <span id="modal-filename-display" style="font-size: 0.82rem; color: var(--text-muted); margin-left: 8px;"></span>
            </div>
            <div id="modal-error-msg" style="color: #f87171; font-size: 0.85rem; display: none; font-weight: 600;"></div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" class="btn-secondary" onclick="closeCsvViewerModal()">キャンセル</button>
            <button type="button" class="btn-action" style="padding: 10px 24px; font-size: 0.95rem;" onclick="processAndRenderCsv()">
              結果を表示する
            </button>
          </div>
        </div>
      </div>
    `;
  },
  choices: "NO_KEYS",
  on_load: function() {
    const inputEl = document.getElementById('mrt-id-field');
    if (inputEl) {
      inputEl.focus();
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          handleStartExperiment();
        }
      });
      inputEl.addEventListener('input', () => {
        const errorEl = document.getElementById('mrt-id-error');
        if (errorEl) errorEl.style.display = 'none';
        inputEl.classList.remove('input-invalid');
      });
    }
  }
};
timeline.push(welcomeScreen);

// スタートボタン処理
window.handleStartExperiment = function() {
  const inputEl = document.getElementById('mrt-id-field');
  const errorEl = document.getElementById('mrt-id-error');
  const val = inputEl ? inputEl.value.trim() : '';

  if (!val) {
    if (errorEl) {
      errorEl.style.display = 'block';
    }
    if (inputEl) {
      inputEl.focus();
      inputEl.classList.add('input-invalid');
    }
    return;
  }

  PARTICIPANT_ID = val;
  jsPsych.data.addProperties({ participant_id: PARTICIPANT_ID });
  jsPsych.finishTrial();
};

// 2. 練習試行 (Practice Items) - 操作に慣れるための試行（解説・正誤フィードバックなし）
MRT_ITEMS.practice.forEach((item) => {
  timeline.push({
    type: jsPsychMentalRotation,
    trial_id: item.id,
    preamble: item.preamble,
    target: item.target,
    choices: item.choices,
    is_practice: false,
    button_label: "次へ"
  });
});

// 3. 練習問題終了・正誤確認 & 本番テスト開始アナウンス
timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function() {
    // 練習試行（trial_id が practice_ で始まるもの）のデータを抽出
    const practiceTrials = jsPsych.data.get().filterCustom(trial => trial.trial_id && trial.trial_id.startsWith('practice_'));
    
    let practiceRowsHtml = '';
    practiceTrials.values().forEach((t, idx) => {
      const pNum = idx + 1;
      const isCorrect = (t.is_full_correct === 1);
      const badgeClass = isCorrect ? 'badge-correct' : 'badge-incorrect';
      const badgeText = isCorrect ? '⭕ 正解' : '❌ 不正解';
      const yourChoices = t.selected_labels ? t.selected_labels.replace(/;/g, ', ') : '-';
      const correctChoices = t.correct_labels ? t.correct_labels.replace(/;/g, ', ') : '-';

      practiceRowsHtml += `
        <tr class="${isCorrect ? 'row-correct' : 'row-incorrect'}">
          <td style="font-weight: 600;">練習 ${pNum}</td>
          <td><span class="choice-tag">${yourChoices}</span></td>
          <td><span class="choice-tag correct-tag">${correctChoices}</span></td>
          <td><span class="result-badge ${badgeClass}">${badgeText}</span></td>
        </tr>
      `;
    });

    return `
      <div class="mrt-guide-container" style="text-align: center; max-width: 700px;">
        <h2 class="mrt-guide-title" style="margin-bottom: 12px;">練習問題の結果</h2>
        <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 18px;">
          練習問題（2問）の正誤結果です。
        </p>

        <div class="breakdown-table-wrapper" style="margin-bottom: 24px;">
          <table class="breakdown-table">
            <thead>
              <tr>
                <th>問題</th>
                <th>あなたの回答</th>
                <th>正解</th>
                <th>判定</th>
              </tr>
            </thead>
            <tbody>
              ${practiceRowsHtml}
            </tbody>
          </table>
        </div>

        <div class="guide-section" style="text-align: left; background: rgba(15, 23, 42, 0.5); padding: 16px 20px; border-radius: var(--radius-sm); margin-bottom: 24px;">
          <p style="font-size: 0.95rem; color: #cbd5e1; line-height: 1.7; margin: 0;">
            ⚠️ <strong>本番テストの注意点</strong><br>
            ここからは全 <strong>${MRT_ITEMS.test.length} 問</strong> の本番問題が始まります。<br>
            本番中は途中での正誤表示はありません（すべて終了した後にまとめて一覧が表示されます）。
          </p>
        </div>

        <button class="btn-action" onclick="jsPsych.finishTrial()">本番テストを開始する</button>
      </div>
    `;
  },
  choices: "NO_KEYS"
});

// 6. 本番テスト試行 (Main Items)
MRT_ITEMS.test.forEach((item) => {
  timeline.push({
    type: jsPsychMentalRotation,
    trial_id: item.id,
    preamble: item.preamble,
    target: item.target,
    choices: item.choices,
    is_practice: false,
    button_label: "次へ"
  });
});

// 実験開始
jsPsych.run(timeline);


// =========================================================================
// 7. 結果画面 & Google フォーム連携 & CSVビュアー
// =========================================================================

// 通常の実験終了時ハンドラー
function renderResultsScreen() {
  const allData = jsPsych.data.get();
  const testTrials = allData.filterCustom(trial => trial.trial_id && trial.trial_id.startsWith('item_'));
  
  const totalItems = testTrials.count();
  let fullCorrectCount = 0;
  let totalRT = 0;
  const trialsList = [];

  testTrials.values().forEach((t, idx) => {
    const isCorrect = (t.is_full_correct === 1);
    if (isCorrect) fullCorrectCount++;
    totalRT += (t.rt || 0);

    trialsList.push({
      itemNum: idx + 1,
      trialId: t.trial_id,
      selectedLabels: t.selected_labels ? t.selected_labels.replace(/;/g, ', ') : '-',
      correctLabels: t.correct_labels ? t.correct_labels.replace(/;/g, ', ') : '-',
      isCorrect: isCorrect,
      rtSec: (t.rt ? (t.rt / 1000).toFixed(2) : '0.00') + 's'
    });
  });

  const accuracyPct = totalItems > 0 ? Math.round((fullCorrectCount / totalItems) * 100) : 0;
  const avgRT = totalItems > 0 ? (totalRT / totalItems / 1000).toFixed(2) : 0;
  const rawCsv = allData.csv();
  const exportPayload = `Participant_ID: ${PARTICIPANT_ID}\nDate: ${new Date().toISOString()}\nAccuracy: ${accuracyPct}%\nAvg_RT_sec: ${avgRT}\n---\n${rawCsv}`;

  renderResultsDashboard({
    participantId: PARTICIPANT_ID,
    totalItems: totalItems,
    fullCorrectCount: fullCorrectCount,
    accuracyPct: accuracyPct,
    avgRT: avgRT,
    exportPayload: exportPayload,
    trialsList: trialsList,
    isViewerMode: false
  });
}

// 汎用結果画面レンダラー（実験終了後 ＆ 外部CSV読み込み時の両方で使用）
function renderResultsDashboard(data) {
  window.scrollTo(0, 0);

  let breakdownRowsHtml = '';
  data.trialsList.forEach(t => {
    const badgeClass = t.isCorrect ? 'badge-correct' : 'badge-incorrect';
    const badgeText = t.isCorrect ? '⭕ 正解' : '❌ 不正解';

    breakdownRowsHtml += `
      <tr class="${t.isCorrect ? 'row-correct' : 'row-incorrect'}">
        <td style="font-weight: 600;">第${t.itemNum}問</td>
        <td><span class="choice-tag">${t.selectedLabels}</span></td>
        <td><span class="choice-tag correct-tag">${t.correctLabels}</span></td>
        <td><span class="result-badge ${badgeClass}">${badgeText}</span></td>
        <td style="color: var(--text-muted); font-size: 0.9rem;">${t.rtSec}</td>
      </tr>
    `;
  });

  document.body.innerHTML = `
    <div class="results-card">
      <div class="results-header">
        <h2 class="results-title">${data.isViewerMode ? "📁 結果データの確認" : "🎉 実験終了"}</h2>
        <p style="color: var(--text-muted);">
          ${data.isViewerMode ? "読み込んだCSVデータの結果サマリーと正誤一覧です。" : "Mental Rotations Test の全試行が完了しました。ご協力ありがとうございました。"}
        </p>
      </div>

      <!-- スコアサマリー -->
      <div class="results-summary-grid">
        <div class="summary-stat-box">
          <div class="stat-value">${data.fullCorrectCount} / ${data.totalItems}</div>
          <div class="stat-label">正答数 (完全一致)</div>
        </div>
        <div class="summary-stat-box">
          <div class="stat-value">${data.accuracyPct}%</div>
          <div class="stat-label">正答率</div>
        </div>
        <div class="summary-stat-box">
          <div class="stat-value">${data.avgRT}s</div>
          <div class="stat-label">平均回答時間</div>
        </div>
      </div>

      <!-- データエリア -->
      <div class="data-section">
        <h4 style="color: var(--primary); margin-bottom: 8px; font-size: 1.05rem;">
          📋 ${data.isViewerMode ? "読み込んだCSVデータ" : "実験結果データ（Google フォーム送信欄）"}
        </h4>
        <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.5; margin-bottom: 10px;">
          ${data.isViewerMode ? "読み込まれたCSVの生データです。" : "以下のボタンを押してデータをコピーし、<strong>Google フォームの回答欄に貼り付けて送信</strong>してください。"}
        </p>
        <textarea id="mrt-data-export" class="data-textarea" readonly>${data.exportPayload}</textarea>
      </div>

      <!-- アクションボタン群 -->
      <div class="button-group-row">
        <button id="btn-copy-data" class="btn-action" style="font-size: 1.05rem; padding: 12px 32px;">
          📋 データをコピーする
        </button>
        <button id="btn-download-csv" class="btn-secondary">
          💾 CSV保存 (バックアップ)
        </button>
        ${data.isViewerMode ? `
          <button type="button" class="btn-secondary" onclick="location.reload()">
            ← スタート画面に戻る
          </button>
        ` : ""}
      </div>

      <!-- 問題ごとの正誤一覧（下部） -->
      <div class="breakdown-section">
        <div class="breakdown-header">
          <h4 style="color: var(--text-main); font-size: 1.15rem; font-weight: 700; margin-bottom: 4px;">
            📊 問題ごとの正誤一覧
          </h4>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 14px;">
            各問題で選択した回答と正解の内訳です（全${data.totalItems}問）。
          </p>
        </div>
        <div class="breakdown-table-wrapper">
          <table class="breakdown-table">
            <thead>
              <tr>
                <th>問題</th>
                <th>あなたの回答</th>
                <th>正解</th>
                <th>判定</th>
                <th>回答時間</th>
              </tr>
            </thead>
            <tbody>
              ${breakdownRowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- トースト通知 -->
    <div id="toast-message" class="toast-msg">✅ データをクリップボードにコピーしました！</div>
  `;

  // クリップボードコピー処理
  const copyBtn = document.getElementById("btn-copy-data");
  const dataArea = document.getElementById("mrt-data-export");
  const toast = document.getElementById("toast-message");

  copyBtn.addEventListener("click", async () => {
    dataArea.select();
    try {
      await navigator.clipboard.writeText(dataArea.value);
      showToast("✅ データをクリップボードにコピーしました！");
    } catch (err) {
      document.execCommand("copy");
      showToast("✅ データをコピーしました！");
    }
  });

  // CSVダウンロード処理
  const downloadBtn = document.getElementById("btn-download-csv");
  downloadBtn.addEventListener("click", () => {
    const blob = new Blob([data.exportPayload], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mrt_result_${data.participantId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("💾 CSVファイルを保存しました");
  });

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }
}


// =========================================================================
// 8. CSV パーサー & モーダル制御ロジック
// =========================================================================

window.openCsvViewerModal = function() {
  const modal = document.getElementById("csv-viewer-modal");
  if (modal) {
    modal.style.display = "flex";
    const textarea = document.getElementById("modal-csv-input");
    if (textarea) textarea.focus();
  }
};

window.closeCsvViewerModal = function() {
  const modal = document.getElementById("csv-viewer-modal");
  if (modal) modal.style.display = "none";
};

window.handleCsvFileSelected = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const nameDisplay = document.getElementById("modal-filename-display");
  if (nameDisplay) nameDisplay.textContent = file.name;

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    const textarea = document.getElementById("modal-csv-input");
    if (textarea) textarea.value = content;
  };
  reader.readAsText(file);
};

// CSV行のパース（クォート対応）
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map(s => s.trim().replace(/^"|"$/g, ''));
}

window.processAndRenderCsv = function() {
  const textarea = document.getElementById("modal-csv-input");
  const errorEl = document.getElementById("modal-error-msg");
  const rawText = textarea ? textarea.value.trim() : '';

  if (!rawText) {
    if (errorEl) {
      errorEl.textContent = "※ CSVテキストまたはファイルを入力してください";
      errorEl.style.display = "block";
    }
    return;
  }

  try {
    // 参加者IDの抽出（ヘッダー行にある場合）
    let pid = 'IMPORTED_DATA';
    const idMatch = rawText.match(/Participant_ID:\s*([^\r\n]+)/i);
    if (idMatch) pid = idMatch[1].trim();

    // CSV行の分解
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    
    // ヘッダー行（"trial_type" や "trial_id" を含む行）を探す
    let headerIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('trial_id') || lines[i].includes('trial_type') || lines[i].includes('rt')) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) {
      throw new Error("有効なCSVヘッダー（trial_id, rt 等）が見つかりませんでした。");
    }

    const headers = parseCsvLine(lines[headerIndex]);
    const trialIdIdx = headers.indexOf('trial_id');
    const selectedLabelsIdx = headers.indexOf('selected_labels');
    const correctLabelsIdx = headers.indexOf('correct_labels');
    const isFullCorrectIdx = headers.indexOf('is_full_correct');
    const rtIdx = headers.indexOf('rt');
    const participantIdIdx = headers.indexOf('participant_id');

    const trialsList = [];
    let fullCorrectCount = 0;
    let totalRT = 0;

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      if (cols.length < 2) continue;

      const trialId = trialIdIdx !== -1 ? cols[trialIdIdx] : '';
      if (participantIdIdx !== -1 && cols[participantIdIdx] && pid === 'IMPORTED_DATA') {
        pid = cols[participantIdIdx];
      }

      // 本試行（item_ で始まるか、あるいは練習以外の試行）
      if (trialId.startsWith('item_') || (trialId && !trialId.startsWith('practice') && !trialId.startsWith('example') && trialId !== 'trial')) {
        const isFull = isFullCorrectIdx !== -1 ? (cols[isFullCorrectIdx] === '1' || cols[isFullCorrectIdx] === 'true') : false;
        const rt = rtIdx !== -1 ? parseFloat(cols[rtIdx]) || 0 : 0;
        const selected = selectedLabelsIdx !== -1 ? cols[selectedLabelsIdx].replace(/;/g, ', ') : '-';
        const correct = correctLabelsIdx !== -1 ? cols[correctLabelsIdx].replace(/;/g, ', ') : '-';

        if (isFull) fullCorrectCount++;
        totalRT += rt;

        trialsList.push({
          itemNum: trialsList.length + 1,
          trialId: trialId,
          selectedLabels: selected,
          correctLabels: correct,
          isCorrect: isFull,
          rtSec: (rt / 1000).toFixed(2) + 's'
        });
      }
    }

    if (trialsList.length === 0) {
      throw new Error("本番試行データ（item_01 など）が見つかりませんでした。");
    }

    const totalItems = trialsList.length;
    const accuracyPct = Math.round((fullCorrectCount / totalItems) * 100);
    const avgRT = (totalRT / totalItems / 1000).toFixed(2);

    closeCsvViewerModal();

    renderResultsDashboard({
      participantId: pid,
      totalItems: totalItems,
      fullCorrectCount: fullCorrectCount,
      accuracyPct: accuracyPct,
      avgRT: avgRT,
      exportPayload: rawText,
      trialsList: trialsList,
      isViewerMode: true
    });

  } catch (err) {
    if (errorEl) {
      errorEl.textContent = `❌ エラー: ${err.message}`;
      errorEl.style.display = "block";
    }
  }
};
