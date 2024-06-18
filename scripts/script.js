let DATA;

fetch('data/data.json', {
  cache: 'no-cache'
})
.then(res => res.json())
.then(res => {
  DATA = res;
  dataLoadedHandler();
});

let q, i = 1;
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
        <span *as="ans0"></span>
      </div>
      <div>
        <input type="button" value="イ" *onclick=${ansClick}>
        <span *as="ans1"></span>
      </div>
      <div>
        <input type="button" value="ウ" *onclick=${ansClick}>
        <span *as="ans2"></span>
      </div>
      <div>
        <input type="button" value="エ" *onclick=${ansClick}>
        <span *as="ans3"></span>
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

function ansClick(e) {
  
}

function showAnswer(e) {
  e.target.style.display = 'none';
  q.ans.innerText = ['ア', 'イ', 'ウ', 'エ'][ansIndex];
}

let ansIndex;
function reload() {
  const { result: [question], arr: dataCopy } = selectFromArr(DATA, 1);
  const answer = selectFromArr(dataCopy, 3).result;
  ansIndex = random(4);
  answer.splice(ansIndex, 0, question);
  
  q.number0.innerText = 'ITパスポート用語集 問' + i;
  q.number1.innerText = '問' + i;
  
  q.question.innerText = question[0] + 'についての説明はどれか。';
  answer.forEach((v, i) => {
    console.log(v);
    q['ans' + i].innerText = v[1];
  });
  
  q.ansBtn.style.display = 'block';
  q.ans.innerText = '';

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
