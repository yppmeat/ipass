function getParam(key) {
  return new URLSearchParams(location.search).get(key);
}

if(!localStorage.getItem('mark')) {
  localStorage.setItem('mark', '0'.repeat(375));
}
let marklist = localStorage.getItem('mark').split('');

function parseFlag(f) {
  const result = [];
  Array(23).fill().map((_, i) => {
    const current = 2 ** (22 - i);
    if(f >= current) {
      f -= current;
      result.push(22 - i);
    }
  });
  return result;
}

if((['test', 'bunya'].includes(getParam('type')) && !isNaN(+getParam('q'))) || getParam('missed') != undefined) {
  if(getParam('simple') != undefined) {
    document.body.classList.add('simple');
  }
} else {
  location.href = '../home/?log=パラメータの形式が正しくありません';
  throw 0;
}

let DATA, WORDS, CATEGORY;
(async () => {
  const cache = { cache: 'no-cache' };
  DATA = await (await fetch('../data/data.json', cache)).json();
  WORDS = await (await fetch('../data/words.json', cache)).json();
  CATEGORY = await (await fetch('../data/category.json', cache)).json();
  CATEGORY.category.reverse();
  filterDATA();
  dataLoadedHandler();
})();

let DATAcopy, DATAlength;
function filterDATA() {
  if(getParam('missed') != undefined) {
    if(!DATAcopy) DATAcopy = [...DATA];
    const missed = localStorage.getItem('missed').split(',').map(Number);
    DATA = DATAcopy.filter(v => {
      return missed.includes(v[0]);
    });
  } else {
    const flag = parseFlag(+getParam('q'));
    let range;
    if(getParam('type') == 'test') {
      range = CATEGORY.testRange.filter((_, i) => {
        return flag.includes(i);
      });
    }
    if(!DATAcopy) DATAcopy = [...DATA];
    DATA = DATAcopy.filter(v => {
      if(getParam('type') == 'test') {
        return range.some(v2 => {
          return v2[0] <= v[4][0] && v[4][0] <= v2[1];
        });
      }
      return flag.includes(v[4][0]);
    });
  }
  const marked = getParam('marked') != undefined;
  DATA = DATA.filter(v => {
    return marklist[v[0]] == (marked ? '1' : '0');
  });
  DATAlength = DATA.length;
}


