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
        description: "整数・分数・小数の式変形を確認する",
        makeQuestion: makeLinearSystemQuestion
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
  selectedGradeIndex: 0,
  selectedRadicalTypes: ["transform", "rationalize", "arithmetic"],
  selectedLinearTypes: ["integer"],
  questionCount: 10,
  questions: [],
  index: 0,
  correct: 0,
  history: [],
  locked: false,
  missedCurrent: false
};

const homeView = document.querySelector("#homeView");
const unitView = document.querySelector("#unitView");
const linearSetupView = document.querySelector("#linearSetupView");
const radicalSetupView = document.querySelector("#radicalSetupView");
const readyView = document.querySelector("#readyView");
const quizView = document.querySelector("#quizView");
const resultView = document.querySelector("#resultView");
const gradeBoard = document.querySelector("#gradeBoard");
const unitBoard = document.querySelector("#unitBoard");
const gradeTitle = document.querySelector("#gradeTitle");
const unitLabel = document.querySelector("#unitLabel");
const quizTitle = document.querySelector("#quizTitle");
const roundBadge = document.querySelector("#roundBadge");
const progressFill = document.querySelector("#progressFill");
const questionText = document.querySelector("#questionText");
const choiceList = document.querySelector("#choiceList");
const feedback = document.querySelector("#feedback");
const nextButton = document.querySelector("#nextButton");
const answerStamp = document.querySelector("#answerStamp");
const resultTitle = document.querySelector("#resultTitle");
const resultMessage = document.querySelector("#resultMessage");
const correctValue = document.querySelector("#correctValue");
const rateValue = document.querySelector("#rateValue");
const scoreValue = document.querySelector("#scoreValue");
const historyList = document.querySelector("#historyList");
const retryButton = document.querySelector("#retryButton");
const homeButton = document.querySelector("#homeButton");
const backHomeButton = document.querySelector("#backHomeButton");
const backGradeButton = document.querySelector("#backGradeButton");
const readyBackButton = document.querySelector("#readyBackButton");
const readyStartButton = document.querySelector("#readyStartButton");
const readyHomeButton = document.querySelector("#readyHomeButton");
const readyText = document.querySelector("#readyText");
const readyUnitValue = document.querySelector("#readyUnitValue");
const readyCountValue = document.querySelector("#readyCountValue");
const setupBackButton = document.querySelector("#setupBackButton");
const linearSetupBackButton = document.querySelector("#linearSetupBackButton");
const startLinearButton = document.querySelector("#startLinearButton");
const startRadicalButton = document.querySelector("#startRadicalButton");
const setupNote = document.querySelector("#setupNote");
const linearSetupNote = document.querySelector("#linearSetupNote");
const linearTypeInputs = [...document.querySelectorAll('input[name="linearType"]')];
const radicalTypeInputs = [...document.querySelectorAll('input[name="radicalType"]')];
const questionCountInputs = [...document.querySelectorAll('input[name="questionCount"]')];
const linearQuestionCountInputs = [...document.querySelectorAll('input[name="linearQuestionCount"]')];
const setupQuestionCountInputs = [...document.querySelectorAll('input[name="setupQuestionCount"]')];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(items) {
  return items[randomInt(0, items.length - 1)];
}

function randomNonZeroInt(min, max) {
  let value = 0;
  while (value === 0) value = randomInt(min, max);
  return value;
}

function maybeNegative(value, chance = 0.5) {
  return Math.random() < chance ? -value : value;
}

function hasRepeatedDigit(value) {
  const digits = String(Math.abs(value));
  return digits.length > 1 && new Set(digits).size === 1;
}

function makeDivisionPair() {
  const divisors = [3, 4, 5, 6, 7, 8, 9, 11, 12];
  const quotients = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  let divisor = randomChoice(divisors);
  let quotient = randomChoice(quotients);
  let dividend = divisor * quotient;
  let guard = 0;
  while (
    guard < 80 &&
    (
      hasRepeatedDigit(dividend) ||
      dividend > 96 ||
      dividend % 10 === 0 ||
      String(Math.abs(dividend)).endsWith(String(Math.abs(divisor))) ||
      Math.abs(dividend - divisor) < 12 ||
      divisor === quotient
    )
  ) {
    divisor = randomChoice(divisors);
    quotient = randomChoice(quotients);
    dividend = divisor * quotient;
    guard += 1;
  }
  return { dividend, divisor, quotient };
}

