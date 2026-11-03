import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COOKIE_NOTICE_MAX_AGE, dismissCookieNotice, hasCookieNotice } from '../src/lib/cookie-notice';

test('notice dismissal writes a fixed, scoped, finite cookie without changing other storage', () => {
  let written = '';
  const jar = { get cookie() { return 'other=value; '+written.split(';')[0]; }, set cookie(value: string) { written = value; } };
  assert.equal(hasCookieNotice(jar), false);
  assert.equal(dismissCookieNotice(jar), true);
  assert.equal(COOKIE_NOTICE_MAX_AGE, 15552000);
  assert.equal(written, 'bni_notice=v1; Max-Age=15552000; Path=/; SameSite=Lax; Secure');
  assert.equal(hasCookieNotice({ cookie: 'other=value; bni_notice=v1' }), true);
  for (const cookie of ['bni_notice=v0', 'not_bni_notice=v1', 'bni_notice=v10', 'other=bni_notice=v1']) {
    assert.equal(hasCookieNotice({ cookie }), false);
  }
});

test('blocked or silently rejected cookies do not throw or claim persistence', () => {
  const blocked = { get cookie(): string { throw Error('Blocked'); }, set cookie(_value: string) { throw Error('Blocked'); } };
  assert.equal(hasCookieNotice(blocked), false);
  assert.equal(dismissCookieNotice(blocked), false);
  const rejected = { get cookie() { return ''; }, set cookie(_value: string) { /* Browser ignores write. */ } };
  assert.equal(dismissCookieNotice(rejected), false);
});
