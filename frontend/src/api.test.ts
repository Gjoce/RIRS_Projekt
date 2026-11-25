import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiUrl, errorMessage, getJson, postJson } from './api';

afterEach(() => vi.unstubAllGlobals());

describe('api', () => {
  it('errorMessage vrne sporočilo strežnika, če obstaja', () => {
    expect(errorMessage({ error: 'Dostop ni dovoljen' }, 'Napaka')).toBe('Dostop ni dovoljen');
  });

  it('errorMessage vrne nadomestno besedilo pri neveljavnem odgovoru', () => {
    expect(errorMessage(null, 'Napaka')).toBe('Napaka');
    expect(errorMessage({ error: 42 }, 'Napaka')).toBe('Napaka');
    expect(errorMessage('niz', 'Napaka')).toBe('Napaka');
  });

  it('apiUrl doda naslov backenda pred pot', () => {
    expect(apiUrl('/api/health', 'https://api.example.com')).toBe('https://api.example.com/api/health');
    expect(apiUrl('/api/health', '')).toBe('/api/health');
  });

  it('postJson pošlje JSON telo in vrne status in podatke', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 1 }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    const res = await postJson('/api/strategies', { name: 'Test' });
    expect(res).toEqual({ status: 201, data: { id: 1 } });
    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(init.body).toBe(JSON.stringify({ name: 'Test' }));
  });

  it('getJson vrne data null, ko odgovor ni JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('ni json', { status: 502 })));
    expect(await getJson('/api/health')).toEqual({ status: 502, data: null });
  });
});
