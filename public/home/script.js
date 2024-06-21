const tests =
Array(8).fill().map((_, i) => {
  return `
    <label>
      <input type="checkbox">テスト範囲${String.fromCharCode((i+1+'').charCodeAt() + 9263)}
    </label>
  `;
});
const q = htmlv/* html */`
  <h1>ITパスポート用語集</h1>
  <div class="select-1">
    <label>
      <input type="radio" name="select-1" checked>テスト範囲で指定して出題
    </label>
    <label>
      <input type="radio" name="select-1">分野を指定して出題
    </label>
  </div>
  <div class="select-2">
    ${tests}
  </div>
  <div class="options">
    <label>
      <input type="checkbox">エンドレスに出題する
    </label>
    <label>
      <input type="checkbox">問題をランダムに出題する
    </label>
  </div>
  <div class="footerBtn" *as="footer">
    <button>次の問題</button>
  </div>
`;
document.getElementById('app').append(...q);