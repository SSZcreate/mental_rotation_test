/**
 * Mental Rotations Test (MRT) - Configuration File
 * 実験の基本設定や Google フォームとの連携設定を管理します。
 */

const MRT_CONFIG = {
  // 実験タイトル
  title: "Mental Rotations Test (MRT)",
  subtitle: "3次元空間構造理解テスト (Vandenberg & Kuse, 1978 / Peters et al., 1995)",
  version: "1.0.0",

  // Google フォームのURL（テスト終了後に参加者が結果を貼り付けて送信するフォームのURL）
  // 例: "https://docs.google.com/forms/d/e/1FAIpQLScXXXXXXX/viewform"
  googleFormUrl: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform",

  // 1問あたりに選択させる図形数（Vandenberg & Kuse 形式は 2つ）
  requiredSelections: 2,

  // 練習問題で正誤フィードバックを表示するか
  showFeedbackInPractice: false,

  // 1問あたりの制限時間（ミリ秒、nullの場合は無制限）
  trialDuration: null,

  // 3Dレンダラーのデフォルト設定
  renderer: {
    blockSize: 24,       // 各立方体の基本サイズ (px)
    strokeColor: "#1e293b", // ブロック輪郭線の色
    strokeWidth: 1.5,     // 輪郭線の太さ
    primaryColor: "#f8fafc", // 基本ブロック面の色
    shadingRatio: 0.18,  // 陰影の強さ
    canvasWidth: 200,    // ターゲットCanvasの横幅 (px)
    canvasHeight: 200,   // ターゲットCanvasの縦幅 (px)
    choiceCanvasWidth: 160,  // 選択肢Canvasの横幅 (px)
    choiceCanvasHeight: 160  // 選択肢Canvasの縦幅 (px)
  }
};
