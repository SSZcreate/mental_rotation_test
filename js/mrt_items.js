/**
 * mrt_items.js
 * 
 * Vandenberg & Kuse (1978) / Peters et al. (1995) Mental Rotations Test (MRT) Items Dataset.
 * Defines 3D block stimulus structures, rotation angles, mirror reflections, and correct answer pairs.
 */

const MRT_ITEMS = {
  // 練習試行 (Practice: 2問)
  practice: [
    {
      id: "practice_1",
      preamble: "Select the two correct images.<br><small>練習問題 1 / 2</small>",
      target: { model: "mrt_3", rot: [0, 0, 0], mirrored: false },
      choices: [
        { model: "mrt_3", rot: [0, 50, 0], mirrored: false, isCorrect: true, label: "A" },
        { model: "mrt_3", rot: [0, 80, 20], mirrored: true, isCorrect: false, label: "B" },
        { model: "mrt_3", rot: [30, 130, 0], mirrored: false, isCorrect: true, label: "C" },
        { model: "mrt_3", rot: [0, 150, 0], mirrored: true, isCorrect: false, label: "D" }
      ]
    },
    {
      id: "practice_2",
      preamble: "Select the two correct images.<br><small>練習問題 2 / 2</small>",
      target: { model: "mrt_4", rot: [0, 0, 0], mirrored: false },
      choices: [
        { model: "mrt_4", rot: [0, 100, 0], mirrored: true, isCorrect: false, label: "A" },
        { model: "mrt_4", rot: [0, 70, 30], mirrored: false, isCorrect: true, label: "B" },
        { model: "mrt_4", rot: [0, 140, 0], mirrored: true, isCorrect: false, label: "C" },
        { model: "mrt_4", rot: [40, 120, 0], mirrored: false, isCorrect: true, label: "D" }
      ]
    }
  ],

  // 本番テスト試行 (Main Test Items - 12 Items)
  test: [
    {
      id: "item_01",
      preamble: "Select the two correct images.<br><small>問題 1 / 12</small>",
      target: { model: "mrt_1", rot: [0, 0, 0], mirrored: false },
      choices: [
        { model: "mrt_1", rot: [0, 40, 0], mirrored: false, isCorrect: true, label: "A" },
        { model: "mrt_1", rot: [0, 80, 0], mirrored: true, isCorrect: false, label: "B" },
        { model: "mrt_1", rot: [0, 120, 0], mirrored: true, isCorrect: false, label: "C" },
        { model: "mrt_1", rot: [0, 160, 0], mirrored: false, isCorrect: true, label: "D" }
      ]
    },
    {
      id: "item_02",
      preamble: "Select the two correct images.<br><small>問題 2 / 12</small>",
      target: { model: "mrt_2", rot: [0, 0, 0], mirrored: false },
      choices: [
        { model: "mrt_2", rot: [0, 60, 0], mirrored: true, isCorrect: false, label: "A" },
        { model: "mrt_2", rot: [0, 100, 0], mirrored: false, isCorrect: true, label: "B" },
        { model: "mrt_2", rot: [0, 140, 0], mirrored: false, isCorrect: true, label: "C" },
        { model: "mrt_2", rot: [0, 180, 0], mirrored: true, isCorrect: false, label: "D" }
      ]
    },
    {
      id: "item_03",
      preamble: "Select the two correct images.<br><small>問題 3 / 12</small>",
      target: { model: "mrt_3", rot: [0, 0, 0], mirrored: false },
      choices: [
        { model: "mrt_3", rot: [30, 45, 0], mirrored: false, isCorrect: true, label: "A" },
        { model: "mrt_3", rot: [0, 90, 30], mirrored: true, isCorrect: false, label: "B" },
        { model: "mrt_3", rot: [45, 135, 0], mirrored: true, isCorrect: false, label: "C" },
        { model: "mrt_3", rot: [0, 150, 45], mirrored: false, isCorrect: true, label: "D" }
      ]
    },
    {
      id: "item_04",
      preamble: "Select the two correct images.<br><small>問題 4 / 12</small>",
      target: { model: "mrt_4", rot: [0, 0, 0], mirrored: false },
      choices: [
        { model: "mrt_4", rot: [0, 50, 0], mirrored: true, isCorrect: false, label: "A" },
        { model: "mrt_4", rot: [0, 80, 0], mirrored: false, isCorrect: true, label: "B" },
        { model: "mrt_4", rot: [0, 130, 0], mirrored: true, isCorrect: false, label: "C" },
        { model: "mrt_4", rot: [0, 170, 0], mirrored: false, isCorrect: true, label: "D" }
      ]
    },
    {
      id: "item_05",
      preamble: "Select the two correct images.<br><small>問題 5 / 12</small>",
      target: { model: "mrt_5", rot: [0, 0, 0], mirrored: false },
      choices: [
        { model: "mrt_5", rot: [0, 40, 20], mirrored: false, isCorrect: true, label: "A" },
        { model: "mrt_5", rot: [0, 90, 0], mirrored: false, isCorrect: true, label: "B" },
        { model: "mrt_5", rot: [0, 120, 30], mirrored: true, isCorrect: false, label: "C" },
        { model: "mrt_5", rot: [30, 160, 0], mirrored: true, isCorrect: false, label: "D" }
      ]
    },
    {
      id: "item_06",
      preamble: "Select the two correct images.<br><small>問題 6 / 12</small>",
      target: { model: "mrt_6", rot: [0, 0, 0], mirrored: false },
      choices: [
        { model: "mrt_6", rot: [0, 70, 0], mirrored: true, isCorrect: false, label: "A" },
        { model: "mrt_6", rot: [0, 110, 0], mirrored: true, isCorrect: false, label: "B" },
        { model: "mrt_6", rot: [0, 130, 30], mirrored: false, isCorrect: true, label: "C" },
        { model: "mrt_6", rot: [0, 170, 0], mirrored: false, isCorrect: true, label: "D" }
      ]
    },
    {
      id: "item_07",
      preamble: "Select the two correct images.<br><small>問題 7 / 12</small>",
      target: { model: "mrt_1", rot: [0, 0, 0], mirrored: false },
      choices: [
        { model: "mrt_1", rot: [45, 60, 0], mirrored: false, isCorrect: true, label: "A" },
        { model: "mrt_1", rot: [0, 90, 45], mirrored: false, isCorrect: true, label: "B" },
        { model: "mrt_1", rot: [30, 120, 0], mirrored: true, isCorrect: false, label: "C" },
        { model: "mrt_1", rot: [0, 150, 30], mirrored: true, isCorrect: false, label: "D" }
      ]
    },
    {
      id: "item_08",
      preamble: "Select the two correct images.<br><small>問題 8 / 12</small>",
      target: { model: "mrt_2", rot: [0, 0, 0], mirrored: false },
      choices: [
        { model: "mrt_2", rot: [0, 40, 30], mirrored: true, isCorrect: false, label: "A" },
        { model: "mrt_2", rot: [0, 80, 0], mirrored: false, isCorrect: true, label: "B" },
        { model: "mrt_2", rot: [0, 130, 30], mirrored: false, isCorrect: true, label: "C" },
        { model: "mrt_2", rot: [30, 160, 0], mirrored: true, isCorrect: false, label: "D" }
      ]
    },
    {
      id: "item_09",
      preamble: "Select the two correct images.<br><small>問題 9 / 12</small>",
      target: { model: "mrt_3", rot: [0, 0, 0], mirrored: false },
      choices: [
        { model: "mrt_3", rot: [0, 50, 0], mirrored: true, isCorrect: false, label: "A" },
        { model: "mrt_3", rot: [0, 90, 0], mirrored: true, isCorrect: false, label: "B" },
        { model: "mrt_3", rot: [0, 120, 0], mirrored: false, isCorrect: true, label: "C" },
        { model: "mrt_3", rot: [0, 160, 30], mirrored: false, isCorrect: true, label: "D" }
      ]
    },
    {
      id: "item_10",
      preamble: "Select the two correct images.<br><small>問題 10 / 12</small>",
      target: { model: "mrt_4", rot: [0, 0, 0], mirrored: false },
      choices: [
        { model: "mrt_4", rot: [30, 60, 0], mirrored: false, isCorrect: true, label: "A" },
        { model: "mrt_4", rot: [0, 100, 30], mirrored: true, isCorrect: false, label: "B" },
        { model: "mrt_4", rot: [0, 140, 0], mirrored: false, isCorrect: true, label: "C" },
        { model: "mrt_4", rot: [45, 170, 0], mirrored: true, isCorrect: false, label: "D" }
      ]
    },
    {
      id: "item_11",
      preamble: "Select the two correct images.<br><small>問題 11 / 12</small>",
      target: { model: "mrt_5", rot: [0, 0, 0], mirrored: false },
      choices: [
        { model: "mrt_5", rot: [0, 70, 0], mirrored: true, isCorrect: false, label: "A" },
        { model: "mrt_5", rot: [0, 110, 30], mirrored: false, isCorrect: true, label: "B" },
        { model: "mrt_5", rot: [30, 130, 0], mirrored: true, isCorrect: false, label: "C" },
        { model: "mrt_5", rot: [0, 160, 0], mirrored: false, isCorrect: true, label: "D" }
      ]
    },
    {
      id: "item_12",
      preamble: "Select the two correct images.<br><small>問題 12 / 12</small>",
      target: { model: "mrt_6", rot: [0, 0, 0], mirrored: false },
      choices: [
        { model: "mrt_6", rot: [0, 45, 0], mirrored: false, isCorrect: true, label: "A" },
        { model: "mrt_6", rot: [0, 85, 30], mirrored: true, isCorrect: false, label: "B" },
        { model: "mrt_6", rot: [0, 125, 0], mirrored: true, isCorrect: false, label: "C" },
        { model: "mrt_6", rot: [40, 165, 0], mirrored: false, isCorrect: true, label: "D" }
      ]
    }
  ]
};
