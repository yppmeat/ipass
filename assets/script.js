let DATA;

fetch('/data/data.json')
.then(res => res.json())
.then(res => {
  DATA = res;
  dataLoadedHandler();
});

let q;
function dataLoadedHandler() {
  function onClickHandler() {
    reload();
  }
  q = htmlv`
    <div>
      <div *as="key"></div>
      <div *as="value"></div>
      <input type="button" value="更新" *onclick=${onClickHandler}>
    </div>
  `;
  document.body.append(...q);
}

function reload() {
  const dataCopy = [...DATA];
  const selectedValue = dataCopy.splice(random(dataCopy.length), 1)[0];

  console.log(q.key, q.value, selectedValue);
  q.key.innerText = selectedValue[0];
  q.value.innerText = selectedValue[1];
}

function random(len) {
  return Math.round(Math.random() * (len - 1));
}