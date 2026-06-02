const units = [
  {
    grade: "中学1年",
    items: [
      {
        id: "signed",
        title: "正負の計算",
        description: "マイナスを含む足し算・引き算・かけ算",
        makeQuestion: makeSignedQuestion
      },
      {
        id: "power",
        title: "簡単な累乗",
        description: "2乗と3乗の基本計算",
        makeQuestion: makePowerQuestion
      },
      {
        id: "mixed",
        title: "正負と累乗ミックス",
        description: "正負の計算と累乗をまとめて練習",
        makeQuestion: makeMixedQuestion
      }
    ]
  },
  {
    grade: "中学2年",
    items: [
      {
        id: "coming-linear",
        title: "文字式の計算",
        description: "次の追加予定単元",
        disabled: true
      }
    ]
  },
  {
    grade: "中学3年",
    items: [
      {
        id: "radical",
        title: "根号の計算",
        description: "√の簡単化・足し引き・かけ算",
        makeQuestion: makeRadicalQuestion
      }
    ]
  }
];

const state = {
  selectedUnit: null,
  selectedRadicalTypes: ["transform", "rationalize", "arithmetic"],
  questionCount: 10,
  questions: [],
  index: 0,
  correct: 0,
  history: [],
  locked: false
};

const homeView = document.querySelector("#homeView");
const radicalSetupView = document.querySelector("#radicalSetupView");
const quizView = document.querySelector("#quizView");
const resultView = document.querySelector("#resultView");
const unitBoard = document.querySelector("#unitBoard");
const unitLabel = document.querySelector("#unitLabel");
const quizTitle = document.querySelector("#quizTitle");
const roundBadge = document.querySelector("#roundBadge");
const progressFill = document.querySelector("#progressFill");
const questionText = document.querySelector("#questionText");
const choiceList = document.querySelector("#choiceList");
const feedback = document.querySelector("#feedback");
const resultTitle = document.querySelector("#resultTitle");
const resultMessage = document.querySelector("#resultMessage");
const correctValue = document.querySelector("#correctValue");
const rateValue = document.querySelector("#rateValue");
const scoreValue = document.querySelector("#scoreValue");
const historyList = document.querySelector("#historyList");
const retryButton = document.querySelector("#retryButton");
const homeButton = document.querySelector("#homeButton");
const backHomeButton = document.querySelector("#backHomeButton");
const setupBackButton = document.querySelector("#setupBackButton");
const startRadicalButton = document.querySelector("#startRadicalButton");
const setupNote = document.querySelector("#setupNote");
const radicalTypeInputs = [...document.querySelectorAll('input[name="radicalType"]')];
const questionCountInputs = [...document.querySelectorAll('input[name="questionCount"]')];
const setupQuestionCountInputs = [...document.querySelectorAll('input[name="setupQuestionCount"]')];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function signedNumber(n) {
  return n < 0 ? `(${n})` : `${n}`;
}

function signedNumberWithPlus(n) {
  if (n > 0) return `(+${n})`;
  if (n < 0) return `(${n})`;
  return "0";
}

function toSuperscript(n) {
  const map = { 2: "²", 3: "³" };
  return map[n] || String(n);
}

function makeSignedQuestion() {
  const ops = ["+", "-", "×"];
  const op = ops[randomInt(0, ops.length - 1)];
  const a = randomInt(-12, 12);
  let b = randomInt(-12, 12);
  if (op === "×" && b === 0) b = randomInt(1, 9);
  const showPlusSigns = Math.random() < 0.45;
  const leftText = showPlusSigns ? signedNumberWithPlus(a) : signedNumber(a);
  const rightText = showPlusSigns ? signedNumberWithPlus(b) : signedNumber(b);

  let answer = a + b;
  if (op === "-") answer = a - b;
  if (op === "×") answer = a * b;

  return {
    text: `${leftText} ${op} ${rightText}`,
    answer,
    hint: "符号に注目。マイナスが続く時は、かっこを外した後の符号を確認します。"
  };
}