let q;
function dataLoadedHandler() {
  q = htmlv/* html */`
    <h1 *as="number0"></h1>
    <h2 *as="number1"></h2>
    <div *as="question" class="question"></div>
    <span *as="current"></span>
    <div class="select">
      <div>
        <input type="button" value="ア" data-index="0" *onclick=${ansClick}>
        <span *as="ans[0]" *onclick=${spanClick}></span>
      </div>
      <div class="simple">
        <input type="button" value="イ" data-index="1" *onclick=${ansClick}>
        <span *as="ans[1]" *onclick=${spanClick}></span>
      </div>
      <div class="simple">
        <input type="button" value="ウ" data-index="2" *onclick=${ansClick}>
        <span *as="ans[2]" *onclick=${spanClick}></span>
      </div>
      <div class="simple">
        <input type="button" value="エ" data-index="3" *onclick=${ansClick}>
        <span *as="ans[3]" *onclick=${spanClick}></span>
      </div>
    </div>
    <div class="hideshow"><span *onclick=${hideshow}></span></div>
    <div class="memo">
      <textarea placeholder="メモ欄" *as="memo"></textarea>
    </div>
    <div class="info">
      <div>
        <h3>分類</h3>
        <span *as="category"></span>
      </div>
      <div>
        <h3 *as="scroll">正解</h3>
        <input type="button" value="正解を表示する" *onclick=${showAnswer} *as="ansBtn">
        <div class="ansList">
          <span class="ans" *as="correct"></span><span class="ansSelected" *as="ansSelected"></span>
          <div class="popup" *as="popup">
            <div class="left">
              <div class="icon"></div>
              <div class="oklogo"></div>
            </div>
            <div class="right"></div>
          </div>
        </div>
      </div>
      <div>
        <h3>解説</h3>
        <div class="explain" *as="explain">
          <div>
            <div class="upper">
              <span class="ans">ア</span>：<span class="name" *as="title[0]"></span>
            </div>
            <div class="lower" data-index="0" *as="desc[0]" *onclick=${linkClick}></div>
          </div>
          <div class="simple">
            <div class="upper">
              <span class="ans">イ</span>：<span class="name" *as="title[1]"></span>
            </div>
            <div class="lower" data-index="1" *as="desc[1]" *onclick=${linkClick}></div>
          </div>
          <div class="simple">
            <div class="upper">
              <span class="ans">ウ</span>：<span class="name" *as="title[2]"></span>
            </div>
            <div class="lower" data-index="2" *as="desc[2]" *onclick=${linkClick}></div>
          </div>
          <div class="simple">
            <div class="upper">
              <span class="ans">エ</span>：<span class="name" *as="title[3]"></span>
            </div>
            <div class="lower" data-index="3" *as="desc[3]" *onclick=${linkClick}></div>
          </div>
        </div>
      </div>
      <div>
        <h3>過去の出題歴</h3>
        <div class="kako" *as="kako"></div>
      </div>
    </div>
    <div class="footerBtn" *as="footer">
      <div class="mark">
        <label>
          <input type="checkbox" *as="mark" *onclick=${mark}>
          マークする
        </label>
      </div>
      <div>
        <button class="next" *onclick=${reload}>次の問題</button>
      </div>
      <div>
        <span *onclick=${finish}></span>
      </div>
    </div>
  `;
  app.append(...q);
  reload();
  resize();
  if(getParam('simple') != undefined) {
    hideshow();
  }
}
const missed = [];
let hidden = false;
function hideshow() {
  document.body.classList.toggle('hideans');
  hidden = !hidden;
}

function mark() {
  if(localStorage.getItem('marked') == undefined) {
    alert('マークしました。この問題は今後出題されません。トップページから解除することができます。');
    localStorage.setItem('marked', 'marked');
  }
  setMark(currentId, q.mark.checked);
}

function setMark(id, on) {
  marklist[id] = on ? '1' : '0';
  localStorage.setItem('mark', marklist.join(''));
}

function finish() {
  location.href = '../home/?log=終了しました';
}

function linkClick(e) {
  if(e.clientX < e.target.getBoundingClientRect().left) {
    const isEdg = navigator.userAgent.includes('Edg');
    window.open(`https://www.${isEdg ? 'bing' : 'google'}.com/search?q=${encodeURIComponent(answer[e.target.dataset.index][1])}とは+IT`, '_blank');
  }
}

function spanClick(e) {
  e.target.closest('div').classList.toggle('disabled');
}

let ansShowId;
function ansClick(e) {
  q.ansSelected.innerText = '“あなたの回答：' + e.target.value + '”';
  q.popup.classList.add('show');
  correct = +e.target.dataset.index == ansIndex;
  q.popup.classList.remove('ok', 'ng');
  q.popup.classList.add(correct ? 'ok' : 'ng');
  clearTimeout(ansShowId);
  ansShowId = setTimeout(() => {
    q.popup.classList.remove('show');
  }, 3000);
  showAnswer({ target: q.ansBtn });
}

