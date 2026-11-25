// CORS in piškotki za namestitev, kjer sta frontend in backend na različnih domenah
// (npr. frontend na GitHub Pages, backend na Render). Lokalno (Docker Compose) gre vse prek nginx in CORS ni potreben.

export interface CorsOptions {
  // Dovoljeni izvori, npr. ['https://uporabnik.github.io']. Prazno pomeni, da CORS ni vklopljen.
  origins: string[];
}

// Prebere seznam izvorov iz okoljske spremenljivke (ločeni z vejico), brez končnih poševnic.
export function parseOrigins(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

// Glave CORS za zahtevek z danim izvorom; prazen objekt, če izvor ni dovoljen.
export function corsHeaders(origin: string | undefined, options: CorsOptions): Record<string, string> {
  if (!origin || !options.origins.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  };
}

// Piškotek seje za zahtevke z druge domene: SameSite=None zahteva Secure; Partitioned (CHIPS) ga ohrani
// tudi v brskalnikih, ki blokirajo piškotke tretjih strani.
export function crossSiteCookie(cookie: string): string {
  return cookie.replace('SameSite=Lax', 'SameSite=None; Secure; Partitioned');
}
