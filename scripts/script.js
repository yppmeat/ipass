let DATA, ABBRE;

fetch('data/data.json', {
  cache: 'no-cache'
})
.then(res => res.json())
.then(res => {
  DATA = res;
  fetch('data/abbre.json', {
    cache: 'no-cache'
  })
  .then(res => res.json())
  .then(res => {
    ABBRE = res;
    dataLoadedHandler();
  });
});

let q;
function dataLoadedHandler() {
  function onClickHandler() {
    reload();
  }
  q = htmlv`
    <h1 *as="number0"></h1>
    <h2 *as="number1"></h2>
    <div *as="question" class="question"></div>
    <div class="select">
      <div>
        <input type="button" value="ア" *onclick=${ansClick}>
        <span *as="ans0" *onclick=${spanClick}></span>
      </div>
      <div>
        <input type="button" value="イ" *onclick=${ansClick}>
        <span *as="ans1" *onclick=${spanClick}></span>
      </div>
      <div>
        <input type="button" value="ウ" *onclick=${ansClick}>
        <span *as="ans2" *onclick=${spanClick}></span>
      </div>
      <div>
        <input type="button" value="エ" *onclick=${ansClick}>
        <span *as="ans3" *onclick=${spanClick}></span>
      </div>
    </div>
    <div class="info">
      <div>
        <h3>分類</h3>
        <span>テクノロジ系 » セキュリティ</span>
      </div>
      <div>
        <h3>正解</h3>
        <input type="button" value="正解を表示する" *onclick=${showAnswer} *as="ansBtn">
        <span class="ans" *as="ans"></span><span class="ansSelected" *as="ansSelected"></span>
      </div>
      <div>
        <h3>解説</h3>
        <span></span>
      </div>
    </div>
    <div class="footerBtn">
      <button *onclick=${onClickHandler}>
        次の問題
      </button>
    </div>
  `;
  document.getElementById('app').append(...q);
  reload();
}

function spanClick(e) {
  e.target.closest('div').classList.toggle('disabled');
}

function ansClick(e) {
  q.ansSelected.innerText = '“あなたの回答：' + e.target.value + '”';
  showAnswer({ target: q.ansBtn });
}

function showAnswer(e) {
  e.target.style.display = 'none';
  q.ans.innerText = ['ア', 'イ', 'ウ', 'エ'][ansIndex];
}

let ansIndex, i = 1, qType;
function reload() {
  const { result: [question], arr: dataCopy } = selectFromArr(DATA, 1);
  const answer = selectFromArr(dataCopy, 3).result;
  ansIndex = random(4);
  answer.splice(ansIndex, 0, question);
  
  q.number0.innerText = 'ITパスポート用語集 問' + i;
  q.number1.innerText = '問' + i;
  
  qType = random(2);
  if(qType) {
    q.question.innerHTML = setHints(sanitize(question[0])) + 'についての説明はどれか。';
  } else {
    q.question.innerHTML = '以下の説明に合致する用語はどれか。<br>' + setHints(sanitize(question[1]));
  }
  answer.forEach((v, i) => {
    q['ans' + i].innerHTML = setHints(sanitize(qType ? v[1] : v[0]));
    q['ans' + i].parentElement.classList.remove('disabled');
  });

  q.ansBtn.style.display = 'block';
  q.ans.innerText = '';
  q.ansSelected.innerText = '';

  i++;
}

function random(len) {
  return Math.round(Math.random() * (len - 1));
}

function selectFromArr(arr, count) {
  arr = [...arr];
  const result = [];
  for(let i = 0; i < count; i++) {
    result.push(arr.splice(random(arr.length), 1)[0]);
  }
  return { result, arr };
}

function setHints(s) {
  const added = [];
  ABBRE.forEach(v => {
      const inc = added.some(v2 => v2[0].includes(v[0]));
      if(s.includes(v[0]) && !inc) {
          s = s.replaceAll(v[0], `#@${v[0]}#`);
          added.push(v);
      }
  });
  return s.split('#').map(v => {
      if(v[0] == '@') {
          const w = added.find(v2 => v2[0] == v.slice(1));
          return `<span title="${w[1]}">${w[0]}</span>`;
      }
      return v;
  }).join('');
}