function showAnswer(e) {
  document.body.classList.remove('hideans');
  e.target.style.display = 'none';
  q.correct.innerText = ['ア', 'イ', 'ウ', 'エ'][ansIndex];
  q.explain.classList.add('show');
  requestAnimationFrame(() => {
    q.scroll.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

let ansIndex, i = 1, qType, answer, correct = false, currentId;
function reload() {
  if(!correct && answer) {
    if(!missed.includes(currentId)) {
      missed.push(currentId);
    }
    correct = false;
  }

  scrollTo({ behavior: 'smooth', top: 0 });
  [answer, ansIndex] = selectRandom();
  currentId = answer[ansIndex][0];

  const category = getCategory(answer[ansIndex]);
  const subcategory = getCategory(answer[ansIndex], true);
  
  q.category.innerText = [category, subcategory].join('  »  ') + ' No.' + answer[ansIndex][4][1];
  
  q.number0.innerText = 'ITパスポート用語集 問' + i;
  q.number1.innerText = '問' + i;
  q.current.innerText = i + '問目 / 選択範囲の問題数' + DATAlength + '問';
  
  qType = getParam('normal') != undefined ? 1 : random(2);
  if(qType) {
    q.question.innerHTML = setHints(sanitize(answer[ansIndex][1])) + 'についての説明はどれか。';
  } else {
    q.question.innerHTML = '以下の説明に合致する用語はどれか。<br>' + setHints(sanitize(answer[ansIndex][2]));
  }
  answer.forEach((v, i) => {
    const temp = setHints(sanitize(v[qType + 1]));
    q.ans[i].innerHTML = temp;
    q.ans[i].parentElement.classList.remove('disabled');
    
    q.title[i].innerHTML = '“' + temp + '”';
    const correct = '<span class="correct">正しい</span>。';
    q.desc[i].innerHTML = (i == ansIndex ? correct : '') + setHints(sanitize(v[+!qType + 1])) + (qType ? 'についての説明です。' : '');
  });

  document.body.classList.toggle('hideans', hidden)
  q.explain.classList.remove('show');
  q.popup.classList.remove('show');
  q.ansBtn.style.display = 'block';
  q.correct.innerText = '';
  q.ansSelected.innerText = '';
  q.memo.value = '';
  q.mark.checked = marklist[currentId] == '1' ? true : false;
  
  const kako = answer[ansIndex][3];
  if(!kako.length) {
    q.kako.innerText = '出題歴がありません';
  } else {
    q.kako.innerHTML = kako.map(v => {
      return getLink(v);
    }).join('<br>');
  }

  i++;
}

function getCategory(a, sub) {
  if(typeof a == 'number') {
    return CATEGORY.category[a][1];
  }
  if(sub) {
    return CATEGORY.subcategory[a[4][0]];
  }
  return CATEGORY.category.find(v => v[0] <= a[4][0])[1];
}

function getLink(s) {
  const [, era, year, type, index] = s.match(/^([HR])(\d\d)([HAT])(\d\d?)$/);
  const text = `${{ H: '平成', R: '令和' }[era]}${+year}年${{ H: '春', A: '秋', T: '特別' }[type]} 問${+index}`;
  const dir = `${year}_${{ H: 'haru', A: 'aki', T: 'toku' }[type]}/q${+index}.html`;
  const bassURL = 'https://www.itpassportsiken.com/kakomon/';
  return `<a href="${bassURL}${dir}" target="_blank">${text}</a>`;
}

function random(len) {
  return Math.round(Math.random() * (len - 1));
}

function selectRandom() {
  if(!DATA.length) {
    if(getParam('endless') == undefined) {
      localStorage.setItem('missed', missed.join(','));
      location.href = '../home/?log=すべての問題に回答しました' + (missed.length ? '&missed' : '');
      throw 1;
    }
    filterDATA();
  }
  const ans = DATA.splice(getParam('random') == undefined ? 0 : random(DATA.length), 1)[0];
  const category = getCategory(ans);
  const temp = DATAcopy.filter(v => {
    return getCategory(v) == category && ans[0] != v[0];
  });
  const result = [];
  for(let i = 0; i < 3; i++) {
    result.push(temp.splice(random(temp.length), 1)[0]);
  }
  const ansIndex = getParam('simple') != undefined ? 0 : random(4);
  result.splice(ansIndex, 0, ans);
  return [result, ansIndex];
}

function same(a, b){
  return a.every((v, i) => v == b[i]);
}

function setHints(s) {
  const added = [];
  WORDS.forEach(v => {
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

function resize() {
  q && (q.footer.style.width = (app.clientWidth - 24) + 'px');
}
window.addEventListener('resize', resize);
