# Lunaria 宣发与增长素材包

更新日期：2026-09-05

## 一句话定位

Lunaria 是一个开源 3D 月相查看器：选择日期、当地时间和地点，还原那一刻的月相、天平动、天空位置与真实倾斜，并生成可分享的月亮纪念卡。

English: Lunaria is an open-source 3D Moon viewer that reconstructs lunar phase, libration, sky position, and local orientation for any date, time, and place.

## 核心链接

- 产品：https://lunaria.timeblind.xyz/
- 中文入口：https://lunaria.timeblind.xyz/zh/
- English：https://lunaria.timeblind.xyz/en/
- 出生月亮：https://lunaria.timeblind.xyz/zh/moon-on-birthday/
- 天平动指南：https://lunaria.timeblind.xyz/zh/guides/lunar-libration/
- GitHub：https://github.com/kokoro-ele/Lunaria

## 发布文案

### 即刻 / 微博 / 小红书短文案

那一刻的月亮，分毫不差。🌙

我做了一个免费的 3D 月相网站 Lunaria。选一个日期、当地时间和地点，就能看到那一刻的月相、照亮比例、天平动、月亮在天空中的方向，以及从当地实际看到的倾斜角度。还可以生成「你出生那天的月亮」「我们相遇那夜的月亮」纪念卡，或直接分享可还原结果的链接。

在线体验：https://lunaria.timeblind.xyz/
源码：https://github.com/kokoro-ele/Lunaria

#月亮 #月相 #天文 #独立开发 #开源项目

### V2EX / 少数派 / Hacker News 长文开头

我一直觉得多数月相页面只回答了“今天亮了多少”，却没有回答“从我所在的地方抬头看，它究竟朝哪个方向”。所以我做了 Lunaria：一个开源的 3D 月相查看器。

它会把输入的当地钟表时间按地点转换为 UTC，再计算月相、照亮比例、月龄、地月距离、天平动、站心高度角与方位角，并用视差角还原月面相对当地地平线的朝向。页面也支持把某个时刻保存成纪念图片或可恢复设置的链接。

我把计算方法、精度限制与来源写在了公开页面中，欢迎体验、指出问题或贡献代码。

### Product Hunt tagline

See the Moon exactly as it looked from any moment and place.

### Product Hunt / Indie Hackers description

Lunaria is a free, open-source 3D Moon viewer. Pick a local date, time, and place to reconstruct lunar phase, illumination, distance, libration, altitude, azimuth, horizon status, and the Moon's apparent orientation in your sky. Save a personalized keepsake image or copy a link that restores the same view. The calculation method, sources, and limitations are public.

### Hacker News title

Show HN: Lunaria – an open-source 3D Moon viewer for any time and place

### Reddit title

I built a free 3D Moon viewer that accounts for location, local time, libration, and sky orientation

## 推荐渠道与内容角度

1. GitHub / Hacker News / V2EX：突出开源、天文计算、Three.js 与时区处理。
2. 小红书 / 微博 / 即刻：使用出生、相遇、纪念日场景，配产品生成的竖版纪念卡。
3. Product Hunt / Indie Hackers：突出视觉体验、零注册、免费与可分享结果链接。
4. 天文论坛 / 教师社群：分享计算方法和天平动指南，避免只发产品链接。
5. 个人博客 / Medium / 掘金：写“为什么南北半球看到的月亮方向不同”和“怎样正确还原历史月相”，自然链接到工具与方法页。

## UTM 约定

仅在外部宣发链接使用 UTM；站内链接和搜索引擎 canonical 保持干净。

```text
https://lunaria.timeblind.xyz/?utm_source=v2ex&utm_medium=community&utm_campaign=launch
https://lunaria.timeblind.xyz/?utm_source=xiaohongshu&utm_medium=social&utm_campaign=birthday_moon
https://lunaria.timeblind.xyz/en/?utm_source=producthunt&utm_medium=launch&utm_campaign=launch
```

命名规则：小写英文、空格改下划线；`utm_source` 表示平台，`utm_medium` 表示渠道类型，`utm_campaign` 表示同一轮活动。

## 上线后两周执行清单

- 第 1 天：GitHub Release、V2EX / Hacker News、一个中文社交平台；记录各自 UTM。
- 第 2–3 天：回复反馈并修正产品问题，不重复刷屏。
- 第 4–7 天：发布一篇教育型内容（建议“月相相同，为什么月亮看起来会转？”）。
- 第 8–10 天：发布出生月亮/纪念日使用案例，展示真实生成卡片。
- 第 14 天：在 Search Console 按查询词、页面、国家和设备复盘曝光与点击，决定下一篇指南。

新增或大幅更新页面并部署后，可运行 `npm run submit:indexnow` 通知 Bing 等支持 IndexNow 的搜索引擎。

## 数据复盘指标

- 搜索：收录页面数、自然曝光、非品牌查询、点击率、排名变化。
- 产品：打开查看器 → 选择地点 → 打开分享 → 复制链接或保存图片的漏斗。
- 宣发：各 UTM 来源的访问、分享完成率、次日回访。
- GEO/AEO：来自 `chatgpt.com`、Bing Copilot 等可识别来源的访问；AI 搜索中被引用的页面与查询主题。

当前仓库未配置站点分析账号，因此没有写入虚构的统计 ID。拿到 Cloudflare Web Analytics、Plausible 或 GA4 的真实站点标识后再接入，并保持隐私说明一致。
