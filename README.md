# Mental Rotations Test (MRT) - Webアプリケーション

Vandenberg & Kuse (1978) の古典的 Mental Rotations Test (MRT) および Peters et al. (1995) の再描画刺激に基づいた、オンライン心理学実験用Webアプリケーションです。  
GitHub Pages などの静的ホスティング環境でそのまま公開でき、Google フォームとシームレスに結果データをやり取りできます。

---

## 🎯 特徴

1. **Vandenberg & Kuse (1978) の 2-out-of-4 選択形式**
   - 基準図形（Target）1つに対し、4つの選択肢の中から回転させた同一図形を「2つ」選択する標準プロトコルに完全対応。
2. **`jspsych-mental-rotation` 3D Canvas 描画エンジン搭載**
   - Shepard & Metzler (1971) / Peters et al. (1995) スタイルの10個の立方体からなる3Dブロック立体を、Canvas上に高解像度かつリアルタイムに回転・鏡像描画します。
   - 外部画像ファイルがなくても即座に動作し、GitHub Pages へのデプロイもファイル群をプッシュするだけで完了します。
3. **Google フォームとの連携設計**
   - **URLパラメータ引き継ぎ**: `https://<user>.github.io/<repo>/?id=P001` のようにアクセスすると、参加者IDを自動で記録します。
   - **ワンクリック結果コピー**: 実験終了時に全試行のCSVデータをクリップボードへワンクリックでコピー可能。
   - **CSVバックアップ保存**: 参加者側でのファイル保存も可能。
   - **Google フォーム直通ボタン**: 終了画面からGoogle フォームへ1クリックで戻れます。

---

## 🚀 GitHub Pages への公開手順

1. **GitHub にリポジトリを作成**
   - GitHub にログインし、新しいリポジトリ（例: `mental-rotation-test`）を作成します。
2. **本リポジトリのファイルをプッシュ**
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Mental Rotations Test"
   git branch -M main
   git remote add origin https://github.com/<あなたのユーザー名>/<リポジトリ名>.git
   git push -u origin main
   ```
3. **GitHub Pages を有効化**
   - リポジトリの **Settings** ＞ **Pages** に移動します。
   - **Build and deployment** の Source で **Deploy from a branch** を選択し、Branch を `main` / `/(root)` に設定して **Save** を押します。
   - 数分後、`https://<あなたのユーザー名>.github.io/<リポジトリ名>/` に公開されます。

---

## 📋 Google フォームとの連携手順

全体の流れ：
1. **Google フォーム (前半)**: 実験の説明、同意取得、参加者基本情報の入力。
2. **GitHub Pages (本アプリ)**: MRT実験を実施し、結果データをコピー。
3. **Google フォーム (後半)**: コピーした結果データを回答欄に貼り付けて送信。

### Google フォーム側の設定
1. **説明・同意セクション**を作成。
2. **実験URLの案内**:
   - `https://<あなたのユーザー名>.github.io/<リポジトリ名>/` へのリンクを掲載します。
3. **結果貼り付け欄**:
   - 質問形式を **「段落」** にして、「実験終了時に表示された結果データをここに貼り付けてください」と記載します。

---

## ⚙️ カスタマイズ設定 (`js/config.js`)

`js/config.js` を編集することで、ノーコード感覚で動作を変更できます。

```javascript
const MRT_CONFIG = {
  // Google フォームのURL（参加者が戻るフォームのURL）
  googleFormUrl: "https://docs.google.com/forms/d/e/あなたのフォームID/viewform",

  // 1問あたりの選択数（デフォルト: 2）
  requiredSelections: 2,

  // 練習問題でフィードバック（正誤解説）を表示するか（true / false）
  showFeedbackInPractice: true,

  // 1問あたりの制限時間（ミリ秒、nullの場合は無制限）
  trialDuration: null,
};
```

---

## 🔬 参考文献

- Vandenberg, S. G., & Kuse, A. R. (1978). Mental rotations, a group test of three-dimensional spatial visualization. *Perceptual and Motor Skills*, 47(2), 599-604.
- Shepard, R. N., & Metzler, J. (1971). Mental rotation of three-dimensional objects. *Science*, 171(3972), 701-703.
- Peters, M., Laeng, B., Latham, K., Jackson, M., Zaiyouna, R., & Richardson, C. (1995). A redrawn Vandenberg and Kuse mental rotations test-different versions and scoring procedures. *Brain and Cognition*, 28(1), 39-58.
- Peters, M., & Battista, C. (2008). Applications of a library of 3D-models for mental rotation studies. *Behavior Research Methods*, 40(3), 803-809.
