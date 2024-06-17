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
        <input type="button" value="ア">
        <span *as="ans0"></span>
      </div>
      <div>
        <input type="button" value="イ">
        <span *as="ans1"></span>
      </div>
      <div>
        <input type="button" value="ウ">
        <span *as="ans2"></span>
      </div>
      <div>
        <input type="button" value="エ">
        <span *as="ans3"></span>
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

function reload() {
  const { result: [question], arr: dataCopy } = selectFromArr(DATA, 1);
  const answer = selectFromArr(dataCopy, 3).result;
  const ansIndex = random(4);
  answer.splice(ansIndex, 0, question);
  
  q.number0.innerText = 'ITパスポート単語集 問' + i;
  q.number1.innerText = '問' + i;
  
  q.question.innerText = question[0] + 'についての説明はどれか。';
  answer.forEach((v, i) => {
    console.log(v);
    q['ans' + i].innerText = v[1];
  });
  
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