function makeSubtractionPair() {
  let left = randomInt(14, 96);
  let right = randomInt(3, 18);
  let guard = 0;
  while (
    guard < 80 &&
    (
      hasRepeatedDigit(left) ||
      String(left).endsWith(String(right)) ||
      Math.abs(left - right) < 12 ||
      left % right !== 0
    )
  ) {
    left = randomInt(14, 96);
    right = randomInt(3, 18);
    guard += 1;
  }
  return { left, right };
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
  const range = op === "×" ? 12 : 24;
  const a = randomNonZeroInt(-range, range);
  let b = randomNonZeroInt(-range, range);
  if (op === "×") {
    b = randomNonZeroInt(-12, 12);
  }
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
  const a = randomInt(3, 14);
  let b = randomInt(3, 14);
  while (b === a) b = randomInt(3, 14);
  const patterns = [
    "negative-add",
    "negative-add",
    "negative-multiply",
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
    const { left, right } = makeSubtractionPair();
    const answer = -left - -right;
    const confusedAnswer = (-left) / (-right);
    return {
      text: `(-${left}) - (-${right})`,
      answer,
      choices: makeRuleConfusionChoices(answer, confusedAnswer),
      hint: `これは引き算です。マイナスを引くので、反対のプラスに直して考えます。割り算の符号ルールとは分けます。`
    };
  }

  if (pattern === "negative-divide") {
    const { dividend, divisor } = makeDivisionPair();
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
    const { left, right } = makeSubtractionPair();
    const answer = left - -right;
    const confusedAnswer = left / -right;
    return {
      text: `(+${left}) - (-${right})`,
      answer,
      choices: makeRuleConfusionChoices(answer, confusedAnswer),
      hint: `これは引き算です。マイナスを引くので、+${left} + ${right} に直して考えます。`
    };
  }

  if (pattern === "opposite-divide") {
    const { dividend, divisor } = makeDivisionPair();
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
  const absoluteBase = randomInt(2, 9);
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

function makeBaseLinearSystem() {
  const solutionX = randomNonZeroInt(-6, 6);
  const solutionY = randomNonZeroInt(-6, 6);
  const firstX = maybeNegative(randomInt(1, 8), 0.35);
  const firstY = maybeNegative(randomInt(1, 8), 0.45);
  let secondX = maybeNegative(randomInt(1, 8), 0.45);
  let secondY = maybeNegative(randomInt(1, 8), 0.45);
  while (Math.abs(firstX) === Math.abs(secondX) && Math.abs(firstY) === Math.abs(secondY)) {
    secondX = maybeNegative(randomInt(1, 8), 0.45);
    secondY = maybeNegative(randomInt(1, 8), 0.45);
  }
  return {
    first: {
      x: firstX,
      y: firstY,
      constant: firstX * solutionX + firstY * solutionY
    },
    second: {
      x: secondX,
      y: secondY,
      constant: secondX * solutionX + secondY * solutionY
    }
  };
}

function coefficientToLatex(coefficient, variable, isFirst = false) {
  if (coefficient === 0) return "";
  const sign = coefficient < 0 ? "-" : "+";
  const absolute = Math.abs(coefficient);
  const body = absolute === 1 ? variable : `${absolute}${variable}`;
  if (isFirst) return coefficient < 0 ? `-${body}` : body;
  return `${sign} ${body}`;
}

function equationToLatex(equation) {
  return `${coefficientToLatex(equation.x, "x", true)} ${coefficientToLatex(equation.y, "y")} = ${equation.constant}`;
}

function fractionNumberToLatex(numerator, denominator) {
  if (numerator === 0) return "0";
  const sign = numerator < 0 ? "-" : "";
  return `${sign}\\frac{${Math.abs(numerator)}}{${denominator}}`;
}

function fractionCoefficientToLatex(numerator, denominator, variable, isFirst = false) {
  if (numerator === 0) return "";
  const sign = numerator < 0 ? "-" : "+";
  const absolute = Math.abs(numerator);
  const body = absolute === denominator
    ? variable
    : `\\frac{${absolute}}{${denominator}}${variable}`;
  if (isFirst) return numerator < 0 ? `-${body}` : body;
  return `${sign} ${body}`;
}

function signedFractionTermToLatex(numerator, denominator, variable, isFirst = false) {
  const sign = numerator < 0 ? "-" : "+";
  const absolute = Math.abs(numerator);
  const body = absolute === denominator
    ? variable
    : `\\frac{${absolute}}{${denominator}}${variable}`;
  if (isFirst) return numerator < 0 ? `-${body}` : body;
  return `${sign} ${body}`;
}

function fractionEquationPartsToLatex(parts) {
  return `${signedFractionTermToLatex(parts.xNumerator, parts.xDenominator, "x", true)} ${signedFractionTermToLatex(parts.yNumerator, parts.yDenominator, "y")} = ${fractionNumberToLatex(parts.constantNumerator, parts.constantDenominator)}`;
}

function decimalNumber(value) {
  return Number(value.toFixed(2)).toString();
}

function decimalCoefficientToLatex(value, variable, isFirst = false) {
  if (value === 0) return "";
  const sign = value < 0 ? "-" : "+";
  const absolute = Math.abs(value);
  const body = absolute === 1 ? variable : `${decimalNumber(absolute)}${variable}`;
  if (isFirst) return value < 0 ? `-${body}` : body;
  return `${sign} ${body}`;
}

function decimalEquationToLatex(equation, denominator) {
  return `${decimalCoefficientToLatex(equation.x / denominator, "x", true)} ${decimalCoefficientToLatex(equation.y / denominator, "y")} = ${decimalNumber(equation.constant / denominator)}`;
}

function formatClearChoice(firstMultiplier, secondMultiplier, firstEquationLatex, secondEquationLatex, note = "") {
  return `${formatMultiplierPair(firstMultiplier, secondMultiplier)}
tex:①' ${firstEquationLatex}
tex:②' ${secondEquationLatex}${note ? `\n${note}` : ""}`;
}

function formatSystemStepChoice(firstMultiplier, secondMultiplier, firstEquation, secondEquation, operationLabel, resultEquation) {
  return `${formatMultiplierPair(firstMultiplier, secondMultiplier)}
①' ${firstEquation}
②' ${secondEquation}
${operationLabel}：${resultEquation}`;
}

function makeLinearSystemClearQuestion(kind) {
  const system = makeBaseLinearSystem();
  const denominator = kind === "fraction"
    ? [2, 3, 4, 5][randomInt(0, 3)]
    : [10, 100][randomInt(0, 1)];
  if (kind === "fraction") {
    return makeLinearSystemFractionClearQuestion(system);
  }

  const firstLatex = decimalEquationToLatex(system.first, denominator);
  const secondLatex = equationToLatex(system.second);
  const firstClearedLatex = equationToLatex(system.first);
  const secondClearedLatex = equationToLatex(system.second);
  const wrongFirstMultiplier = denominator === 2 ? 3 : denominator - 1;
  const prompt = kind === "fraction"
    ? "①の分数をなくして、整数の式になおす変形はどれ？"
    : "①の小数をなくして、整数の式になおす変形はどれ？";
  const answerText = formatClearChoice(denominator, 1, firstClearedLatex, secondClearedLatex);
  const wrongSecondText = formatClearChoice(1, denominator, firstLatex, equationToLatex(scaledEquation(system.second.x, system.second.y, system.second.constant, denominator)));
  const wrongMultiplierText = formatClearChoice(wrongFirstMultiplier, 1, equationToLatex(scaledEquation(system.first.x, system.first.y, system.first.constant, wrongFirstMultiplier / denominator)), secondClearedLatex);
  const unchangedText = formatClearChoice(1, 1, firstLatex, secondClearedLatex);

  return {
    text: `${prompt} ① ${firstLatex} ② ${secondLatex}`,
    html: formatLinearSystemLatexHtml(firstLatex, secondLatex, prompt),
    answerText,
    choices: makeTextChoices(answerText, [wrongSecondText, wrongMultiplierText, unchangedText]),
    hint: kind === "fraction"
      ? `①の分母が ${denominator} なので、①の両辺を ${denominator} 倍すると整数の式になります。`
      : `①は小数の式なので、①の両辺を ${denominator} 倍すると整数の式になります。`,
    compact: true,
    textChoices: true,
    htmlChoices: true
  };
}

function makeLinearSystemFractionClearQuestion(system) {
  const denominatorPairs = [
    [2, 3],
    [2, 5],
    [3, 4],
    [3, 5],
    [4, 5],
    [2, 3]
  ];
  const selectedPair = denominatorPairs[randomInt(0, denominatorPairs.length - 1)];
  const xDenominator = selectedPair[0];
  const yDenominator = selectedPair[1];
  const commonDenominator = leastCommonMultiple(xDenominator, yDenominator);
  const constantDenominator = Math.random() < 0.5 ? xDenominator : yDenominator;
  const parts = {
    xNumerator: system.first.x * xDenominator,
    xDenominator,
    yNumerator: system.first.y * yDenominator,
    yDenominator,
    constantNumerator: system.first.constant * constantDenominator,
    constantDenominator
  };
  const firstLatex = fractionEquationPartsToLatex(parts);
  const secondLatex = equationToLatex(system.second);
  const firstClearedLatex = equationToLatex(scaledEquation(
    parts.xNumerator / parts.xDenominator,
    parts.yNumerator / parts.yDenominator,
    parts.constantNumerator / parts.constantDenominator,
    commonDenominator
  ));
  const secondClearedLatex = equationToLatex(system.second);
  const wrongXOnlyLatex = `${system.first.x * xDenominator}x ${formatCoefficient(system.first.y, "y")} = ${system.first.constant}`;
  const wrongYOnlyLatex = `${formatCoefficient(system.first.x, "x", true)} ${formatCoefficient(system.first.y * yDenominator, "y")} = ${system.first.constant}`;
  const wrongNoConstantLatex = formatLinearEquation(
    system.first.x * commonDenominator,
    system.first.y * commonDenominator,
    system.first.constant
  );
  const answerText = formatClearChoice(commonDenominator, 1, firstClearedLatex, secondClearedLatex);
  const xOnlyText = formatClearChoice(commonDenominator, 1, wrongXOnlyLatex, secondClearedLatex, "xの項だけにかけてしまった");
  const yOnlyText = formatClearChoice(commonDenominator, 1, wrongYOnlyLatex, secondClearedLatex, "yの項だけにかけてしまった");
  const noConstantText = formatClearChoice(commonDenominator, 1, wrongNoConstantLatex, secondClearedLatex, "右辺にかけ忘れている");

  return {
    text: `①の分数をなくして、整数の式になおす変形はどれ？ ① ${firstLatex} ② ${secondLatex}`,
    html: formatLinearSystemLatexHtml(firstLatex, secondLatex, "①の分数をなくして、整数の式になおす変形はどれ？"),
    answerText,
    choices: makeTextChoices(answerText, [xOnlyText, yOnlyText, noConstantText]),
    hint: `分母は ${xDenominator} と ${yDenominator} です。最小公倍数の ${commonDenominator} を①の両辺全体にかけます。右辺にも必ずかけます。`,
    compact: true,
    textChoices: true,
    htmlChoices: true
  };
}

function makeLinearSystemStepQuestion() {
  const target = Math.random() < 0.5 ? "x" : "y";
  const solutionX = randomNonZeroInt(-6, 6);
  const solutionY = randomNonZeroInt(-6, 6);
  let firstX = maybeNegative(randomInt(1, 8), 0.3);
  let secondX = maybeNegative(randomInt(1, 8), 0.45);
  let firstY = maybeNegative(randomInt(1, 8), 0.35);
  let secondY = maybeNegative(randomInt(1, 8), 0.45);

  while (target === "x" && Math.abs(firstX) === Math.abs(secondX)) secondX = maybeNegative(randomInt(1, 8), 0.45);
  while (target === "y" && Math.abs(firstY) === Math.abs(secondY)) secondY = maybeNegative(randomInt(1, 8), 0.45);

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

function makeLinearSystemQuestion() {
  const makers = {
    integer: makeLinearSystemStepQuestion,
    fraction: () => makeLinearSystemClearQuestion("fraction"),
    decimal: () => makeLinearSystemClearQuestion("decimal")
  };
  const selectedTypes = state.selectedLinearTypes.length
    ? state.selectedLinearTypes
    : ["integer"];
  const type = selectedTypes[randomInt(0, selectedTypes.length - 1)];
  return makers[type]();
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
  return `<span class="root-expression" aria-label="ルート${escapeHtml(radicand)}"><span class="root-symbol">√</span><span class="root-radicand">${escapeHtml(radicand)}</span></span>`;
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

function inlineLatex(tex) {
  return renderLatex(tex) || escapeHtml(tex);
}

function formatLinearSystemLatexHtml(firstLatex, secondLatex, prompt) {
  return `
    <div class="system-question">
      <p>${escapeHtml(prompt)}</p>
      <div class="linear-system" aria-label="連立方程式">
        <span class="system-brace">{</span>
        <span class="system-equation">${inlineLatex(firstLatex)}</span>
        <span class="system-number">・・・①</span>
        <span class="system-equation">${inlineLatex(secondLatex)}</span>
        <span class="system-number">・・・②</span>
      </div>
    </div>
  `;
}

function formatSystemChoiceHtml(value) {
  return String(value)
    .split("\n")
    .map(line => {
      if (line.startsWith("tex:")) {
        const content = line.slice(4);
        const separator = content.indexOf(" ");
        if (separator > -1) {
          return `${escapeHtml(content.slice(0, separator))} ${inlineLatex(content.slice(separator + 1))}`;
        }
        return inlineLatex(content);
      }
      return escapeHtml(line);
    })
    .join("<br>");
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

function formatPlainRootTerm(value) {
  const raw = String(value);
  let html = "";
  let lastIndex = 0;
  for (const match of raw.matchAll(/(-?\d*)√(\d+)/g)) {
    html += escapeHtml(raw.slice(lastIndex, match.index));
    html += `${escapeHtml(match[1])}${rootMathMl(match[2])}`;
    lastIndex = match.index + match[0].length;
  }
  html += escapeHtml(raw.slice(lastIndex));
  return html;
}

function formatStackedFraction(numerator, denominator) {
  return `<span class="fraction-stack"><span class="fraction-top">${formatTerm(numerator)}</span><span class="fraction-bottom">${formatTerm(denominator)}</span></span>`;
}

function formatPlainRootFraction(numerator, denominator) {
  return `<span class="fraction-stack"><span class="fraction-top">${formatPlainRootTerm(numerator)}</span><span class="fraction-bottom">${formatPlainRootTerm(denominator)}</span></span>`;
}

function formatMath(value) {
  const raw = String(value);
  const fractionPattern = /(\d*√\d+|\d+)\/(\d*√\d+|\d+)/g;
  let html = "";
  let lastIndex = 0;
  for (const match of raw.matchAll(fractionPattern)) {
    html += formatTerm(raw.slice(lastIndex, match.index));
    const fractionLatex = `\\frac{${termToLatex(match[1])}}{${termToLatex(match[2])}}`;
    html += renderLatex(fractionLatex) || formatStackedFraction(match[1], match[2]);
    lastIndex = match.index + match[0].length;
  }
  html += formatTerm(raw.slice(lastIndex));
  return html;
}

function formatAnswerChoice(value) {
  const raw = String(value);
  const fractionPattern = /(-?\d*√\d+|-?\d+)\/(-?\d*√\d+|-?\d+)/g;
  let html = "";
  let lastIndex = 0;
  for (const match of raw.matchAll(fractionPattern)) {
    html += formatPlainRootTerm(raw.slice(lastIndex, match.index));
    html += formatPlainRootFraction(match[1], match[2]);
    lastIndex = match.index + match[0].length;
  }
  html += formatPlainRootTerm(raw.slice(lastIndex));
  return html.replaceAll("\n", "<br>");
}

function formatChoice(value) {
  const raw = String(value);
  if (raw.includes("√")) return formatAnswerChoice(raw);
  return formatMath(raw).replaceAll("\n", "<br>");
}

function makeRadicalTransformQuestion() {
  const bases = [2, 3, 5, 6, 7, 10, 11, 13];
  const base = randomChoice(bases);
  const multiplier = randomInt(2, 8);
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
      { numerator: 6, radicand: 6 },
      { numerator: 7, radicand: 2 },
      { numerator: 8, radicand: 3 },
      { numerator: 9, radicand: 5 },
      { numerator: 10, radicand: 7 },
      { numerator: 4, radicand: 10 }
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
  const bases = [2, 3, 5, 6, 7, 10, 11, 13];
  const type = randomInt(1, 4);

  if (type === 1 || type === 2) {
    const base = randomChoice(bases);
    const a = randomInt(2, 9);
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
    const left = randomChoice(bases);
    let right = randomChoice(bases);
    while (right === left) right = randomChoice(bases);
    const product = left * right;
    const simplified = simplifyRadicand(product);
    return {
      text: `計算せよ：√${left} × √${right}`,
      answerText: radicalText(simplified.outside, simplified.inside),
      hint: `根号どうしのかけ算は、中の数をかけてから、できるだけ簡単にします。`
    };
  }

  const numerator = randomChoice(bases);
  let denominator = randomChoice(bases);
  while (denominator === numerator) denominator = randomChoice(bases);
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
  const radicalMatch = String(answerText).match(/^(-?\d*)√(\d+)(?:\/(\d+))?$/);
  const radicands = [2, 3, 5, 6, 7, 10, 11, 13];
  const samples = [];

  if (radicalMatch) {
    const coefficientText = radicalMatch[1];
    const coefficient = coefficientText === "" ? 1 : coefficientText === "-" ? -1 : Number(coefficientText);
    const radicand = Number(radicalMatch[2]);
    const denominator = radicalMatch[3] ? Number(radicalMatch[3]) : 1;
    const coefficientCandidates = [
      coefficient + 1,
      coefficient - 1,
      -coefficient,
      coefficient === 1 ? 2 : 1
    ].filter(value => value !== 0);
    coefficientCandidates.forEach(value => {
      const term = radicalText(value, radicand);
      samples.push(denominator === 1 ? term : `${term}/${denominator}`);
    });
    samples.push(radicalText(coefficient, randomChoice(radicands.filter(value => value !== radicand))));
    if (denominator !== 1) {
      samples.push(radicalText(coefficient, radicand));
      samples.push(`${radicalText(coefficient, radicand)}/${denominator + 1}`);
    }
  }

  samples.push(
    "√2", "2√2", "3√2", "√3", "2√3", "3√3",
    "√5", "2√5", "3√5", "√6", "2√6", "√7", "2√7",
    "√10", "2√10", "√11", "3√11", "√13", "2√13",
    "√2/2", "2√3/3", "3√5/5", "5√7/7"
  );
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
  gradeBoard.innerHTML = units.map((group, index) => `
    <button class="unit-card grade-card" type="button" data-grade-index="${index}">
      <strong>中${index + 1}</strong>
    </button>
  `).join("");

  gradeBoard.querySelectorAll(".grade-card").forEach(button => {
    button.addEventListener("click", () => {
      state.selectedGradeIndex = Number(button.dataset.gradeIndex);
      renderUnitSelect(state.selectedGradeIndex);
      show("unit");
    });
  });
}

function renderUnitSelect(gradeIndex) {
  const group = units[gradeIndex];
  state.selectedGradeIndex = gradeIndex;
  gradeTitle.textContent = `${group.grade}の単元を選ぶ`;
  unitBoard.innerHTML = `
    <section class="grade-section">
      <div class="unit-grid">
        ${group.items.map(unit => `
          <button class="unit-card" type="button" data-unit="${unit.id}" ${unit.disabled ? "disabled" : ""}>
            <strong>${unit.title}</strong>
            <span>${unit.description}</span>
          </button>
        `).join("")}
      </div>
    </section>
  `;

  unitBoard.querySelectorAll(".unit-card:not([disabled])").forEach(button => {
    button.addEventListener("click", () => {
      const unit = group.items
        .map(item => ({ ...item, grade: group.grade }))
        .find(item => item.id === button.dataset.unit);
      if (unit.id === "linear-system-align") {
        openLinearSetup(unit);
      } else if (unit.id === "radical") {
        openRadicalSetup(unit);
      } else {
        openReady(unit);
      }
    });
  });
}

function showSelectedUnitList() {
  renderUnitSelect(state.selectedGradeIndex);
  show("unit");
}

function show(view) {
  homeView.classList.toggle("hidden", view !== "home");
  unitView.classList.toggle("hidden", view !== "unit");
  linearSetupView.classList.toggle("hidden", view !== "linearSetup");
  radicalSetupView.classList.toggle("hidden", view !== "radicalSetup");
  readyView.classList.toggle("hidden", view !== "ready");
  quizView.classList.toggle("hidden", view !== "quiz");
  resultView.classList.toggle("hidden", view !== "result");
}

function getSelectedQuestionCount(inputs = questionCountInputs) {
  const selected = inputs.find(input => input.checked);
  return selected ? Number(selected.value) : 10;
}

function setQuestionCount(value, sourceInputs = []) {
  state.questionCount = Number(value);
  [...questionCountInputs, ...linearQuestionCountInputs, ...setupQuestionCountInputs].forEach(input => {
    if (!sourceInputs.includes(input)) {
      input.checked = Number(input.value) === state.questionCount;
    }
  });
}

function openLinearSetup(unit) {
  state.selectedUnit = unit;
  setQuestionCount(getSelectedQuestionCount());
  show("linearSetup");
  updateLinearStartState();
}

function getSelectedLinearTypes() {
  return linearTypeInputs
    .filter(input => input.checked)
    .map(input => input.value);
}

function updateLinearStartState() {
  const selectedTypes = getSelectedLinearTypes();
  const hasSelection = selectedTypes.length > 0;
  startLinearButton.disabled = !hasSelection;
  linearSetupNote.textContent = hasSelection
    ? "複数選ぶと、選んだ形式からランダムに出題します。"
    : "少なくとも1つ選んでください。";
}

function startLinearQuiz() {
  state.selectedLinearTypes = getSelectedLinearTypes();
  setQuestionCount(getSelectedQuestionCount(linearQuestionCountInputs), linearQuestionCountInputs);
  openReady(state.selectedUnit);
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
  openReady(state.selectedUnit);
}

function openReady(unit) {
  state.selectedUnit = unit;
  readyUnitValue.textContent = unit.title;
  readyCountValue.textContent = `${state.questionCount}問`;
  readyText.textContent = `${unit.grade}・${unit.title}を${state.questionCount}問解きます。スタートを押すと始まります。`;
  show("ready");
}

function startQuiz(unit) {
  setQuestionCount(state.questionCount);
  state.selectedUnit = unit;
  state.questions = Array.from({ length: state.questionCount }, () => buildQuestion(unit));
  state.index = 0;
  state.correct = 0;
  state.history = [];
  state.locked = false;
  state.missedCurrent = false;
  unitLabel.textContent = `${unit.grade}・${unit.title}`;
  quizTitle.textContent = `${unit.title} ${state.questionCount}問チャレンジ`;
  show("quiz");
  renderQuestion();
}

function formatQuestionText(value) {
  const raw = String(value);
  const separators = ["：", ":"];
  for (const separator of separators) {
    const index = raw.indexOf(separator);
    if (index > -1) {
      const instruction = raw.slice(0, index + separator.length);
      const expression = raw.slice(index + separator.length).trim();
      return `
        <span class="question-instruction">${escapeHtml(instruction)}</span>
        <span class="question-expression">${formatMath(expression)}</span>
      `;
    }
  }
  return `<span class="question-expression">${formatMath(raw)}</span>`;
}

function renderQuestion() {
  const q = state.questions[state.index];
  state.locked = false;
  answerStamp.classList.remove("show");
  nextButton.classList.add("hidden");
  questionText.classList.toggle("compact", !!q.compact);
  choiceList.classList.toggle("text-choices", !!q.textChoices);
  questionText.innerHTML = q.html || formatQuestionText(q.text);
  roundBadge.textContent = `${state.index + 1}問目`;
  progressFill.style.width = `${(state.index / state.questionCount) * 100}%`;
  feedback.className = "feedback";
  feedback.textContent = "答えを選んでください。";
  choiceList.innerHTML = q.choices.map(choice => `
    <button class="choice-button" type="button" data-choice="${escapeHtml(choice)}">${q.htmlChoices ? formatSystemChoiceHtml(choice) : formatChoice(choice)}</button>
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
  if (ok && !state.missedCurrent) state.correct += 1;

  choiceList.querySelectorAll(".choice-button").forEach(choiceButton => {
    const value = choiceButton.dataset.choice;
    choiceButton.disabled = true;
    if (value === correctAnswer) choiceButton.classList.add("correct");
  });
  if (!ok) button.classList.add("wrong");

  feedback.className = `feedback ${ok ? "correct" : "wrong"}`;
  const correctHtml = q.htmlChoices ? formatSystemChoiceHtml(correctAnswer) : formatMath(correctAnswer);
  feedback.innerHTML = ok
    ? (state.missedCurrent ? "正解です。次へ進みます。この問題は最初に間違えたので、正解数には入りません。" : "正解です。次へ進みます。")
    : `答えは ${correctHtml}。${formatMath(q.hint)}もう一度、同じ問題に挑戦しましょう。`;
  if (ok) {
    answerStamp.classList.remove("show");
    window.requestAnimationFrame(() => {
      answerStamp.classList.add("show");
    });

    state.history.push({
      text: q.text,
      answer: correctAnswer,
      choice,
      ok: !state.missedCurrent,
      retried: state.missedCurrent
    });

    setTimeout(() => {
      state.index += 1;
      state.missedCurrent = false;
      if (state.index >= state.questionCount) {
        progressFill.style.width = "100%";
        showResult();
      } else {
        renderQuestion();
      }
    }, 650);
    return;
  }

  state.missedCurrent = true;
  nextButton.classList.remove("hidden");
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
    const retryLabel = item.retried ? "（やり直し正解）" : "";
    return `<li class="${className}">${mark} ${formatMath(item.text)} = ${formatMath(item.answer)}　選択：${formatMath(item.choice)}${retryLabel}</li>`;
  }).join("");

  show("result");
}

retryButton.addEventListener("click", () => startQuiz(state.selectedUnit));
homeButton.addEventListener("click", showSelectedUnitList);
backHomeButton.addEventListener("click", showSelectedUnitList);
backGradeButton.addEventListener("click", () => show("home"));
readyBackButton.addEventListener("click", showSelectedUnitList);
readyHomeButton.addEventListener("click", showSelectedUnitList);
readyStartButton.addEventListener("click", () => startQuiz(state.selectedUnit));
nextButton.addEventListener("click", renderQuestion);
linearSetupBackButton.addEventListener("click", () => show("unit"));
startLinearButton.addEventListener("click", startLinearQuiz);
setupBackButton.addEventListener("click", () => show("unit"));
startRadicalButton.addEventListener("click", startRadicalQuiz);
linearTypeInputs.forEach(input => {
  input.addEventListener("change", updateLinearStartState);
});
radicalTypeInputs.forEach(input => {
  input.addEventListener("change", updateRadicalStartState);
});
questionCountInputs.forEach(input => {
  input.addEventListener("change", () => setQuestionCount(getSelectedQuestionCount(), questionCountInputs));
});
linearQuestionCountInputs.forEach(input => {
  input.addEventListener("change", () => setQuestionCount(getSelectedQuestionCount(linearQuestionCountInputs), linearQuestionCountInputs));
});
setupQuestionCountInputs.forEach(input => {
  input.addEventListener("change", () => setQuestionCount(getSelectedQuestionCount(setupQuestionCountInputs), setupQuestionCountInputs));
});

renderHome();
setQuestionCount(10);
show("home");
