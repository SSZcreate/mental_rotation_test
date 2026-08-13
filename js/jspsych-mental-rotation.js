/**
 * jspsych-mental-rotation.js
 * 
 * Vandenberg & Kuse (1978) / Peters et al. (1995) Mental Rotations Test (MRT) plugin for jsPsych 7.x
 * Includes high-fidelity 3D isometric block renderer for Shepard & Metzler (1971) stimuli.
 */

// =========================================================================
// 1. 3D Block Figure Renderer (Shepard-Metzler / Peters et al. Style)
// =========================================================================

const MRTRenderer = (function() {
  // 基本的な3Dブロックモデルの定義（10個の立方体の相対グリッド座標）
  const MODELS = {
    // Model 1 (Classical Shepard-Metzler 10-cube arm structure A)
    mrt_1: [
      [0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0], // Main stem
      [1, 3, 0], [2, 3, 0],                         // Arm 1
      [2, 3, 1], [2, 3, 2], [2, 3, 3], [2, 3, 4]  // Sub-arm 2
    ],
    // Model 2 (Type B)
    mrt_2: [
      [0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0],
      [0, 3, 1], [0, 3, 2],
      [1, 3, 2], [2, 3, 2], [3, 3, 2], [4, 3, 2]
    ],
    // Model 3 (Type C)
    mrt_3: [
      [0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0],
      [-1, 0, 0], [-2, 0, 0],
      [-2, 0, 1], [-2, 0, 2], [-2, 0, 3], [-2, 0, 4]
    ],
    // Model 4 (Type D)
    mrt_4: [
      [0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0],
      [0, 0, -1], [0, 0, -2],
      [1, 0, -2], [2, 0, -2], [3, 0, -2], [4, 0, -2]
    ],
    // Model 5 (Type E - S-bend structure)
    mrt_5: [
      [0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0],
      [3, 1, 0], [3, 2, 0],
      [3, 2, 1], [3, 2, 2], [3, 2, 3], [3, 3, 3]
    ],
    // Model 6 (Type F - Peters Redrawn MRT style)
    mrt_6: [
      [0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0],
      [1, 1, 0], [2, 1, 0],
      [2, 1, 1], [2, 1, 2], [2, 1, 3], [2, 1, 4]
    ]
  };

  // 立方体の6面の定義（8頂点インデックスと法線ベクトル）
  // 頂点順序: [0..7] = [-0.5,-0.5,-0.5] .. [+0.5,+0.5,+0.5]
  const CUBE_VERTICES = [
    [-0.5, -0.5, -0.5], // 0: LBB
    [ 0.5, -0.5, -0.5], // 1: RBB
    [ 0.5,  0.5, -0.5], // 2: RTB
    [-0.5,  0.5, -0.5], // 3: LTB
    [-0.5, -0.5,  0.5], // 4: LBF
    [ 0.5, -0.5,  0.5], // 5: RBF
    [ 0.5,  0.5,  0.5], // 6: RTF
    [-0.5,  0.5,  0.5]  // 7: LTF
  ];

  const CUBE_FACES = [
    { indices: [4, 5, 6, 7], normal: [0, 0, 1], name: "front" },   // +Z
    { indices: [1, 0, 3, 2], normal: [0, 0, -1], name: "back" },   // -Z
    { indices: [7, 6, 2, 3], normal: [0, 1, 0], name: "top" },     // +Y
    { indices: [0, 1, 5, 4], normal: [0, -1, 0], name: "bottom" }, // -Y
    { indices: [5, 1, 2, 6], normal: [1, 0, 0], name: "right" },   // +X
    { indices: [0, 4, 7, 3], normal: [-1, 0, 0], name: "left" }    // -X
  ];

  // 3Dベクトルの回転計算（Euler angles in radians: X, Y, Z）
  function rotate3D(v, rx, ry, rz) {
    let [x, y, z] = v;

    // Rotate around X
    if (rx !== 0) {
      const cosX = Math.cos(rx), sinX = Math.sin(rx);
      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;
      y = y1; z = z1;
    }

    // Rotate around Y
    if (ry !== 0) {
      const cosY = Math.cos(ry), sinY = Math.sin(ry);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      x = x1; z = z1;
    }

    // Rotate around Z
    if (rz !== 0) {
      const cosZ = Math.cos(rz), sinZ = Math.sin(rz);
      const x1 = x * cosZ - y * sinZ;
      const y1 = x * sinZ + y * cosZ;
      x = x1; y = y1;
    }

    return [x, y, z];
  }

  // モデルの重心を計算してセンタリング
  function getCenteredCubes(cubes) {
    let sumX = 0, sumY = 0, sumZ = 0;
    const n = cubes.length;
    for (let i = 0; i < n; i++) {
      sumX += cubes[i][0];
      sumY += cubes[i][1];
      sumZ += cubes[i][2];
    }
    const cx = sumX / n;
    const cy = sumY / n;
    const cz = sumZ / n;

    return cubes.map(c => [c[0] - cx, c[1] - cy, c[2] - cz]);
  }

  // Canvasに3Dブロック図形を描画する関数
  function drawFigure(canvas, modelSpec, options = {}) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // モデルデータの取得
    let rawCubes = [];
    if (typeof modelSpec.model === "string") {
      rawCubes = MODELS[modelSpec.model] || MODELS.mrt_1;
    } else if (Array.isArray(modelSpec.model)) {
      rawCubes = modelSpec.model;
    } else {
      rawCubes = MODELS.mrt_1;
    }

    const cubes = getCenteredCubes(rawCubes);
    const blockSize = options.blockSize || (width < 180 ? 20 : 24);
    const strokeColor = options.strokeColor || "#1e293b";
    const strokeWidth = options.strokeWidth || 1.5;
    const baseColor = options.primaryColor || "#f8fafc";
    const isMirrored = Boolean(modelSpec.mirrored);

    // 回転角（度数法からラジアンへ）
    const rot = modelSpec.rot || [0, 0, 0];
    const rx = (rot[0] || 0) * Math.PI / 180;
    const ry = (rot[1] || 0) * Math.PI / 180;
    const rz = (rot[2] || 0) * Math.PI / 180;

    // 基本視点（アイソメトリック見下ろし角: Elevation ~ 25度, Azimuth ~ 35度）
    const baseElevation = 25 * Math.PI / 180;
    const baseAzimuth = 35 * Math.PI / 180;

    // ライトの向き（左上前方からの光）
    const lightDir = [-0.5, -0.7, 0.6];
    const lightLen = Math.hypot(...lightDir);
    const normLight = lightDir.map(l => l / lightLen);

    // 全ての立方体の面を収集
    const facesToRender = [];

    cubes.forEach((cubePos) => {
      let [cx, cy, cz] = cubePos;
      // 鏡像変換（X軸反転）
      if (isMirrored) {
        cx = -cx;
      }

      CUBE_FACES.forEach(faceDef => {
        // 面の頂点座標を計算
        const faceVertices3D = faceDef.indices.map(idx => {
          let vx = cx + CUBE_VERTICES[idx][0];
          let vy = cy + CUBE_VERTICES[idx][1];
          let vz = cz + CUBE_VERTICES[idx][2];

          // 鏡像の場合のローカル反転
          if (isMirrored) {
            vx = cx + (-CUBE_VERTICES[idx][0]);
          }

          // オブジェクトの回転
          let [rx_v, ry_v, rz_v] = rotate3D([vx, vy, vz], rx, ry, rz);

          // 視点カメラ回転（アイソメトリック）
          [rx_v, ry_v, rz_v] = rotate3D([rx_v, ry_v, rz_v], baseElevation, baseAzimuth, 0);

          return [rx_v, ry_v, rz_v];
        });

        // 面の法線ベクトルを計算
        let fn = [...faceDef.normal];
        if (isMirrored) {
          fn[0] = -fn[0];
        }
        let [fnx, fny, fnz] = rotate3D(fn, rx, ry, rz);
        [fnx, fny, fnz] = rotate3D([fnx, fny, fnz], baseElevation, baseAzimuth, 0);

        // バックフェイスカリング（視線方向 +Z に向いていない面はスキップ）
        if (fnz <= 0.05) return;

        // 面の中心Z座標（深度ソート用）
        const avgZ = faceVertices3D.reduce((acc, v) => acc + v[2], 0) / 4;

        // 面のライティング計算 (0.45 〜 1.0)
        const dot = Math.max(0, fnx * normLight[0] + fny * normLight[1] + fnz * normLight[2]);
        const brightness = 0.48 + 0.52 * dot;

        // 2Dスクリーン座標への投影（正射影）
        const screenVertices = faceVertices3D.map(v => {
          const sx = width / 2 + v[0] * blockSize;
          const sy = height / 2 - v[1] * blockSize; // Y軸反転 (Screen Y is downwards)
          return [sx, sy];
        });

        facesToRender.push({
          vertices: screenVertices,
          z: avgZ,
          brightness: brightness
        });
      });
    });

    // Z-Sort (奥にある面から手前に向かって描画：Painter's algorithm)
    facesToRender.sort((a, b) => a.z - b.z);

    // 面の描画
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeColor;

    facesToRender.forEach(face => {
      ctx.beginPath();
      ctx.moveTo(face.vertices[0][0], face.vertices[0][1]);
      for (let i = 1; i < face.vertices.length; i++) {
        ctx.lineTo(face.vertices[i][0], face.vertices[i][1]);
      }
      ctx.closePath();

      // Peters et al. スタイルのクリーンな陰影カラー
      const r = Math.round(245 * face.brightness);
      const g = Math.round(248 * face.brightness);
      const b = Math.round(252 * face.brightness);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fill();
      ctx.stroke();
    });
  }

  return {
    drawFigure,
    MODELS
  };
})();


