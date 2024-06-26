const PARAM =
  location.search.slice(1).split('&').reduce((a, b) => {
    const [key, ...value] = b.split('=');
    a[key] = decodeURIComponent(value.join('='));
    return a;
  }, {});

if(!localStorage.getItem('mark')) {
  localStorage.setItem('mark', '0'.repeat(375));
}

let DATA, CATEGORY;
(async () => {
  const cache = { cache: 'no-cache' };
  DATA = await (await fetch('../data/data.json', cache)).json();
  CATEGORY = await (await fetch('../data/category.json', cache)).json();
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
  const mark = localStorage.getItem('mark').split('');
  const marklist = DATA.filter(v => {
    return mark[v[0]] == '1';
  }).map(v => {
    return `
      <tr>
        <td>
          <label>
            <input type="checkbox" checked>
          </label>
        </td>
        <td>
          ${v[1]}
        </td>
      </tr>
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
      <label>
        <input type="checkbox" data-value="normal">用語→説明の形式で出題する
      </label>
    </div>
    <div class="footerBtn">
      <div>
        ${
          PARAM.missed != undefined ?
            htmlv/* html */`
              <button class="missed" *onclick=${missedButton}>ミスだけ出題</button>
            `
            : ''
        }
        <button class="start" *onclick=${startButton}>出題開始</button>
      </div>
    </div>
    <span class="showmark" *onclick=${showmark}>マークを管理</span>
    <div class="marklist" style=${{ display: 'none' }} *as="marklist">
      <div>
        <table>
          <thead>
            <tr>
              <th>マーク</th>
              <th style=${{ width: 300 }}>用語</th>
            </tr>
          </thead>
          <tbody>
            ${marklist}
          </tbody>
        </table>
        <div>何もマークしていません</div>
      </div>
    </div>
  `;
  document.getElementById('app').append(...q);

  function showmark() {
    q.marklist.style.display = 'block';
  }
  
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
  
  function missedButton() {
    location.href = '../rest/?missed';
  }

  function startButton() {
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
