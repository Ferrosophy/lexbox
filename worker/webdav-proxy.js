/**
 * 词匣 WebDAV 转发（Cloudflare Worker）
 *
 * 坚果云的 WebDAV 不允许网页直接访问（没有 CORS 头），这个 Worker 帮忙转发，
 * 并只允许你的词匣网页来调用。账号密码只是经过，不会被保存。
 *
 * 环境变量（都可以不填）：
 *   TARGET           转发目标，默认 https://dav.jianguoyun.com
 *   ALLOWED_ORIGINS  允许调用的网页来源，逗号分隔，默认 https://ferrosophy.github.io
 */
const PASS_HEADERS = ['authorization', 'content-type', 'depth', 'if-match', 'if-none-match', 'overwrite', 'destination'];

export default {
  async fetch(request, env) {
    const allowed = (env.ALLOWED_ORIGINS || 'https://ferrosophy.github.io').split(',').map(s => s.trim()).filter(Boolean);
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, PROPFIND, MKCOL, MOVE, COPY, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type, Depth, If-Match, If-None-Match, Overwrite, Destination',
      'Access-Control-Expose-Headers': 'ETag, Last-Modified, Content-Length',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (!allowed.includes(origin)) return new Response('Forbidden origin', { status: 403, headers: cors });

    const url = new URL(request.url);
    if (!url.pathname.startsWith('/dav/')) return new Response('Not found', { status: 404, headers: cors });
    const target = (env.TARGET || 'https://dav.jianguoyun.com').replace(/\/+$/, '') + url.pathname + url.search;

    const headers = new Headers();
    for (const h of PASS_HEADERS) { const v = request.headers.get(h); if (v) headers.set(h, v); }
    const hasBody = !['GET', 'HEAD'].includes(request.method);
    const upstream = await fetch(target, { method: request.method, headers, body: hasBody ? await request.arrayBuffer() : undefined, redirect: 'manual' });

    const out = new Headers(upstream.headers);
    out.delete('www-authenticate');            // 避免浏览器弹出系统登录框
    out.delete('set-cookie');
    for (const [k, v] of Object.entries(cors)) out.set(k, v);
    return new Response(upstream.body, { status: upstream.status, headers: out });
  },
};
