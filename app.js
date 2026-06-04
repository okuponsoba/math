const units = [
  {
    grade: "中学1年：正負の数",
    items: [
      {
        id: "sign-reflex",
        title: "正負の瞬発ドリル",
        description: "足し算・引き算・かけ算・割り算の符号を素早く分ける",
        makeQuestion: makeSignReflexQuestion
      },
      {
        id: "signed",
        title: "正負の基本計算",
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
    grade: "中学2年：連立方程式",
    items: [
      {
        id: "linear-system-align",
        title: "連立方程式：加減法の一手",
        description: "係数合わせから消去後の式まで確認する",
        makeQuestion: makeLinearSystemStepQuestion
      }
    ]
  },
  {
    grade: "中学3年：平方根",
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

function makeIntegerChoices(answer, distractors = []) {
  const choices = new Set([answer]);
  distractors.forEach(value => {
    if (Number.isFinite(value) && value !== answer) choices.add(value);
  });

  const spread = Math.max(5, Math.abs(answer));
  while (choices.size < 4) {
    const offset = randomInt(-spread, spread);
    const candidate = answer + offset || answer + randomInt(1, 6);
    if (candidate !== answer) choices.add(candidate);
  }
  return [...choices].sort(() => Math.random() - 0.5);
}

function makeTextChoices(answerText, distractors = []) {
  const choices = new Set([answerText]);
  distractors.forEach(value => {
    if (value && value !== answerText) choices.add(value);
  });
  const fallbackChoices = [
    "①を2倍、②を3倍",
    "①を3倍、②を2倍",
    "①を4倍、②を3倍",
    "①はそのまま、②を2倍",
    "①を2倍、②はそのまま"
  ];
  for (const choice of fallbackChoices) {
    if (choices.size >= 4) break;
    if (choice !== answerText) choices.add(choice);
  }
  return [...choices].slice(0, 4).sort(() => Math.random() - 0.5);
}

function makeRuleConfusionChoices(correctAnswer, confusedAnswer) {
  return makeIntegerChoices(correctAnswer, [
    -correctAnswer,
    confusedAnswer,
    -confusedAnswer
  ]);
}

function makeSignReflexQuestion() {
  const a = randomInt(3, 9);
  const b = Math.random() < 0.55 ? a : randomInt(3, 9);
  const patterns = [
    "same-negative-add",
    "same-negative-add",
    "same-negative-add",
    "same-negative-multiply",
    "same-negative-multiply",
    "negative-add",
    "negative-multiply",
    "negative-subtract",
    "negative-divide",
    "opposite-subtract",
    "opposite-divide",
    "opposite-add",
    "opposite-multiply"
  ];
  const pattern = patterns[randomInt(0, patterns.length - 1)];

  if (pattern === "same-negative-add") {
    const answer = -a + -a;
    const confusedAnswer = -a * -a;
    return {
      text: `(-${a}) + (-${a})`,
      answer,
      choices: makeRuleConfusionChoices(answer, confusedAnswer),
      hint: `これは足し算です。マイナス方向に${a}進んで、さらにマイナス方向に${a}進むので ${answer} です。マイナス同士でプラスは、かけ算のルールです。`
    };
  }

  if (pattern === "same-negative-multiply") {
    const answer = -a * -a;
    const confusedAnswer = -a + -a;
    return {
      text: `(-${a}) × (-${a})`,
      answer,
      choices: makeRuleConfusionChoices(answer, confusedAnswer),
      hint: `これはかけ算です。マイナスとマイナスのかけ算なので、答えはプラスになります。`
    };
  }

  if (pattern === "negative-add") {
    const answer = -a + -b;
    const confusedAnswer = -a * -b;
    return {
      text: `(-${a}) + (-${b})`,
      answer,
      choices: makeRuleConfusionChoices(answer, confusedAnswer),
      hint: `これは足し算です。マイナスどうしを足すと、答えはもっとマイナスになります。`
    };
  }

  if (pattern === "negative-multiply") {
    const answer = -a * -b;
    const confusedAnswer = -a + -b;
    return {
      text: `(-${a}) × (-${b})`,
      answer,
      choices: makeRuleConfusionChoices(answer, confusedAnswer),
      hint: `これはかけ算です。マイナスとマイナスをかけるので、答えはプラスになります。`
    };
  }

  if (pattern === "negative-subtract") {
    const divisor = randomInt(3, 9);
    const quotient = randomInt(2, 9);
    const dividend = divisor * quotient;
    const answer = -dividend - -divisor;
    const confusedAnswer = (-dividend) / (-divisor);
    return {
      text: `(-${dividend}) - (-${divisor})`,
      answer,
      choices: makeRuleConfusionChoices(answer, confusedAnswer),
      hint: `これは引き算です。マイナスを引くので、反対のプラスに直して考えます。割り算の符号ルールとは分けます。`
    };
  }

  if (pattern === "negative-divide") {
    const divisor = randomInt(3, 9);
    const quotient = randomInt(2, 9);
    const dividend = divisor * quotient;
    const answer = (-dividend) / (-divisor);
    const confusedAnswer = -dividend - -divisor;
    return {
      text: `(-${dividend}) ÷ (-${divisor})`,
      answer,
      choices: makeRuleConfusionChoices(answer, confusedAnswer),
      hint: `これは割り算です。マイナスとマイナスの割り算なので、答えはプラスになります。`
    };
  }

  if (pattern === "opposite-subtract") {
    const divisor = randomInt(3, 9);
    const quotient = randomInt(2, 9);
    const dividend = divisor * quotient;
    const answer = dividend - -divisor;
    const confusedAnswer = dividend / -divisor;
    return {
      text: `(+${dividend}) - (-${divisor})`,
      answer,
      choices: makeRuleConfusionChoices(answer, confusedAnswer),
      hint: `これは引き算です。マイナスを引くので、+${dividend} + ${divisor} に直して考えます。`
    };
  }

  if (pattern === "opposite-divide") {
    const divisor = randomInt(3, 9);
    const quotient = randomInt(2, 9);
    const dividend = divisor * quotient;
    const answer = dividend / -divisor;
    const confusedAnswer = dividend - -divisor;
    return {
      text: `(+${dividend}) ÷ (-${divisor})`,
      answer,
      choices: makeRuleConfusionChoices(answer, confusedAnswer),
      hint: `これは割り算です。プラスとマイナスの割り算なので、答えはマイナスになります。`
    };
  }

  if (pattern === "opposite-add") {
    let oppositeB = b;
    if (oppositeB === a) oppositeB = a === 9 ? 8 : a + 1;
    const answer = a + -oppositeB;
    const confusedAnswer = a * -oppositeB;
    return {
      text: `(+${a}) + (-${oppositeB})`,
      answer,
      choices: makeRuleConfusionChoices(answer, confusedAnswer),
      hint: `これは足し算です。プラス方向とマイナス方向のどちらが大きいかを比べます。`
    };
  }

  let multiplyB = b;
  if (multiplyB === a) multiplyB = a === 9 ? 8 : a + 1;
  const multiplyAnswer = a * -multiplyB;
  const confusedAnswer = a + -multiplyB;
  return {
    text: `(+${a}) × (-${multiplyB})`,
    answer: multiplyAnswer,
    choices: makeRuleConfusionChoices(multiplyAnswer, confusedAnswer),
    hint: `これはかけ算です。プラスとマイナスをかけるので、答えはマイナスになります。`
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

function leastCommonMultiple(a, b) {
  return Math.abs(a * b) / greatestCommonDivisor(a, b);
}

function formatCoefficient(coefficient, variable, isFirst = false) {
  const sign = coefficient < 0 ? "-" : "+";
  const absolute = Math.abs(coefficient);
  const body = absolute === 1 ? variable : `${absolute}${variable}`;
  if (isFirst) return coefficient < 0 ? `-${body}` : body;
  return `${sign} ${body}`;
}

function formatLinearEquation(xCoefficient, yCoefficient, constant) {
  return `${formatCoefficient(xCoefficient, "x", true)} ${formatCoefficient(yCoefficient, "y")} = ${constant}`;
}

function formatEquationMultiplier(label, multiplier) {
  return multiplier === 1 ? `${label}はそのまま` : `${label}を${multiplier}倍`;
}

function formatMultiplierPair(firstMultiplier, secondMultiplier) {
  return `${formatEquationMultiplier("①", firstMultiplier)}、${formatEquationMultiplier("②", secondMultiplier)}`;
}

function formatLinearSystemHtml(firstEquation, secondEquation, target, operationLabel) {
  return `
    <div class="system-question">
      <p>${escapeHtml(target)}を消すために係数をそろえたあと、${escapeHtml(operationLabel)} を計算した式として正しいものはどれ？</p>
      <div class="linear-system" aria-label="連立方程式">
        <span class="system-brace">{</span>
        <span class="system-equation">${escapeHtml(firstEquation)}</span>
        <span class="system-number">・・・①</span>
        <span class="system-equation">${escapeHtml(secondEquation)}</span>
        <span class="system-number">・・・②</span>
      </div>
    </div>
  `;
}

function combineEquations(firstEquation, secondEquation, operation) {
  const sign = operation === "subtract" ? -1 : 1;
  return {
    x: firstEquation.x + sign * secondEquation.x,
    y: firstEquation.y + sign * secondEquation.y,
    constant: firstEquation.constant + sign * secondEquation.constant
  };
}

function formatReducedEquation(equation) {
  const terms = [];
  if (equation.x !== 0) terms.push(formatCoefficient(equation.x, "x", true));
  if (equation.y !== 0) terms.push(formatCoefficient(equation.y, "y", terms.length === 0));
  const left = terms.length ? terms.join(" ") : "0";
  return `${left} = ${equation.constant}`;
}

function scaledEquation(xCoefficient, yCoefficient, constant, multiplier) {
  return {
    x: xCoefficient * multiplier,
    y: yCoefficient * multiplier,
    constant: constant * multiplier
  };
}

function formatEquationObject(equation) {
  return formatLinearEquation(equation.x, equation.y, equation.constant);
}

function formatSystemStepChoice(firstMultiplier, secondMultiplier, firstEquation, secondEquation, operationLabel, resultEquation) {
  return `${formatMultiplierPair(firstMultiplier, secondMultiplier)}
①' ${firstEquation}
②' ${secondEquation}
${operationLabel}：${resultEquation}`;
}

function makeLinearSystemStepQuestion() {
  const target = Math.random() < 0.5 ? "x" : "y";
  const solutionX = randomInt(-4, 5) || 2;
  const solutionY = randomInt(-4, 5) || -3;
  let firstX = randomInt(2, 5);
  let secondX = randomInt(2, 5);
  let firstY = randomInt(2, 5);
  let secondY = randomInt(2, 5);

  while (target === "x" && firstX === secondX) secondX = randomInt(2, 5);
  while (target === "y" && firstY === secondY) secondY = randomInt(2, 5);
  if (Math.random() < 0.45) secondX *= -1;
  if (Math.random() < 0.45) secondY *= -1;

  const firstConstant = firstX * solutionX + firstY * solutionY;
  const secondConstant = secondX * solutionX + secondY * solutionY;
  const firstTarget = target === "x" ? Math.abs(firstX) : Math.abs(firstY);
  const secondTarget = target === "x" ? Math.abs(secondX) : Math.abs(secondY);
  const lcm = leastCommonMultiple(firstTarget, secondTarget);
  const firstMultiplier = lcm / firstTarget;
  const secondMultiplier = lcm / secondTarget;
  const otherTarget = target === "x" ? "y" : "x";

  const firstEquation = formatLinearEquation(firstX, firstY, firstConstant);
  const secondEquation = formatLinearEquation(secondX, secondY, secondConstant);
  const firstTargetSigned = target === "x" ? firstX : firstY;
  const secondTargetSigned = target === "x" ? secondX : secondY;
  const operation = firstTargetSigned * secondTargetSigned > 0 ? "subtract" : "add";
  const operationLabel = operation === "subtract" ? "①' - ②'" : "①' + ②'";
  const wrongOperation = operation === "subtract" ? "add" : "subtract";
  const wrongOperationLabel = wrongOperation === "subtract" ? "①' - ②'" : "①' + ②'";

  const makeTransformed = (firstChoiceMultiplier, secondChoiceMultiplier) => {
    const firstScaled = scaledEquation(firstX, firstY, firstConstant, firstChoiceMultiplier);
    const secondScaled = scaledEquation(secondX, secondY, secondConstant, secondChoiceMultiplier);
    return {
      first: firstScaled,
      second: secondScaled,
      firstText: formatEquationObject(firstScaled),
      secondText: formatEquationObject(secondScaled)
    };
  };

  const transformed = makeTransformed(firstMultiplier, secondMultiplier);
  const correctResult = formatReducedEquation(combineEquations(transformed.first, transformed.second, operation));
  const wrongOperationResult = formatReducedEquation(combineEquations(transformed.first, transformed.second, wrongOperation));
  const makeChoice = (firstChoiceMultiplier, secondChoiceMultiplier, choiceOperationLabel, resultEquation) => {
    const choiceTransformed = makeTransformed(firstChoiceMultiplier, secondChoiceMultiplier);
    return formatSystemStepChoice(
      firstChoiceMultiplier,
      secondChoiceMultiplier,
      choiceTransformed.firstText,
      choiceTransformed.secondText,
      choiceOperationLabel,
      resultEquation
    );
  };
  const answerText = makeChoice(firstMultiplier, secondMultiplier, operationLabel, correctResult);
  const wrongOperationText = makeChoice(firstMultiplier, secondMultiplier, wrongOperationLabel, wrongOperationResult);
  const swappedTransformed = makeTransformed(secondMultiplier, firstMultiplier);
  const swappedResult = formatReducedEquation(combineEquations(swappedTransformed.first, swappedTransformed.second, operation));
  const swappedText = makeChoice(secondMultiplier, firstMultiplier, operationLabel, swappedResult);
  const wrongResult = target === "x"
    ? formatReducedEquation({ x: 0, y: combineEquations(transformed.first, transformed.second, operation).y - 2, constant: combineEquations(transformed.first, transformed.second, operation).constant })
    : formatReducedEquation({ x: combineEquations(transformed.first, transformed.second, operation).x + 2, y: 0, constant: combineEquations(transformed.first, transformed.second, operation).constant });
  const wrongResultText = makeChoice(firstMultiplier, secondMultiplier, operationLabel, wrongResult);
  return {
    text: `次の連立方程式で、${target}を消すために係数をそろえたあと、${operationLabel} を計算した式として正しいものはどれ？ ① ${firstEquation} ② ${secondEquation}`,
    html: formatLinearSystemHtml(firstEquation, secondEquation, target, operationLabel),
    answerText,
    choices: makeTextChoices(answerText, [wrongOperationText, swappedText, wrongResultText]),
    hint: `${target}の係数は ${firstTarget} と ${secondTarget} なので、最小公倍数の ${lcm} にそろえます。係数が同じ符号なら引く、反対の符号なら足します。${otherTarget}ではなく、消したい ${target} を見ます。`,
    compact: true,
    textChoices: true
  };
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

function formatChoice(value) {
  return formatMath(value).replaceAll("\n", "<br>");
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
  return makeIntegerChoices(answer);
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
    choices: q.choices || (q.answerText ? makeRadicalChoices(q.answerText) : makeChoices(q.answer))
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
  questionText.classList.toggle("compact", !!q.compact);
  choiceList.classList.toggle("text-choices", !!q.textChoices);
  questionText.innerHTML = q.html || formatMath(q.text);
  roundBadge.textContent = `${state.index + 1}問目`;
  progressFill.style.width = `${(state.index / state.questionCount) * 100}%`;
  feedback.className = "feedback";
  feedback.textContent = "答えを選んでください。";
  choiceList.innerHTML = q.choices.map(choice => `
    <button class="choice-button" type="button" data-choice="${escapeHtml(choice)}">${formatChoice(choice)}</button>
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
  const score = rate;
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