// =========================================================================
// 2. jsPsych Mental Rotation Plugin (jsPsych 7.x Component)
// =========================================================================

const jsPsychMentalRotation = (function(jspsych) {
  const info = {
    name: "mental-rotation",
    parameters: {
      trial_id: {
        type: jspsych.ParameterType.STRING,
        default: "trial"
      },
      preamble: {
        type: jspsych.ParameterType.HTML_STRING,
        default: "Select the two correct images."
      },
      subtitle: {
        type: jspsych.ParameterType.STRING,
        default: ""
      },
      target: {
        type: jspsych.ParameterType.OBJECT,
        default: null
      },
      choices: {
        type: jspsych.ParameterType.COMPLEX,
        array: true,
        default: []
      },
      required_selections: {
        type: jspsych.ParameterType.INT,
        default: 2
      },
      is_practice: {
        type: jspsych.ParameterType.BOOL,
        default: false
      },
      button_label: {
        type: jspsych.ParameterType.STRING,
        default: "Next"
      }
    }
  };

  class MentalRotationPlugin {
    constructor(jsPsychInstance) {
      this.jsPsych = jsPsychInstance;
    }

    trial(display_element, trial) {
      const startTime = performance.now();
      let selectedChoices = new Set();
      const requiredCount = trial.required_selections || 2;

      // HTML構造の生成
      let html = `
        <div class="mrt-container">
          <div class="mrt-header">
            <h3 class="mrt-preamble">${trial.preamble}</h3>
            ${trial.subtitle ? `<div class="mrt-subtitle">${trial.subtitle}</div>` : ""}
            <div class="mrt-instruction-badge">
              <span class="badge-icon">ℹ️</span>
              同じ図形を <strong>${requiredCount}つ</strong> 選択してください
              <span id="selection-count-indicator" class="selection-count">(0/${requiredCount} 選択中)</span>
            </div>
          </div>

          <div class="mrt-test-area">
            <!-- ターゲット（基準図形）領域 -->
            <div class="mrt-target-card">
              <div class="card-label">基準図形 (Target)</div>
              <div class="mrt-canvas-wrapper target-canvas-wrapper">
                ${trial.target && trial.target.image ? 
                  `<img src="${trial.target.image}" class="mrt-stim-img" alt="Target">` :
                  `<canvas id="mrt-target-canvas" width="200" height="200"></canvas>`
                }
              </div>
            </div>

            <!-- 分割矢印または区切り -->
            <div class="mrt-divider">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>

            <!-- 選択肢（4つの図形）領域 -->
            <div class="mrt-choices-grid">
      `;

      const choiceLabels = ["A", "B", "C", "D"];
      trial.choices.forEach((choice, index) => {
        const label = choice.label || choiceLabels[index] || (index + 1);
        html += `
          <div class="mrt-choice-card" data-choice-index="${index}" id="mrt-choice-${index}">
            <div class="choice-top-bar">
              <span class="choice-letter">${label}</span>
              <div class="choice-checkbox-indicator">
                <span class="check-icon">✓</span>
              </div>
            </div>
            <div class="mrt-canvas-wrapper choice-canvas-wrapper">
              ${choice.image ? 
                `<img src="${choice.image}" class="mrt-stim-img" alt="Choice ${label}">` :
                `<canvas id="mrt-choice-canvas-${index}" width="160" height="160"></canvas>`
              }
            </div>
          </div>
        `;
      });

      html += `
            </div>
          </div>

          <!-- フィードバック領域（練習問題用） -->
          <div id="mrt-feedback-box" class="mrt-feedback-box" style="display: none;"></div>

          <!-- アクションフッター -->
          <div class="mrt-footer">
            <button id="mrt-submit-btn" class="mrt-btn-submit" disabled>
              ${trial.button_label}
            </button>
          </div>
        </div>
      `;

      display_element.innerHTML = html;

      // 3D Canvas レンダリング実行
      if (trial.target && !trial.target.image) {
        const targetCanvas = document.getElementById("mrt-target-canvas");
        MRTRenderer.drawFigure(targetCanvas, trial.target, MRT_CONFIG.renderer || {});
      }

      trial.choices.forEach((choice, index) => {
        if (!choice.image) {
          const choiceCanvas = document.getElementById(`mrt-choice-canvas-${index}`);
          MRTRenderer.drawFigure(choiceCanvas, choice, {
            ...MRT_CONFIG.renderer,
            blockSize: 19
          });
        }
      });

      // インタラクション制御
      const submitBtn = document.getElementById("mrt-submit-btn");
      const countIndicator = document.getElementById("selection-count-indicator");
      const choiceCards = document.querySelectorAll(".mrt-choice-card");

      function updateUI() {
        const count = selectedChoices.size;
        countIndicator.textContent = `(${count}/${requiredCount} 選択中)`;

        if (count === requiredCount) {
          countIndicator.classList.add("complete");
          submitBtn.disabled = false;
          submitBtn.classList.add("active");
        } else {
          countIndicator.classList.remove("complete");
          submitBtn.disabled = true;
          submitBtn.classList.remove("active");
        }

        choiceCards.forEach((card, idx) => {
          if (selectedChoices.has(idx)) {
            card.classList.add("selected");
          } else {
            card.classList.remove("selected");
          }
        });
      }

      choiceCards.forEach(card => {
        card.addEventListener("click", () => {
          const idx = parseInt(card.getAttribute("data-choice-index"), 10);
          if (selectedChoices.has(idx)) {
            selectedChoices.delete(idx);
          } else {
            if (selectedChoices.size < requiredCount) {
              selectedChoices.add(idx);
            } else {
              // 既に2つ選ばれている場合、最も古い選択を外して新しい選択を適用
              const firstChosen = selectedChoices.values().next().value;
              selectedChoices.delete(firstChosen);
              selectedChoices.add(idx);
            }
          }
          updateUI();
        });
      });

      // キーボード操作対応 (1, 2, 3, 4 または A, B, C, D)
      const keyHandler = (e) => {
        const key = e.key.toLowerCase();
        let targetIndex = -1;
        if (key === "1" || key === "a") targetIndex = 0;
        if (key === "2" || key === "b") targetIndex = 1;
        if (key === "3" || key === "c") targetIndex = 2;
        if (key === "4" || key === "d") targetIndex = 3;

        if (targetIndex >= 0 && targetIndex < trial.choices.length) {
          if (selectedChoices.has(targetIndex)) {
            selectedChoices.delete(targetIndex);
          } else {
            if (selectedChoices.size < requiredCount) {
              selectedChoices.add(targetIndex);
            } else {
              const firstChosen = selectedChoices.values().next().value;
              selectedChoices.delete(firstChosen);
              selectedChoices.add(targetIndex);
            }
          }
          updateUI();
        } else if (e.key === "Enter" && !submitBtn.disabled) {
          submitBtn.click();
        }
      };
      window.addEventListener("keydown", keyHandler);

      // 送信処理
      let isSubmitted = false;
      submitBtn.addEventListener("click", () => {
        if (selectedChoices.size !== requiredCount) return;
        if (isSubmitted) return;
        isSubmitted = true;

        const endTime = performance.now();
        const rt = Math.round(endTime - startTime);
        const selectedArray = Array.from(selectedChoices).sort((a, b) => a - b);

        // 正解のインデックスを抽出
        const correctIndices = [];
        trial.choices.forEach((c, idx) => {
          if (c.isCorrect) correctIndices.push(idx);
        });

        // 採点（Vandenberg & Kuse: 2問両方正解で正解 = 1点, 1問正解 = 0.5点など）
        let correctSelectedCount = 0;
        selectedArray.forEach(idx => {
          if (trial.choices[idx] && trial.choices[idx].isCorrect) {
            correctSelectedCount++;
          }
        });

        const isFullCorrect = (correctSelectedCount === requiredCount && correctIndices.length === requiredCount);
        const partialScore = correctSelectedCount / requiredCount;

        const trialData = {
          trial_id: trial.trial_id,
          is_practice: trial.is_practice,
          preamble: trial.preamble,
          target_model: trial.target ? (trial.target.model || "custom") : "none",
          target_rot: trial.target ? (trial.target.rot || [0,0,0]).join(":") : "0:0:0",
          selected_indices: selectedArray.join(";"),
          selected_labels: selectedArray.map(i => choiceLabels[i]).join(";"),
          correct_indices: correctIndices.join(";"),
          correct_labels: correctIndices.map(i => choiceLabels[i]).join(";"),
          correct_count: correctSelectedCount,
          is_full_correct: isFullCorrect ? 1 : 0,
          score: isFullCorrect ? 1 : (MRT_CONFIG.allowPartialScoring ? partialScore : 0),
          rt: rt
        };

        // 練習問題でフィードバック表示が有効な場合
        if (trial.is_practice && MRT_CONFIG.showFeedbackInPractice) {
          window.removeEventListener("keydown", keyHandler);

          // 正解・不正解カードのハイライト
          choiceCards.forEach((card, idx) => {
            const isCorrect = trial.choices[idx].isCorrect;
            const isSelected = selectedChoices.has(idx);
            if (isCorrect) {
              card.classList.add("feedback-correct");
            } else if (isSelected && !isCorrect) {
              card.classList.add("feedback-wrong");
            }
          });

          const feedbackBox = document.getElementById("mrt-feedback-box");
          feedbackBox.style.display = "block";
          if (isFullCorrect) {
            feedbackBox.className = "mrt-feedback-box correct";
            feedbackBox.innerHTML = `
              <div class="feedback-title">🎉 正解です！</div>
              <div class="feedback-desc">正解の図形は <strong>${trialData.correct_labels}</strong> です（基準図形をそのまま回転させたもの）。</div>
            `;
          } else {
            feedbackBox.className = "mrt-feedback-box incorrect";
            feedbackBox.innerHTML = `
              <div class="feedback-title">❌ 不正解です</div>
              <div class="feedback-desc">正解の図形は <strong>${trialData.correct_labels}</strong> でした。<br>残りの2つは鏡像（反転）または別の構造の図形です。</div>
            `;
          }

          submitBtn.textContent = "次へ進む";
          submitBtn.onclick = () => {
            this.jsPsych.finishTrial(trialData);
          };
        } else {
          window.removeEventListener("keydown", keyHandler);
          this.jsPsych.finishTrial(trialData);
        }
      });
    }
  }

  MentalRotationPlugin.info = info;
  return MentalRotationPlugin;
})(jsPsychModule);
