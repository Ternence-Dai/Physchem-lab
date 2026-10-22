/* NIST Chemistry WebBook launcher — external reference only, never an automatic model input. */
(function () {
  'use strict';
  const toolbar = document.querySelector('.tb .ac');
  if (!toolbar || document.getElementById('nistReferenceOpen')) return;

  const openButton = document.createElement('button');
  openButton.type = 'button';
  openButton.id = 'nistReferenceOpen';
  openButton.className = 'bt nist-reference-trigger';
  openButton.textContent = 'NIST 参考数据';
  openButton.setAttribute('aria-haspopup', 'dialog');
  toolbar.appendChild(openButton);

  const dialog = document.createElement('dialog');
  dialog.id = 'nistReferenceDialog';
  dialog.className = 'nist-reference-dialog';
  dialog.setAttribute('aria-labelledby', 'nistReferenceTitle');
  dialog.innerHTML =
    '<form method="dialog" class="nist-reference-dialog__frame">' +
      '<div class="nist-reference-dialog__head"><div><span>NIST STANDARD REFERENCE DATABASE 69</span>' +
        '<h2 id="nistReferenceTitle">化学物性 / 热化学参考检索</h2></div>' +
        '<button type="submit" class="nist-reference-dialog__close" aria-label="关闭">✕</button></div>' +
      '<p class="nist-reference-dialog__intro">输入英文化合物名称，打开 NIST Chemistry WebBook 的原始记录。该入口只用于人工交叉核对；不会自动修改实验参数或把参考数据伪装成实测结果。</p>' +
      '<label for="nistReferenceCompound">化合物英文名</label>' +
      '<div class="nist-reference-dialog__search"><input id="nistReferenceCompound" type="search" maxlength="100" autocomplete="off" placeholder="例如 water、ethanol、ammonia"><a id="nistReferenceSearch" href="https://webbook.nist.gov/chemistry/" target="_blank" rel="noopener noreferrer" aria-disabled="true">检索 NIST ↗</a></div>' +
      '<div class="nist-reference-dialog__boundary"><strong>数据使用边界</strong><ul>' +
        '<li>来源：NIST Chemistry WebBook · Standard Reference Database 69。</li>' +
        '<li>覆盖热化学、热物性、相变、离子能量与部分光谱；并非所有物质、相态或温度都有数据。</li>' +
        '<li>该数据库页面标注数据最近更新为 2025；使用时必须核对原始文献、相态、温度、压力与不确定度。</li>' +
        '<li>NIST 声明数据可能有遗漏且不提供保证；仅作参考，不自动写入 108 项实验模型。</li>' +
      '</ul></div>' +
      '<div class="nist-reference-dialog__foot"><a href="https://webbook.nist.gov/chemistry/" target="_blank" rel="noopener noreferrer">打开 NIST WebBook 首页 ↗</a><button type="submit">关闭</button></div>' +
    '</form>';
  document.body.appendChild(dialog);

  const input = dialog.querySelector('#nistReferenceCompound');
  const search = dialog.querySelector('#nistReferenceSearch');
  function updateSearch() {
    const term = input.value.trim();
    const allowed = term.length > 0;
    search.href = allowed
      ? 'https://webbook.nist.gov/cgi/cbook.cgi?Name=' + encodeURIComponent(term) + '&Units=SI'
      : 'https://webbook.nist.gov/chemistry/';
    search.setAttribute('aria-disabled', allowed ? 'false' : 'true');
    search.classList.toggle('is-disabled', !allowed);
    search.tabIndex = allowed ? 0 : -1;
  }
  input.addEventListener('input', updateSearch);
  search.addEventListener('click', function (event) {
    if (!input.value.trim()) event.preventDefault();
  });
  openButton.addEventListener('click', function () {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    input.focus();
  });
  updateSearch();
})();