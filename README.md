# 词匣 Lexbox

终身累加的英语词库。不按一本本词书背，而是把所有单词按词频排好，建档时标出已经会的词，之后每天只设学习时长，剩下交给算法。

**在线使用：** <https://ferrosophy.github.io/lexbox/>（可以「添加到主屏幕」，安装后离线也能用）

## 功能

- **建档**：按词频分档抽测估算词汇量，认识率高的整档标绿，边界档逐词筛选（认识 / 模糊 / 忘记）。
- **词频体系**：COCA、BNC、柯林斯星级、牛津 3000、考试词表，可随时切换。
- **复习**：FSRS-5 间隔重复，三级评分（认识 / 模糊 / 忘记）。题型分层解锁、可开关：词义回想、听音辨义、反向回想、拼写、听写。
- **每天只设时长**：新词、复习、抽查的数量由算法按时长和复习积压分配；学习时有倒计时，到点自动结束。
- **日历**：每天的学习时长和是否完成目标。
- **笔记、自定义词表**，JSON 备份 / Anki CSV 导出。
- **离线可用（PWA）**，**WebDAV 同步**（默认坚果云，需要一个转发，见 [`worker/`](./worker/README.md)）。

## 文件

| 文件 | 作用 |
|---|---|
| `index.html` | 整个应用（样式和脚本都在里面） |
| `words.js` | 词库数据（约 1.9 万词） |
| `sw.js` | Service Worker，离线缓存 |
| `manifest.webmanifest`、`icons/` | PWA 安装信息和图标 |
| `worker/` | 坚果云 WebDAV 转发（Cloudflare Worker）及部署说明 |

发布新版本时，记得改 `sw.js` 里的 `VERSION`，已安装的设备才会更新缓存。

## 数据来源与致谢

- 词库、音标、释义、词频排名、考试标签：[ECDICT](https://github.com/skywind3000/ECDICT)（MIT License）。英文释义源自 WordNet。
- 复习算法：[FSRS](https://github.com/open-spaced-repetition/fsrs4anki) 第 5 版默认参数。
- 字体：[霞鹜文楷 TC](https://github.com/lxgw/LxgwWenkaiTC)（经 Google Fonts 加载）。
- 设计：莓苔设计系统。
