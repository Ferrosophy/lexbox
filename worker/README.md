# WebDAV 转发（给坚果云用）

坚果云的 WebDAV 不允许网页直接访问，所以词匣需要一个小小的转发服务。
用 Cloudflare Workers 免费额度就够了（每天 10 万次请求）。

## 部署（网页上点一点，大约 5 分钟）

1. 注册并登录 <https://dash.cloudflare.com>。
2. 左侧 **Workers & Pages → Create → Create Worker**，名字填 `lexbox-dav`，点 **Deploy**。
3. 部署好后点 **Edit code**，把 [`webdav-proxy.js`](./webdav-proxy.js) 的内容整个贴进去覆盖，点 **Deploy**。
4. 记下地址，形如 `https://lexbox-dav.<你的子域>.workers.dev`。
5. 打开词匣 → 设置 → WebDAV 同步：
   - 服务器地址：`https://dav.jianguoyun.com/dav/`（默认就是）
   - 账号：坚果云登录邮箱
   - 应用密码：坚果云网页版 → 右上角账户信息 → 安全选项 → 第三方应用管理 → 添加应用，生成的那串密码
   - 转发地址：第 4 步的地址
   - 点「保存并测试」

## 可选设置

在 Worker 的 **Settings → Variables** 里可以加：

| 变量 | 作用 | 默认 |
|---|---|---|
| `ALLOWED_ORIGINS` | 允许调用的网页来源，逗号分隔。本地调试可以加 `http://localhost:8000` | `https://ferrosophy.github.io` |
| `TARGET` | 换成别的 WebDAV 服务器 | `https://dav.jianguoyun.com` |

## 安全说明

- 只有 `ALLOWED_ORIGINS` 里的网页能用这个转发，其他网站调用会被拒绝。
- 账号密码只是经过 Worker，不会被保存；但 Worker 是你自己的，所以只有你能看到它的日志。
- 请用坚果云的**应用密码**，不要用登录密码。应用密码可以随时在坚果云里单独作废。

## 自己有服务器的话

用 nginx 也可以，核心是给响应加上 CORS 头、放行 `OPTIONS` 预检：

```nginx
location /dav/ {
    if ($request_method = OPTIONS) {
        add_header Access-Control-Allow-Origin https://ferrosophy.github.io;
        add_header Access-Control-Allow-Methods "GET, PUT, DELETE, PROPFIND, MKCOL, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, Depth";
        add_header Access-Control-Max-Age 86400;
        return 204;
    }
    proxy_pass https://dav.jianguoyun.com;
    proxy_ssl_server_name on;
    proxy_set_header Host dav.jianguoyun.com;
    proxy_hide_header WWW-Authenticate;
    add_header Access-Control-Allow-Origin https://ferrosophy.github.io always;
    add_header Access-Control-Expose-Headers "ETag, Last-Modified" always;
}
```
