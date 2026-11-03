import assert from 'node:assert/strict';

/** DOM reads through the CUA tab API. No separate browser driver. */
export async function inspectPage(tab) {
  return tab.playwright.evaluate(() => {
    const visible = e => e.getBoundingClientRect().width > 1 && e.getBoundingClientRect().height > 1;
    return {
      path: location.pathname + location.search,
      width: innerWidth,
      pageWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      heading: document.querySelector('main h1')?.textContent,
      brokenImages: [...document.querySelectorAll('img')].filter(e => visible(e) && e.complete && !e.naturalWidth).map(e => e.getAttribute('src')),
      kpis: [...document.querySelectorAll('.kpi-card')].map(e => {
        const box=e.getBoundingClientRect(), value=e.querySelector('.kpi-value'), note=e.querySelector('.kpi-note').getBoundingClientRect();
        return {top:box.top,height:box.height,noteBottom:note.bottom,valueWidth:value.scrollWidth,valueClient:value.clientWidth};
      }),
      clipped: [...document.querySelectorAll('.kpi-value,.money-value,.project-name,h1,button')].filter(e => visible(e) && e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.slice(0,100)),
    };
  });
}
export function assertPage(report) {
  assert.ok(report.heading, 'Missing route heading');
  assert.ok(report.scrollWidth <= report.pageWidth + 1, report.path + ': page overflow');
  assert.equal(report.brokenImages.length, 0, report.path + ': broken images');
  assert.equal(report.clipped.length, 0, report.path + ': clipped text ' + report.clipped.join('; '));
  for (const k of report.kpis) {
    assert.ok(k.valueWidth <= k.valueClient + 1, 'KPI value clips');
    for (const peer of report.kpis.filter(p => Math.abs(p.top-k.top) < 1)) {
      assert.ok(Math.abs(peer.height-k.height) < 1, 'KPI row heights differ');
      assert.ok(Math.abs(peer.noteBottom-k.noteBottom) < 1, 'KPI footnotes do not align');
    }
  }
  return 'PASS';
}
export async function inspectHistory(tab) {
  return tab.playwright.locator('.variant-history .data-table-scroll').evaluate(e => {
    const box=e.getBoundingClientRect(), last=e.querySelector('thead th:last-child'), lastBox=last.getBoundingClientRect();
    return {width:innerWidth,scrollLeft:e.scrollLeft,client:e.clientWidth,scroll:e.scrollWidth,
      headings:[...e.querySelectorAll('thead th')].map(n=>n.textContent),
      lastRight:lastBox.right,frameRight:box.right,lastPadding:getComputedStyle(last).paddingRight,
      firstLeft:e.querySelector('thead th').getBoundingClientRect().left,frameLeft:box.left,
      sticky:getComputedStyle(e.querySelector('thead th')).position,
      selectedHeader:e.querySelector('thead .selected-year')?.textContent,
      selectedCells:e.querySelectorAll('tbody .selected-year').length,
      rows:e.querySelectorAll('tbody tr').length,
      firstRow:[...e.querySelectorAll('tbody tr:first-child .money-value')].map(n=>n.textContent)};
  });
}
