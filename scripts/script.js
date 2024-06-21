let DATA, WORDS, CATEGORY;
(async () => {
  const cache = { cache: 'no-cache' };
  DATA = await (await fetch('data/data.json', cache)).json();
  WORDS = await (await fetch('data/words.json', cache)).json();
  CATEGORY = await (await fetch('data/category.json', cache)).json();
  CATEGORY.category.reverse();
  dataLoadedHandler();
})();


let q;
function dataLoadedHandler() {
  function onClickHandler() {
    reload();
  }
  q = htmlv/* html */`
    <h1 *as="number0"></h1>
    <h2 *as="number1"></h2>
    <div *as="question" class="question"></div>
    <div class="select">
      <div>
        <input type="button" value="ア" data-index="0" *onclick=${ansClick}>
        <span *as="ans0" *onclick=${spanClick}></span>
      </div>
      <div>
        <input type="button" value="イ" data-index="1" *onclick=${ansClick}>
        <span *as="ans1" *onclick=${spanClick}></span>
      </div>
      <div>
        <input type="button" value="ウ" data-index="2" *onclick=${ansClick}>
        <span *as="ans2" *onclick=${spanClick}></span>
      </div>
      <div>
        <input type="button" value="エ" data-index="3" *onclick=${ansClick}>
        <span *as="ans3" *onclick=${spanClick}></span>
      </div>
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
          <span class="ans" *as="ans"></span><span class="ansSelected" *as="ansSelected"></span>
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
              <span class="ans">ア</span>：<span class="name" *as="k0-0"></span>
            </div>
            <div class="lower" data-index="0" *as="k1-0" *onclick=${linkClick}></div>
          </div>
          <div>
            <div class="upper">
              <span class="ans">イ</span>：<span class="name" *as="k0-1"></span>
            </div>
            <div class="lower" data-index="1" *as="k1-1" *onclick=${linkClick}></div>
          </div>
          <div>
            <div class="upper">
              <span class="ans">ウ</span>：<span class="name" *as="k0-2"></span>
            </div>
            <div class="lower" data-index="2" *as="k1-2" *onclick=${linkClick}></div>
          </div>
          <div>
            <div class="upper">
              <span class="ans">エ</span>：<span class="name" *as="k0-3"></span>
            </div>
            <div class="lower" data-index="3" *as="k1-3" *onclick=${linkClick}></div>
          </div>
        </div>
      </div>
      <div>
        <h3>過去の出題歴</h3>
        <div class="kako" *as="kako"></div>
      </div>
    </div>
    <div class="footerBtn" *as="footer">
      <button *onclick=${onClickHandler}>次の問題</button>
    </div>
  `;
  app.append(...q);
  console.log(q);
  reload();
  resize();
}

function linkClick(e) {
  if(e.clientX < e.target.getBoundingClientRect().left) {
    window.open('https://google.com/search?q=' + answer[e.target.dataset.index][0] + 'とは IT', '_blank');
  }
}

function spanClick(e) {
  e.target.closest('div').classList.toggle('disabled');
}

let ansShowId;
function ansClick(e) {
  q.ansSelected.innerText = '“あなたの回答：' + e.target.value + '”';
  q.popup.classList.add('show');
  const correct = +e.target.dataset.index == ansIndex;
  q.popup.classList.remove('ok', 'ng');
  q.popup.classList.add(correct ? 'ok' : 'ng');
  clearTimeout(ansShowId);
  ansShowId = setTimeout(() => {
    q.popup.classList.remove('show');
  }, 3000);
  showAnswer({ target: q.ansBtn });
}

function showAnswer(e) {
  e.target.style.display = 'none';
  q.ans.innerText = ['ア', 'イ', 'ウ', 'エ'][ansIndex];
  q.explain.classList.add('show');
  requestAnimationFrame(() => {
    q.scroll.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

let ansIndex, i = 1, qType, answer;
function reload() {
  scrollTo({ behavior: 'smooth', top: 0 });
  answer = selectRandom(DATA);
  const ansIndex = random(4);
  console.log(answer, ansIndex);

  const category = getCategory(answer[ansIndex]);
  const subcategory = getCategory(answer[ansIndex], true);
  
  q.category.innerText = [category, subcategory].join('  »  ');
  
  q.number0.innerText = 'ITパスポート用語集 問' + i;
  q.number1.innerText = '問' + i;
  
  qType = random(2);
  if(qType) {
    q.question.innerHTML = setHints(sanitize(answer[ansIndex][0])) + 'についての説明はどれか。';
  } else {
    q.question.innerHTML = '以下の説明に合致する用語はどれか。<br>' + setHints(sanitize(answer[ansIndex][1]));
  }
  answer.forEach((v, i) => {
    const temp = setHints(sanitize(v[qType]));
    q['ans' + i].innerHTML = temp;
    q['ans' + i].parentElement.classList.remove('disabled');
    
    q['k0-' + i].innerHTML = '“' + temp + '”';
    const correct = '<span class="correct">正しい</span>。';
    q['k1-' + i].innerHTML = (i == ansIndex ? correct : '') + setHints(sanitize(v[+!qType])) + (qType ? 'についての説明です。' : '');
  });

  q.explain.classList.remove('show');
  q.popup.classList.remove('show');
  q.ansBtn.style.display = 'block';
  q.ans.innerText = '';
  q.ansSelected.innerText = '';
  
  const kako = answer[ansIndex][2];
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
    return CATEGORY.subcategory[a[3][0]];
  }
  return CATEGORY.category.find(v => v[0] <= a[3][0])[1];
}

function getLink(s) {
  const [, era, year, type, index] = s.match(/^([HR])(\d\d)([HAT])(\d\d?)$/);
  const text = `${{ H: '平成', R: '令和' }[era]}${+year}年${{ H: '春', A: '秋', T: '特別' }[type]} 問${index}`;
  const dir = `${year}_${{ H: 'haru', A: 'aki', T: 'toku' }[type]}/q${index}.html`;
  const bassURL = 'https://www.itpassportsiken.com/kakomon/';
  return `<a href="${bassURL}${dir}" target="_blank">${text}</a>`;
}

function random(len) {
  return Math.round(Math.random() * (len - 1));
}

function selectRandom(arr) {
  const category = getCategory(random(3));
  const temp = arr.filter(v => {
    return getCategory(v) == category;
  });
  const result = [];
  for(let i = 0; i < 4; i++) {
    result.push(temp.splice(random(temp.length), 1)[0]);
  }
  return result;
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
  q.footer.style.width = (app.clientWidth - 24) + 'px';
}
window.addEventListener('resize', resize);
