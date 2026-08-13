/**
 * experiment.js
 * 
 * Main experimental timeline controller for Vandenberg & Kuse MRT
 */

// URLパラメータから参加者IDを取得する関数
function getParticipantId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id') || 
         urlParams.get('participant_id') || 
         urlParams.get('pid') || 
         urlParams.get('subject') || 
         `P_${Date.now().toString(36).toUpperCase()}`;
}

const PARTICIPANT_ID = getParticipantId();

// jsPsych インスタンスの初期化
const jsPsych = initJsPsych({
  on_finish: function() {
    renderResultsScreen();
  }
});

// 実験全体のタイムライン
const timeline = [];

// 1. ウェルカム & 参加者ID確認画面
const welcomeScreen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div class="mrt-guide-container">
      <div class="mrt-guide-header">
        <h2 class="mrt-guide-title">${MRT_CONFIG.title}</h2>
        <div class="mrt-guide-subtitle">${MRT_CONFIG.subtitle}</div>
        <div class="participant-id-badge">
          <span>参加者ID:</span>
          <strong>${PARTICIPANT_ID}</strong>
        </div>
      </div>

      <div class="guide-section">
        <h4>📋 テスト概要</h4>
        <p>
          本テストは、頭の中で立体図形を回転させて把握する<strong>「3次元空間構造理解能力」</strong>を測定する心理学テストです。
        </p>
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
        <button class="btn-action" onclick="jsPsych.finishTrial()">次へ（例題を見る）</button>
      </div>
    </div>
  `,
  choices: "NO_KEYS"
};
timeline.push(welcomeScreen);

// 2. 例題（Example）の提示
MRT_ITEMS.examples.forEach((example, index) => {
  timeline.push({
    type: jsPsychMentalRotation,
    trial_id: example.id,
    preamble: example.preamble,
    subtitle: example.title,
    target: example.target,
    choices: example.choices,
    is_practice: false,
    button_label: "次へ"
  });

  // 例題の解説画面
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class="mrt-guide-container" style="max-width: 700px;">
        <div class="mrt-guide-header">
          <h3 class="mrt-guide-title">${example.title} の解説</h3>
        </div>
        <div class="guide-section">
          <p style="font-size: 1.05rem; line-height: 1.8;">
            ${example.explanation}
          </p>
        </div>
        <div class="mrt-footer" style="margin-top: 30px;">
          <button class="btn-action" onclick="jsPsych.finishTrial()">
            ${index < MRT_ITEMS.examples.length - 1 ? "次の例題へ" : "練習問題へ進む"}
          </button>
        </div>
      </div>
    `,
    choices: "NO_KEYS"
  });
});

// 3. 練習セッション開始アナウンス
timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div class="mrt-guide-container" style="text-align: center; max-width: 600px;">
      <h3 class="mrt-guide-title" style="margin-bottom: 16px;">練習セッション</h3>
      <p style="font-size: 1.05rem; color: #cbd5e1; margin-bottom: 24px;">
        これから操作に慣れていただくための <strong>2問の練習問題</strong> を行います。<br>
        準備ができたら下のボタンを押して開始してください。
      </p>
      <button class="btn-action" onclick="jsPsych.finishTrial()">練習を開始する</button>
    </div>
  `,
  choices: "NO_KEYS"
});

// 4. 練習試行 (Practice Items)
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

// 5. 本番テスト開始アナウンス
timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div class="mrt-guide-container" style="text-align: center; max-width: 640px;">
      <h2 class="mrt-guide-title" style="margin-bottom: 16px;">本番テスト開始</h2>
      <p style="font-size: 1.05rem; color: #cbd5e1; line-height: 1.8; margin-bottom: 20px;">
        練習は以上です。<br>
        ここからは全 <strong>${MRT_ITEMS.test.length} 問</strong> の本番問題に回答していただきます。<br>
        できるだけ正確に、かつ速やかに回答してください。
      </p>
      <button class="btn-action" onclick="jsPsych.finishTrial()">本番テストを開始する</button>
    </div>
  `,
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

  // 結果画面のHTML描画（参加者へスコアのフィードバックは出さず、完了確認とデータコピーに集中）
  document.body.innerHTML = `
    <div class="results-card">
      <div class="results-header">
        <h2 class="results-title">🎉 実験終了</h2>
        <p style="color: var(--text-muted);">Mental Rotations Test の全試行が完了しました。ご協力ありがとうございました。</p>
      </div>

      <!-- 完了ステータス -->
      <div class="results-summary-grid" style="grid-template-columns: repeat(2, 1fr);">
        <div class="summary-stat-box">
          <div class="stat-value">${PARTICIPANT_ID}</div>
          <div class="stat-label">参加者ID</div>
        </div>
        <div class="summary-stat-box">
          <div class="stat-value">${totalItems} / ${totalItems}</div>
          <div class="stat-label">完了した問題数</div>
        </div>
      </div>

      <!-- データコピー案内 -->
      <div class="data-section">
        <h4 style="color: var(--primary); margin-bottom: 8px; font-size: 1.1rem;">
          📋 実験結果データ
        </h4>
        <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6; margin-bottom: 12px;">
          以下のボタンを押してデータをコピーし、<strong>Google フォームの回答欄に貼り付けて送信</strong>してください。
        </p>
        <textarea id="mrt-data-export" class="data-textarea" readonly>${exportPayload}</textarea>
      </div>

      <!-- アクションボタン群 -->
      <div class="button-group-row">
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
