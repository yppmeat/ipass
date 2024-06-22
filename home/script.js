const tests =
Array(8).fill().map((_, i) => {
  return /* html*/`
    <label>
      <input type="checkbox"${i ? '' : ' checked'} data-index="${i}">テスト範囲${String.fromCharCode((i+1+'').charCodeAt() + 9263)}
    </label>
  `;
});
const q = htmlv/* html */`
  <h1>ITパスポート用語集</h1>
  セルフチェックシートの用語(375個)の中からランダムに出題するWeb問題集です。最終確認等に活用ください。
  <div class="select-1" *as="select1">
    <label>
      <input type="radio" name="select-1" data-value="test" checked>テスト範囲で指定して出題
    </label>
    <label>
      <input type="radio" name="select-1" data-value="bunya">分野を指定して出題
    </label>
  </div>
  <div class="select-2" *as="select2">
    ${tests}
  </div>
  <div class="options" *as="options">
    <label>
      <input type="checkbox" data-value="endless">エンドレスに出題する
    </label>
    <label>
      <input type="checkbox" data-value="random" checked>問題をランダムに出題する
    </label>
  </div>
  <div class="footerBtn">
    <button *onclick=${onClickHandler}>出題開始</button>
  </div>
`;
document.getElementById('app').append(...q);

function onClickHandler() {
  const type = getChecked(q.select1)[0].dataset.value;
  const range = sum(getChecked(q.select2).map(v => 2 ** +v.dataset.index));
  const options = getChecked(q.options).map(v => '&' + v.dataset.value);
  location.href = `/rest/?type=${type}&q=${range}${options.join('')}`;
}

function getChecked(t) {
  return [...t.querySelectorAll(':checked')];
}

function sum(s) {
  return s.reduce((a, b) => a + b);
}
