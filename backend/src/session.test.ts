import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { clearedCookie, COOKIE_NAME, readCookie, sessionCookie, signToken, verifyToken } from './session.ts';
import { TEST_SECRET } from './testApp.ts';

describe('session', () => {
  test('podpisan žeton se preveri in vrne id uporabnika', async () => {
    const token = await signToken(TEST_SECRET, 42);
    assert.equal(await verifyToken(TEST_SECRET, token), 42);
  });

  test('žeton, podpisan z drugo skrivnostjo, ni veljaven', async () => {
    const token = await signToken('druga-skrivnost-ki-ima-vsaj-32-znakov!!', 42);
    assert.equal(await verifyToken(TEST_SECRET, token), null);
  });

  test('neveljaven niz ni veljaven žeton', async () => {
    assert.equal(await verifyToken(TEST_SECRET, 'ni.pravi.jwt'), null);
  });

  test('readCookie prebere piškotek med več piškotki', () => {
    assert.equal(readCookie('theme=dark; token=abc.def=; lang=sl', COOKIE_NAME), 'abc.def=');
    assert.equal(readCookie(undefined, COOKIE_NAME), null);
    assert.equal(readCookie('theme=dark', COOKIE_NAME), null);
  });

  test('piškotek seje je HttpOnly, izbrisan piškotek ima Max-Age=0', () => {
    assert.match(sessionCookie('abc'), /^token=abc; Path=\/; HttpOnly; SameSite=Lax; Max-Age=3600$/);
    assert.match(clearedCookie(), /Max-Age=0$/);
  });
});