function makePowerQuestion() {
  const absoluteBase = randomInt(2, 6);
  const isNegativeBase = Math.random() < 0.8;
  const base = isNegativeBase ? -absoluteBase : absoluteBase;
  const exponent = randomInt(2, 3);
  const negativePatterns = [1, 2, 3, 4, 4, 4];
  const pattern = base < 0
    ? negativePatterns[randomInt(0, negativePatterns.length - 1)]
    : randomInt(1, 3);

  if (base > 0 && pattern === 2) {
    return {
      text: `(+${absoluteBase})${toSuperscript(exponent)}`,
      answer: Math.pow(absoluteBase, exponent),
      hint: `+${absoluteBase} 全体を${exponent}回かけます。プラスの数なので答えもプラスです。`
    };
  }

  if (base > 0 && pattern === 3) {
    return {
      text: `(+${absoluteBase}${toSuperscript(exponent)})`,
      answer: Math.pow(absoluteBase, exponent),
      hint: `かっこの中は +${absoluteBase}${toSuperscript(exponent)} です。累乗は${absoluteBase}にかかります。`
    };
  }

  if (pattern === 2) {
    return {
      text: `-${absoluteBase}${toSuperscript(exponent)}`,
      answer: -Math.pow(absoluteBase, exponent),
      hint: `かっこがないので、累乗は${absoluteBase}だけにかかります。最後にマイナスを付けます。`
    };
  }

  if (pattern === 3) {
    return {
      text: `(-${absoluteBase})${toSuperscript(exponent)}`,
      answer: Math.pow(base, exponent),
      hint: `かっこがあるので、-${absoluteBase} 全体を${exponent}回かけます。`
    };
  }

  if (pattern === 4) {
    return {
      text: `(-${absoluteBase}${toSuperscript(exponent)})`,
      answer: -Math.pow(absoluteBase, exponent),
      hint: `かっこの中は -${absoluteBase}${toSuperscript(exponent)} です。累乗は${absoluteBase}だけにかかり、その結果にマイナスを付けます。`
    };
  }

  return {
    text: `${signedNumber(base)}${toSuperscript(exponent)}`,
    answer: Math.pow(base, exponent),
    hint: `累乗は同じ数を${exponent}回かけます。`
  };
}

function makeMixedQuestion() {
  return Math.random() < 0.55 ? makeSignedQuestion() : makePowerQuestion();
}

function simplifyRadicand(n) {
  let outside = 1;
  let inside = n;
  for (let factor = 2; factor * factor <= inside; factor++) {
    const square = factor * factor;
    while (inside % square === 0) {
      outside *= factor;
      inside /= square;
    }
  }
  return { outside, inside };
}

function greatestCommonDivisor(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x;
}

function radicalText(coefficient, radicand) {
  if (radicand === 1) return String(coefficient);
  if (coefficient === 1) return `√${radicand}`;
  if (coefficient === -1) return `-√${radicand}`;
  return `${coefficient}√${radicand}`;
}

function rationalizedText(numerator, radicand) {
  const divisor = greatestCommonDivisor(numerator, radicand);
  const reducedNumerator = numerator / divisor;
  const reducedDenominator = radicand / divisor;
  const numeratorText = radicalText(reducedNumerator, radicand);
  if (reducedDenominator === 1) return numeratorText;
  return `${numeratorText}/${reducedDenominator}`;
}

function unreducedRationalizedText(numerator, radicand) {
  return `${radicalText(numerator, radicand)}/${radicand}`;
}

