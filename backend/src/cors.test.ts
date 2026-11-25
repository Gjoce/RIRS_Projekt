import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { describe, test } from 'node:test';
import { createApp } from './app.ts';
import { createCandleStore } from './candles.ts';
import { corsHeaders, crossSiteCookie, parseOrigins } from './cors.ts';
import { createPool } from './db.ts';
import { sessionCookie } from './session.ts';
import { TEST_SECRET } from './testApp.ts';

const FRONTEND = 'https://uporabnik.github.io';

describe('parseOrigins', () => {
  test('razdeli seznam po vejicah in odstrani presledke ter končne poševnice', () => {
    assert.deepEqual(parseOrigins(' https://a.example/ , https://b.example'), ['https://a.example', 'https://b.example']);
  });

  test('brez vrednosti vrne prazen seznam', () => {
    assert.deepEqual(parseOrigins(undefined), []);
    assert.deepEqual(parseOrigins(' , '), []);
  });
});

describe('corsHeaders', () => {
  test('dovoljen izvor dobi glave s piškotki', () => {
    const headers = corsHeaders(FRONTEND, { origins: [FRONTEND] });
    assert.equal(headers['Access-Control-Allow-Origin'], FRONTEND);
    assert.equal(headers['Access-Control-Allow-Credentials'], 'true');
    assert.equal(headers.Vary, 'Origin');
  });

  test('nedovoljen izvor ali zahtevek brez izvora ne dobi glav', () => {
    assert.deepEqual(corsHeaders('https://napadalec.example', { origins: [FRONTEND] }), {});
    assert.deepEqual(corsHeaders(undefined, { origins: [FRONTEND] }), {});
  });

  test('brez nastavljenih izvorov je CORS izklopljen', () => {
    assert.deepEqual(corsHeaders(FRONTEND, { origins: [] }), {});
  });
});

describe('crossSiteCookie', () => {
  test('piškotek seje nastavi na SameSite=None, Secure in Partitioned', () => {
    const cookie = crossSiteCookie(sessionCookie('abc'));
    assert.match(cookie, /^token=abc; /);
    assert.match(cookie, /SameSite=None; Secure; Partitioned/);
    assert.doesNotMatch(cookie, /SameSite=Lax/);
    assert.match(cookie, /HttpOnly/);
  });
});

// Aplikacija brez baze: /api/health in preflight ne odpreta povezave.
async function withServer(origins: string[], fn: (base: string) => Promise<void>) {
  const pool = createPool('postgres://localhost/unused');
  const server = createApp(pool, createCandleStore('/ni-podatkov'), TEST_SECRET, { origins }).listen(0);
  await once(server, 'listening');
  try {
    await fn(`http://127.0.0.1:${(server.address() as AddressInfo).port}`);
  } finally {
    server.close();
    await pool.end();
  }
}

describe('CORS v aplikaciji', () => {
  test('preflight OPTIONS z dovoljenega izvora vrne 204 in glave CORS', async () => {
    await withServer([FRONTEND], async (base) => {
      const res = await fetch(`${base}/api/auth/login`, { method: 'OPTIONS', headers: { Origin: FRONTEND } });
      assert.equal(res.status, 204);
      assert.equal(res.headers.get('access-control-allow-origin'), FRONTEND);
      assert.match(res.headers.get('access-control-allow-methods') ?? '', /POST/);
    });
  });

  test('GET /api/health z dovoljenega izvora vsebuje glavo Allow-Origin', async () => {
    await withServer([FRONTEND], async (base) => {
      const res = await fetch(`${base}/api/health`, { headers: { Origin: FRONTEND } });
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('access-control-allow-origin'), FRONTEND);
    });
  });

  test('brez nastavitve CORS odgovor nima glave Allow-Origin', async () => {
    await withServer([], async (base) => {
      const res = await fetch(`${base}/api/health`, { headers: { Origin: FRONTEND } });
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('access-control-allow-origin'), null);
    });
  });
});
