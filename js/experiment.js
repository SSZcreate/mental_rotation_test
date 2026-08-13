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
// 7. 結果画面 & Google フォーム連携
// =========================================================================

function renderResultsScreen() {
  window.scrollTo(0, 0);
  // 本試行（trial_id が item_ で始まるもの）のデータを抽出
  const allData = jsPsych.data.get();
  const testTrials = allData.filterCustom(trial => trial.trial_id && trial.trial_id.startsWith('item_'));
  
  const totalItems = testTrials.count();
  let fullCorrectCount = 0;
  let totalRT = 0;

  testTrials.values().forEach(t => {
    if (t.is_full_correct === 1) {
      fullCorrectCount++;
    }
    totalRT += (t.rt || 0);
  });

  const accuracyPct = totalItems > 0 ? Math.round((fullCorrectCount / totalItems) * 100) : 0;
  const avgRT = totalItems > 0 ? (totalRT / totalItems / 1000).toFixed(2) : 0;

  // CSVデータの生成（参加者IDヘッダー付き）
  const rawCsv = allData.csv();
  const exportPayload = `Participant_ID: ${PARTICIPANT_ID}\nDate: ${new Date().toISOString()}\nAccuracy: ${accuracyPct}%\nAvg_RT_sec: ${avgRT}\n---\n${rawCsv}`;

  // 各問題の正誤行 HTML を生成
  let breakdownRowsHtml = '';
  testTrials.values().forEach((t, idx) => {
    const itemNum = idx + 1;
    const isCorrect = (t.is_full_correct === 1);
    const badgeClass = isCorrect ? 'badge-correct' : 'badge-incorrect';
    const badgeText = isCorrect ? '⭕ 正解' : '❌ 不正解';
    const yourChoices = t.selected_labels ? t.selected_labels.replace(/;/g, ', ') : '-';
    const correctChoices = t.correct_labels ? t.correct_labels.replace(/;/g, ', ') : '-';
    const rtSec = (t.rt ? (t.rt / 1000).toFixed(2) : '0.00') + 's';

    breakdownRowsHtml += `
      <tr class="${isCorrect ? 'row-correct' : 'row-incorrect'}">
        <td style="font-weight: 600;">第${itemNum}問</td>
        <td><span class="choice-tag">${yourChoices}</span></td>
        <td><span class="choice-tag correct-tag">${correctChoices}</span></td>
        <td><span class="result-badge ${badgeClass}">${badgeText}</span></td>
        <td style="color: var(--text-muted); font-size: 0.9rem;">${rtSec}</td>
      </tr>
    `;
  });

  // 結果画面のHTML描画
  document.body.innerHTML = `
    <div class="results-card">
      <div class="results-header">
        <h2 class="results-title">🎉 実験終了</h2>
        <p style="color: var(--text-muted);">Mental Rotations Test の全試行が完了しました。ご協力ありがとうございました。</p>
      </div>

      <!-- スコアサマリー -->
      <div class="results-summary-grid">
        <div class="summary-stat-box">
          <div class="stat-value">${fullCorrectCount} / ${totalItems}</div>
          <div class="stat-label">正答数 (完全一致)</div>
        </div>
        <div class="summary-stat-box">
          <div class="stat-value">${accuracyPct}%</div>
          <div class="stat-label">正答率</div>
        </div>
        <div class="summary-stat-box">
          <div class="stat-value">${avgRT}s</div>
          <div class="stat-label">平均回答時間</div>
        </div>
      </div>

      <!-- データコピー案内 -->
      <div class="data-section">
        <h4 style="color: var(--primary); margin-bottom: 8px; font-size: 1.1rem;">
          📋 実験結果データ（Google フォーム送信欄）
        </h4>
        <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6; margin-bottom: 12px;">
          以下のボタンを押してデータをコピーし、<strong>Google フォームの回答欄に貼り付けて送信</strong>してください。
        </p>
        <textarea id="mrt-data-export" class="data-textarea" readonly>${exportPayload}</textarea>
      </div>

      <!-- アクションボタン群 -->
      <div class="button-group-row" style="margin-bottom: 36px;">
        <button id="btn-copy-data" class="btn-action" style="font-size: 1.1rem; padding: 14px 36px;">
          📋 データをコピーする
        </button>
        <button id="btn-download-csv" class="btn-secondary">
          💾 CSV保存 (バックアップ)
        </button>
        ${MRT_CONFIG.googleFormUrl ? `
          <a href="${MRT_CONFIG.googleFormUrl}" target="_blank" rel="noopener noreferrer" class="btn-secondary btn-primary-glow">
            🚀 Google フォームを開く ↗
          </a>
        ` : ""}
      </div>

      <!-- 問題ごとの正誤一覧（下部） -->
      <div class="breakdown-section">
        <div class="breakdown-header">
          <h4 style="color: var(--text-main); font-size: 1.15rem; font-weight: 700; margin-bottom: 4px;">
            📊 問題ごとの正誤一覧
          </h4>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 14px;">
            各問題で選択した回答と正解の内訳です（全${totalItems}問）。
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
      // フォールバック
      document.execCommand("copy");
      showToast("✅ データをコピーしました！");
    }
  });

  // CSVダウンロード処理
  const downloadBtn = document.getElementById("btn-download-csv");
  downloadBtn.addEventListener("click", () => {
    const blob = new Blob([exportPayload], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mrt_result_${PARTICIPANT_ID}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
