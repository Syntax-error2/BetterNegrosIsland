import assert from 'node:assert/strict';
import { inspectPage, assertPage } from './qa-hardening-browser.mjs';

/** Read actual rendered controls through the CUA tab; no separate browser. */
export async function inspectRepairs(tab) {
  const page = await inspectPage(tab);
  assertPage(page);
  const controls = await tab.playwright.evaluate(() => ({
    lists: [...document.querySelectorAll('.record-results')].map(e => ({
      height: e.clientHeight, width: e.clientWidth, scrollWidth: e.scrollWidth,
      scrollHeight: e.scrollHeight, overflow: getComputedStyle(e).overflowY,
      titles: [...e.querySelectorAll('strong')].map(t => ({width:t.clientWidth, scroll:t.scrollWidth})),
    })),
    toolbar: [...document.querySelectorAll('.evidence-toolbar select,.evidence-toolbar button')].map(e => {
      const b=e.getBoundingClientRect(); return {top:b.top,bottom:b.bottom,height:b.height,width:b.width};
    }),
    guide: document.querySelector('.guide-panel') ? {
      y: scrollY, nav: document.querySelector('.guide-navigation').getBoundingClientRect().top,
      height: document.querySelector('.guide-panel').getBoundingClientRect().height,
      step: document.querySelector('.guide-progress').textContent,
      heading: document.querySelector('#guide-heading').textContent,
      inactive: [...document.querySelectorAll('.guide-copy:not(.is-current)')].map(e => ({inert:e.hasAttribute('inert'), hidden:e.getAttribute('aria-hidden')==='true', visibility:getComputedStyle(e).visibility})),
    } : null,
    headings: [...document.querySelectorAll('main h2')].filter(e=>getComputedStyle(e).visibility!=='hidden').map(e=>e.textContent),
  }));
  for (const list of controls.lists) {
    assert.ok(list.height>0 && list.height<400, 'Results must have a bounded readable viewport');
    assert.ok(list.scrollWidth<=list.width+1, 'Long titles must wrap inside their list');
    assert.equal(list.overflow,'auto');
    for (const title of list.titles) assert.ok(title.scroll<=title.width+1,'Full title clips');
  }
  if (controls.toolbar.length) {
    assert.equal(controls.toolbar.length,3);
    for (const control of controls.toolbar) assert.ok(control.height>=48,'Touch target too small');
    if (page.width>=600) for(const control of controls.toolbar) {
      assert.ok(Math.abs(control.top-controls.toolbar[0].top)<1,'Toolbar tops differ');
      assert.ok(Math.abs(control.bottom-controls.toolbar[0].bottom)<1,'Toolbar bottoms differ');
    }
  }
  if(controls.guide) for(const panel of controls.guide.inactive) assert.ok(panel.inert && panel.hidden && panel.visibility==='hidden','Inactive guide content must be hidden from focus and accessibility');
  return {page,controls,result:'PASS'};
}
