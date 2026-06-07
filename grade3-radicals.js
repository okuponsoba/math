// 中3「根号の計算」専用。
// 今後、中3の問題内容や選択肢だけを直すときは、まずこのファイルを編集する。
(() => {
  function makeGrade3RadicalTransformQuestion() {
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

  function makeGrade3RadicalRationalizeQuestion() {
    const cases = [
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
    const selected = randomChoice(cases);
    const unreduced = unreducedRationalizedText(selected.numerator, selected.radicand);
    const reduced = rationalizedText(selected.numerator, selected.radicand);
    return {
      text: `計算せよ：${selected.numerator}/√${selected.radicand} を有理化`,
      answerText: reduced,
      hint: unreduced === reduced
        ? `分母の √${selected.radicand} を消すために、分母と分子の両方に √${selected.radicand} をかけます。`
        : `分母と分子に √${selected.radicand} をかけると ${unreduced}。そこから約分して ${reduced} にします。`
    };
  }

  function makeGrade3RadicalArithmeticQuestion() {
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
      const simplified = simplifyRadicand(left * right);
      return {
        text: `計算せよ：√${left} × √${right}`,
        answerText: radicalText(simplified.outside, simplified.inside),
        hint: "根号どうしのかけ算は、中の数をかけてから、できるだけ簡単にします。"
      };
    }

    const numerator = randomChoice(bases);
    let denominator = randomChoice(bases);
    while (denominator === numerator) denominator = randomChoice(bases);
    return {
      text: `計算せよ：√${numerator} ÷ √${denominator}`,
      answerText: radicalQuotientText(numerator, denominator),
      hint: `√${numerator} ÷ √${denominator} は √${numerator}/√${denominator} と考え、分母を有理化します。`
    };
  }

  function makeGrade3RadicalQuestion() {
    const makers = {
      transform: makeGrade3RadicalTransformQuestion,
      rationalize: makeGrade3RadicalRationalizeQuestion,
      arithmetic: makeGrade3RadicalArithmeticQuestion
    };
    const selectedTypes = state.selectedRadicalTypes.length
      ? state.selectedRadicalTypes
      : ["transform", "rationalize", "arithmetic"];
    return makers[randomChoice(selectedTypes)]();
  }

  const grade3Group = units.find(group => group.grade.includes("中学3年"));
  const radicalUnit = grade3Group?.items.find(item => item.id === "radical");
  if (radicalUnit) radicalUnit.makeQuestion = makeGrade3RadicalQuestion;
})();
