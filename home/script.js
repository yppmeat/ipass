function getParam(key) {
  return new URLSearchParams(location.search).get(key);
}

if(!localStorage.getItem('mark')) {
  localStorage.setItem('mark', '0'.repeat(375));
}
let marklist = localStorage.getItem('mark').split('');

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
  let count = 0;
  const bunya =
  Array(3).fill().map((_, i) => {
    offset += [0, 7, 5][i];
    return htmlv/* html */`
      <div class="subcategory" data-index="${i}" *onchange=${clickSubcategory}>
        <label>
          <input type="checkbox" checked data-index="${i}" *onchange=${clickCategory}>${CATEGORY.category[i][1]}
        </label>
        ${Array([7, 5, 11][i]).fill().map((_, j) => {
          const currentCount = CATEGORY.count[offset + j];
          let ratio = currentCount / marklist.slice(count, count + currentCount).filter(v => +v).length;
          if(!isFinite(ratio)) ratio = 0;
          count += currentCount;
          return /* html*/`
            <label class="${ratio == 1 ? 'mk1' : (ratio == 0 ? 'mk3' : 'mk2')}">
              <input type="checkbox" checked data-index="${offset + j}">${CATEGORY.subcategory[offset + j]}(${currentCount})
            </label>
          `;
          
        })}
      </div>
    `;
  });
  const marktable = DATA.filter(v => {
    return marklist[v[0]] == '1';
  }).map(v => {
    return htmlv/* html */`
      <tr>
        <td>
          <label>
            <input type="checkbox" checked data-index="${v[0]}" *onclick=${mark}>
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
        <input type="checkbox" data-value="normal" checked>用語→説明の形式で出題する
      </label>
      <label>
        <input type="checkbox" data-value="marked">マークした問題のみを出題する
      </label>
      <label>
        <input type="checkbox" data-value="simple" *onclick=${simplemode}>シンプルモード
      </label>
    </div>
    <div class="footerBtn">
      <div>
        ${
          getParam('missed') != undefined ?
            htmlv/* html */`
              <button class="missed" *onclick=${missedButton}>ミスだけ出題</button>
            `
            : ''
        }
        <button class="start" *onclick=${startButton}>出題開始</button>
      </div>
    </div>
    <div class="mark">
      <span *onclick=${showmark}>マークを管理</span>
      <span *onclick=${qrmark}>マークを共有</span>
    </div>
    <p class="news">
      - 更新情報 -<br>
      ・マークした問題のみを出題できる機能を追加した<br>
      ・シンプルモードを実装した<br>
      ・マークした問題をQRコードで表示して別の端末に引き継げるようにした<br>
      ・直近の出題でミスした問題のみを出題できる機能を追加した<br>
      ・覚えた問題を非表示にするマーク機能を追加した<br>
      ・選択肢を非表示にして自由形式で入力できる機能を追加した<br>
      ・テスト範囲別、分野別に出題できる機能を追加した
    </p>
    <div class="marklist" style=${{ display: 'none' }} *as="marklist" *onclick=${close}>
      <div>
        <table>
          <thead>
            <tr>
              <th style=${{ width: 60 }}>マーク</th>
              <th style=${{ width: 300 }}>用語</th>
            </tr>
          </thead>
          <tbody>
            ${marktable}
          </tbody>
        </table>
        <div>何もマークしていません<br>マークすると問題を非表示にすることができます</div>
      </div>
    </div>
    <div class="qrmark" style=${{ display: 'none' }} *as="qrmark" *onclick=${close}>
      <div *as="qrcode"></div>
    </div>
  `;
  document.getElementById('app').append(...q);

  function simplemode() {
    if(localStorage.getItem('simple') == undefined) {
      alert('シンプルモードでは選択肢の数が一つになり、自由入力を強制します。選択することではなく言葉で答えることに重点を置いた人のためのモードです。');
      localStorage.setItem('simple', 'simple');
    }
  }

  function str2base64(s) {
    const tokens = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    while(s.length % 6 !== 0) {
      s += '0';
    }
    for(let i = 0; i < s.length; i += 6) {
      const index = parseInt(s.slice(i, i + 6), 2);
      result += tokens[index];
    }
    return result;
  }

  function qrmark() {
    const base32String = str2base64(marklist.join(''));
    const url = 'https://yppmeat.github.io/ipass/mark/?k=' + base32String;
    q.qrcode.innerText = '';
    new QRCode(q.qrcode, {
      text: url,
      width: 256,
      height: 256
    });
    q.qrmark.style.display = 'flex';
  }

  function close(e) {
    if(e.target == e.currentTarget) {
      e.target.style.display = 'none';
    }
  }

  function mark(e) {
    setMark(e.target.dataset.index, e.target.checked);
  }

  function setMark(id, on) {
    marklist[id] = on ? '1' : '0';
    localStorage.setItem('mark', marklist.join(''));
    console.log(marklist);
  }

  function showmark() {
    q.marklist.style.display = 'flex';
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
