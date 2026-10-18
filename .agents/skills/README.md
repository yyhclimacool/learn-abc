# 项目开发技能

于 2026-10-18 使用 Codex skill-installer 从 https://github.com/anthropics/skills 的 `main` 分支下载。这里保存完整技能目录（说明、附带脚本、示例及许可证），无需依赖开发者机器上的全局技能副本。

| 技能 | 用途 | 上游来源 |
| --- | --- | --- |
| [frontend-design](frontend-design/SKILL.md) | 适合 5 岁儿童的页面布局、视觉风格和交互设计 | https://github.com/anthropics/skills/tree/main/skills/frontend-design |
| [webapp-testing](webapp-testing/SKILL.md) | 浏览器内验证键盘输入、错误提示、关卡流程和进度恢复 | https://github.com/anthropics/skills/tree/main/skills/webapp-testing |
| [pdf](pdf/SKILL.md) | 可打印描红纸的 PDF 生成和检查 | https://github.com/anthropics/skills/tree/main/skills/pdf |

各技能的许可条款见对应目录的 `LICENSE.txt`。本次仅安装技能文件，未安装 Playwright、浏览器或 PDF 运行依赖；实际开发采用对应工具时再配置依赖。

## 项目使用约定

- 开始相关工作前阅读对应 `SKILL.md`，按需使用，不必每次加载全部技能。
- 儿童可理解性、规范字形和无障碍操作优先于装饰效果。
- PDF 技能用于制作或验证 PDF；网页打印样式仍需在浏览器中检查 A4 分页、四线三格和字形位置。
- 更新时重新下载上游技能，并检查差异；不要直接覆盖项目中的自定义修改。
