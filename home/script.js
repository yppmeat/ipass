let CATEGORY;
(async () => {
  CATEGORY = await (await fetch('../data/category.json')).json();
  dataLoadedHandler();
})();

function dataLoadedHandler() {
  const tests =
  Array(8).fill().map((_, i) => {
    return /* html*/`
      <label>
        <input type="checkbox"${i ? '' : ' checked'} data-index="${i}">テスト範囲${String.fromCharCode((i+1+'').charCodeAt() + 9263)}
      </label>
    `;
  });
  let offset = 0;
  const bunya =
  Array(3).fill().map((_, i) => {
    offset += [0, 7, 5][i];
    return htmlv/* html */`
      <div class="subcategory" data-index="${i}" *onchange=${clickSubcategory}>
        <label>
          <input type="checkbox" checked data-index="${i}" *onchange=${clickCategory}>${CATEGORY.category[i][1]}
        </label>
        ${Array([7, 5, 11][i]).fill().map((_, j) => {
          return /* html*/`
            <label>
              <input type="checkbox" checked data-index="${offset + j}">${CATEGORY.subcategory[offset + j]}(${CATEGORY.count[offset + j]})
            </label>
          `;
        })}
      </div>
    `;
  });
  const q = htmlv/* html */`
    <h1>ITパスポート用語集</h1>
    セルフチェックシートの用語(375個)の中からランダムに出題するWeb問題集です。最終確認等に活用ください。
    <div class="type" *as="type" *onchange=${typeChange}>
      <label>
        <input type="radio" name="type" data-value="test" checked>テスト範囲を指定して出題
      </label>
      <label>
        <input type="radio" name="type" data-value="bunya">分野を指定して出題
      </label>
    </div>
    <div class="test" style="display: grid" *as="test">
      ${tests}
    </div>
    <div class="bunya" *as="bunya">
      ${bunya}
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

  function typeChange() {
    const type = ['test', 'bunya'];
    const index = type.indexOf(getChecked(q.type)[0].dataset.value);
    q[type.splice(index, 1)[0]].style.display = 'grid';
    q[type[0]].style.display = null;
  }
  
  function clickCategory(e) {
    const parent = e.target.closest('.subcategory');
    [...parent.children].forEach(v => {
      v.firstElementChild.checked = e.target.checked;
    });
    e.stopPropagation();
  }
  
  function clickSubcategory(e) {
    const checked = [...e.currentTarget.children].slice(1).some(v => {
      return v.firstElementChild.checked;
    });
    e.currentTarget.querySelector(':scope :first-child input').checked = checked;
  }
  
  function onClickHandler() {
    const type = getChecked(q.type)[0].dataset.value;
    const range = sum(getChecked(q[type], type == 'bunya').map(v => 2 ** +v.dataset.index));
    const options = getChecked(q.options).map(v => '&' + v.dataset.value);
    location.href = `../rest/?type=${type}&q=${range}${options.join('')}`;
  }

  function getChecked(t, s) {
    return [...t.querySelectorAll(s ? '.subcategory label:not(:first-child) :checked' : ':checked')];
  }

  function sum(s) {
    return s.reduce((a, b) => a + b);
  }
}