function radicalQuotientText(numeratorRadicand, denominatorRadicand) {
  if (numeratorRadicand === denominatorRadicand) return "1";
  const denominator = denominatorRadicand;
  const product = numeratorRadicand * denominatorRadicand;
  const simplified = simplifyRadicand(product);
  const divisor = greatestCommonDivisor(simplified.outside, denominator);
  const reducedCoefficient = simplified.outside / divisor;
  const reducedDenominator = denominator / divisor;
  const numeratorText = radicalText(reducedCoefficient, simplified.inside);
  if (reducedDenominator === 1) return numeratorText;
  return `${numeratorText}/${reducedDenominator}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function rootMathMl(radicand) {
  return `<math class="math-inline"><msqrt><mn>${escapeHtml(radicand)}</mn></msqrt></math>`;
}

function renderLatex(tex) {
  if (window.katex) {
    return katex.renderToString(tex, {
      displayMode: false,
      throwOnError: false,
      strict: "ignore"
    });
  }
  return null;
}

function termToLatex(value) {
  const raw = String(value);
  const rootMatch = raw.match(/^(-?\d*)√(\d+)$/);
  if (rootMatch) {
    const coefficient = rootMatch[1];
    const radicand = rootMatch[2];
    if (coefficient === "") return `\\sqrt{${radicand}}`;
    if (coefficient === "-") return `-\\sqrt{${radicand}}`;
    return `${coefficient}\\sqrt{${radicand}}`;
  }
  return raw;
}

function termToMathMl(value) {
  const raw = String(value);
  const rootMatch = raw.match(/^(-?\d*)√(\d+)$/);
  if (rootMatch) {
    const coefficient = rootMatch[1];
    const radicand = rootMatch[2];
    const root = `<msqrt><mn>${escapeHtml(radicand)}</mn></msqrt>`;
    if (coefficient === "") return root;
    if (coefficient === "-") return `<mo>-</mo>${root}`;
    return `<mn>${escapeHtml(coefficient)}</mn>${root}`;
  }
  if (/^-?\d+$/.test(raw)) return `<mn>${escapeHtml(raw)}</mn>`;
  return `<mtext>${escapeHtml(raw)}</mtext>`;
}

function formatTerm(value) {
  const raw = String(value);
  let html = "";
  let lastIndex = 0;
  for (const match of raw.matchAll(/(-?\d*)√(\d+)/g)) {
    html += escapeHtml(raw.slice(lastIndex, match.index));
    html += renderLatex(termToLatex(match[0])) || (
      `${escapeHtml(match[1])}${rootMathMl(match[2])}`
    );
    lastIndex = match.index + match[0].length;
  }
  html += escapeHtml(raw.slice(lastIndex));
  return html;
}

function formatMath(value) {
  const raw = String(value);
  const fractionPattern = /(\d*√\d+|\d+)\/(\d*√\d+|\d+)/g;
  let html = "";
  let lastIndex = 0;
  for (const match of raw.matchAll(fractionPattern)) {
    html += formatTerm(raw.slice(lastIndex, match.index));
    const fractionLatex = `\\frac{${termToLatex(match[1])}}{${termToLatex(match[2])}}`;
    html += renderLatex(fractionLatex) || `<math class="math-fraction"><mfrac><mrow>${termToMathMl(match[1])}</mrow><mrow>${termToMathMl(match[2])}</mrow></mfrac></math>`;
    lastIndex = match.index + match[0].length;
  }
  html += formatTerm(raw.slice(lastIndex));
  return html;
}

function makeRadicalTransformQuestion() {
  const bases = [2, 3, 5, 6, 7];
  const base = bases[randomInt(0, bases.length - 1)];
  const multiplier = randomInt(2, 5);
  const radicand = base * multiplier * multiplier;
  const simplified = simplifyRadicand(radicand);
  return {
    text: `計算せよ：√${radicand}`,
    answerText: radicalText(simplified.outside, simplified.inside),
    hint: `√${radicand} の中から、2² や 3² のような平方数を外に出します。`
  };
}

function makeRadicalRationalizeQuestion() {
  const rationalizeCases = [
    { numerator: 1, radicand: 2 },
    { numerator: 2, radicand: 2 },
    { numerator: 4, radicand: 2 },
    { numerator: 3, radicand: 3 },
    { numerator: 6, radicand: 3 },
    { numerator: 5, radicand: 5 },
    { numerator: 3, radicand: 6 },
    { numerator: 6, radicand: 6 }
  ];
  const selectedCase = rationalizeCases[randomInt(0, rationalizeCases.length - 1)];
  const numerator = selectedCase.numerator;
  const radicand = selectedCase.radicand;
  const unreduced = unreducedRationalizedText(numerator, radicand);
  const reduced = rationalizedText(numerator, radicand);
  return {
    text: `計算せよ：${numerator}/√${radicand} を有理化`,
    answerText: reduced,
    hint: unreduced === reduced
      ? `分母の √${radicand} を消すために、分母と分子の両方に √${radicand} をかけます。`
      : `分母と分子に √${radicand} をかけると ${unreduced}。そこから約分して ${reduced} にします。`
  };
}

function makeRadicalArithmeticQuestion() {
  const bases = [2, 3, 5, 6, 7];
  const type = randomInt(1, 4);

  if (type === 1 || type === 2) {
    const base = bases[randomInt(0, bases.length - 1)];
    const a = randomInt(2, 6);
    const b = randomInt(1, a - 1);
    const op = type === 1 ? "+" : "-";
    const answerCoefficient = op === "+" ? a + b : a - b;
    return {
      text: `計算せよ：${radicalText(a, base)} ${op} ${radicalText(b, base)}`,
      answerText: radicalText(answerCoefficient, base),
      hint: `同じ √${base} どうしなので、前の数だけを計算します。`
    };
  }

  if (type === 3) {
    const left = bases[randomInt(0, bases.length - 1)];
    const right = bases[randomInt(0, bases.length - 1)];
    const product = left * right;
    const simplified = simplifyRadicand(product);
    return {
      text: `計算せよ：√${left} × √${right}`,
      answerText: radicalText(simplified.outside, simplified.inside),
      hint: `根号どうしのかけ算は、中の数をかけてから、できるだけ簡単にします。`
    };
  }

  const numerator = bases[randomInt(0, bases.length - 1)];
  const denominator = bases[randomInt(0, bases.length - 1)];
  const answer = radicalQuotientText(numerator, denominator);
  return {
    text: `計算せよ：√${numerator} ÷ √${denominator}`,
    answerText: answer,
    hint: numerator === denominator
      ? `同じ数の平方根どうしを割るので、答えは1です。`
      : `√${numerator} ÷ √${denominator} は √${numerator}/√${denominator} と考え、分母を有理化します。`
  };
}

function makeRadicalQuestion() {
  const makers = {
    transform: makeRadicalTransformQuestion,
    rationalize: makeRadicalRationalizeQuestion,
    arithmetic: makeRadicalArithmeticQuestion
  };
  const selectedTypes = state.selectedRadicalTypes.length
    ? state.selectedRadicalTypes
    : ["transform", "rationalize", "arithmetic"];
  const type = selectedTypes[randomInt(0, selectedTypes.length - 1)];
  return makers[type]();
}

function makeChoices(answer) {
  const choices = new Set([answer]);
  const spread = Math.max(4, Math.abs(answer));
  while (choices.size < 4) {
    const offset = randomInt(-spread, spread);
    const candidate = answer + offset || answer + randomInt(1, 6);
    if (candidate !== answer) choices.add(candidate);
  }
  return [...choices].sort(() => Math.random() - 0.5);
}

function makeRadicalChoices(answerText) {
  const choices = new Set([answerText]);
  const samples = [
    "√2", "2√2", "3√2", "√3", "2√3", "3√3",
    "√5", "2√5", "3√5", "√6", "2√6", "√7", "2√7",
    "√2/2", "2√3/3", "3√5/5", "5√7/7",
    "√2", "2√2", "√5", "6"
  ];
  while (choices.size < 4) {
    choices.add(samples[randomInt(0, samples.length - 1)]);
  }
  return [...choices].sort(() => Math.random() - 0.5);
}

function buildQuestion(unit) {
  const q = unit.makeQuestion();
  return {
    ...q,
    choices: q.answerText ? makeRadicalChoices(q.answerText) : makeChoices(q.answer)
  };
}

function renderHome() {
  unitBoard.innerHTML = units.map(group => `
    <section class="grade-section">
      <h2 class="grade-title">${group.grade}</h2>
      <div class="unit-grid">
        ${group.items.map(unit => `
          <button class="unit-card" type="button" data-unit="${unit.id}" ${unit.disabled ? "disabled" : ""}>
            <strong>${unit.title}</strong>
            <span>${unit.description}</span>
          </button>
        `).join("")}
      </div>
    </section>
  `).join("");

  unitBoard.querySelectorAll(".unit-card:not([disabled])").forEach(button => {
    button.addEventListener("click", () => {
      const unit = units.flatMap(group => group.items.map(item => ({ ...item, grade: group.grade })))
        .find(item => item.id === button.dataset.unit);
      if (unit.id === "radical") {
        openRadicalSetup(unit);
      } else {
        startQuiz(unit);
      }
    });
  });
}

function show(view) {
  homeView.classList.toggle("hidden", view !== "home");
  radicalSetupView.classList.toggle("hidden", view !== "radicalSetup");
  quizView.classList.toggle("hidden", view !== "quiz");
  resultView.classList.toggle("hidden", view !== "result");
}

function getSelectedQuestionCount(inputs = questionCountInputs) {
  const selected = inputs.find(input => input.checked);
  return selected ? Number(selected.value) : 10;
}

function setQuestionCount(value, sourceInputs = []) {
  state.questionCount = Number(value);
  [...questionCountInputs, ...setupQuestionCountInputs].forEach(input => {
    if (!sourceInputs.includes(input)) {
      input.checked = Number(input.value) === state.questionCount;
    }
  });
}

function openRadicalSetup(unit) {
  state.selectedUnit = unit;
  setQuestionCount(getSelectedQuestionCount());
  show("radicalSetup");
  updateRadicalStartState();
}

function getSelectedRadicalTypes() {
  return radicalTypeInputs
    .filter(input => input.checked)
    .map(input => input.value);
}

function updateRadicalStartState() {
  const selectedTypes = getSelectedRadicalTypes();
  const hasSelection = selectedTypes.length > 0;
  startRadicalButton.disabled = !hasSelection;
  setupNote.textContent = hasSelection
    ? "複数選ぶと、選んだ種類からランダムに出題します。"
    : "少なくとも1つ選んでください。";
}

function startRadicalQuiz() {
  state.selectedRadicalTypes = getSelectedRadicalTypes();
  setQuestionCount(getSelectedQuestionCount(setupQuestionCountInputs), setupQuestionCountInputs);
  startQuiz(state.selectedUnit);
}

function startQuiz(unit) {
  setQuestionCount(state.questionCount);
  state.selectedUnit = unit;
  state.questions = Array.from({ length: state.questionCount }, () => buildQuestion(unit));
  state.index = 0;
  state.correct = 0;
  state.history = [];
  state.locked = false;
  unitLabel.textContent = `${unit.grade}・${unit.title}`;
  quizTitle.textContent = `${unit.title} ${state.questionCount}問チャレンジ`;
  show("quiz");
  renderQuestion();
}

function renderQuestion() {
  const q = state.questions[state.index];
  state.locked = false;
  questionText.innerHTML = formatMath(q.text);
  roundBadge.textContent = `${state.index + 1}問目`;
  progressFill.style.width = `${(state.index / state.questionCount) * 100}%`;
  feedback.className = "feedback";
  feedback.textContent = "答えを選んでください。";
  choiceList.innerHTML = q.choices.map(choice => `
    <button class="choice-button" type="button" data-choice="${escapeHtml(choice)}">${formatMath(choice)}</button>
  `).join("");

  choiceList.querySelectorAll(".choice-button").forEach(button => {
    button.addEventListener("click", () => answerQuestion(button.dataset.choice, button));
  });
}

function answerQuestion(choice, button) {
  if (state.locked) return;
  state.locked = true;
  const q = state.questions[state.index];
  const correctAnswer = q.answerText || String(q.answer);
  const ok = choice === correctAnswer;
  if (ok) state.correct += 1;

  choiceList.querySelectorAll(".choice-button").forEach(choiceButton => {
    const value = choiceButton.dataset.choice;
    choiceButton.disabled = true;
    if (value === correctAnswer) choiceButton.classList.add("correct");
  });
  if (!ok) button.classList.add("wrong");

  feedback.className = `feedback ${ok ? "correct" : "wrong"}`;
  feedback.innerHTML = ok ? "正解です。次へ進みます。" : `答えは ${formatMath(correctAnswer)}。${formatMath(q.hint)}`;

  state.history.push({
    text: q.text,
    answer: correctAnswer,
    choice,
    ok
  });

  setTimeout(() => {
    state.index += 1;
    if (state.index >= state.questionCount) {
      progressFill.style.width = "100%";
      showResult();
    } else {
      renderQuestion();
    }
  }, ok ? 650 : 1300);
}

function showResult() {
  const rate = Math.round((state.correct / state.questionCount) * 100);
  const score = state.correct * 10;
  correctValue.textContent = `${state.questionCount}問中${state.correct}問`;
  rateValue.textContent = `${rate}%`;
  scoreValue.textContent = score;
  resultTitle.textContent = `${state.selectedUnit.title} の結果`;
  resultMessage.textContent = rate >= 80
    ? "かなり良いです。この単元は次のレベルへ進めそうです。"
    : rate >= 50
      ? "あと少しです。間違えた問題を見直しましょう。"
      : "まずは符号と累乗のルールをゆっくり確認しましょう。";

  historyList.innerHTML = state.history.map(item => {
    const mark = item.ok ? "○" : "×";
    const className = item.ok ? "ok" : "ng";
    return `<li class="${className}">${mark} ${formatMath(item.text)} = ${formatMath(item.answer)}　選択：${formatMath(item.choice)}</li>`;
  }).join("");

  show("result");
}

retryButton.addEventListener("click", () => startQuiz(state.selectedUnit));
homeButton.addEventListener("click", () => show("home"));
backHomeButton.addEventListener("click", () => show("home"));
setupBackButton.addEventListener("click", () => show("home"));
startRadicalButton.addEventListener("click", startRadicalQuiz);
radicalTypeInputs.forEach(input => {
  input.addEventListener("change", updateRadicalStartState);
});
questionCountInputs.forEach(input => {
  input.addEventListener("change", () => setQuestionCount(getSelectedQuestionCount(), questionCountInputs));
});
setupQuestionCountInputs.forEach(input => {
  input.addEventListener("change", () => setQuestionCount(getSelectedQuestionCount(setupQuestionCountInputs), setupQuestionCountInputs));
});

renderHome();
setQuestionCount(10);
show("home");
