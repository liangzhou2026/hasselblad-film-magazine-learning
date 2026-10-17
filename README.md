# 哈苏胶片后背三维学习台

[English](README.en.md) · [MIT](LICENSE) · [资料与许可范围](THIRD_PARTY_NOTICES.md)

[在线学习（中文）](https://liangzhou2026.github.io/hasselblad-film-magazine-learning/?lang=zh) · [English demo](https://liangzhou2026.github.io/hasselblad-film-magazine-learning/?lang=en) · [含手册的完整源码](https://github.com/liangzhou2026/hasselblad-film-magazine-learning/releases/tag/v1.0.2) · [模型下载](https://github.com/liangzhou2026/hasselblad-film-magazine-learning/releases/tag/v1.0.0)

一个支持中文和英文的浏览器学习工具，用三维模型理解 Hasselblad 胶片后背的零件、结构、拆装和养护资料。独立社区项目，模型为教学近似，不是原厂 CAD 或实物维修验收依据。

## 可以学习什么

- A12、A16、A24：零件与总成、22 步拆卸及 26 阶段安装演示、润滑资料索引。动画播放时可以旋转、放大观察。
- A16S、A32、A12TCC、A16TCC、A24TCC、E12、E16、E24、E12CC、Magazine 70、Polaroid 100、PolaPlus、PolaBasic：自由拆解和分层观察。仅标注有手册依据的零件，不提供详细维修顺序。
- 统一型号菜单、零件选择/隐藏、中英文说明、手册页码索引、故障维护视频来源。

网页直接用 JavaScript 构建模型；浏览三维场景不下载大型 GLB。资料面板内置 66 页后背维修手册、23 页使用说明书和 193 页 Service Infos / S7 维护通告合订本，并保留原始来源说明。三份 PDF 保持原字节；共 282 页页图按需加载，用于手机阅读及直接对应零件与步骤。也可自行选择本地 PDF（仅当前浏览器会话使用，不上传）。个人收集的实物照片不随开源包分发。

## 中英文切换

页面右上角选择 **中文 / English**。界面、零件名称与说明、拆卸/安装步骤、养护和视频介绍一并切换；当前型号、观察状态、搜索输入和动画进度保持。选择会在本浏览器保存，也可用网址参数 `lang=en` 或 `lang=zh` 指定语言。

零件搜索同时支持中英文名称和编号。翻译不修改源模型、零件编号、数值或手册页码；原始 PDF、YouTube 视频及可选 GLB/JSON 附件保留原内容。英文中的 film insert / film holder 均指后背片芯。

## 本地运行

手机按单栏显示，型号选择置顶，可用快捷导航在三维模型、零件和学习资料间跳转。平板随横竖屏调整分栏；视角和缩放按钮在小屏折叠，主要控件增大以便触摸操作。三维模型支持单指旋转和双指缩放；原厂手册可直接逐页阅读。

需要支持 WebGL 的现代浏览器和 Node.js 22 或更新版本。无需安装 npm 依赖。

```sh
node scripts/serve.mjs
```

打开终端显示的本机预览地址。预览使用 `/learning/` 子路径，便于检查 GitHub 项目页面的相对链接。端口已被占用时可用 `node scripts/serve.mjs 8934`。停止服务按 Ctrl+C。

也可以把 `site/` 放在任何静态 HTTP 服务器中。场景、课程与内置手册均随站点提供；外部来源链接、YouTube 和 Releases 下载需要网络。浏览器第一次访问 GitHub Pages 需要联网；本项目没有离线缓存安装功能。

## 检查

```sh
node scripts/check-release.mjs
node --expose-gc scripts/check-i18n.cjs
```

检查文件大小、静态资源链接、Linux 大小写路径、常见凭证和个人路径、脚本语法、16 型目录及课程范围。内置 PDF 和页图必须列入 `site/manuals/manifest.json`，逐项核对大小、SHA256 和文件格式；未列入清单的 PDF、照片及其他研究附件仍被拒绝。检查不能代替浏览器/WebGL、实物维修或完整授权审查。新增图片、附件、依赖或链接时应重新检查其来源与许可。

语言检查执行 16 型实际模型构建与最终版本数据，核对英文覆盖、数字和编号、动态界面文字、中英往返与输入保护。DOM 使用测试替身；浏览器画面与实际动画需另行验证。

## 部署自己的副本

1. 新建一个空仓库，将本目录的**内容**作为仓库根上传或使用 Git 推送。包括 `.github`、`.gitignore` 等隐藏文件；不要上传整个研究工作目录。
2. 在 GitHub 仓库 Settings → Pages → Build and deployment 中选择 **GitHub Actions**。
3. 默认分支使用 `main`。推送后，`Check source package` 检查内容，`Publish learning site` 仅将 `site/` 部署到 Pages。也可在 Actions 手动运行后者。若使用其他默认分支，修改工作流的 `branches`。
4. 以自己仓库的 Pages 工作流实际返回地址为准，并更新 README 中的演示链接。

工作流仅使用仓库自带的 `GITHUB_TOKEN` 权限，不需要在源文件中填写密钥。开启 Pages 受账户、仓库可见性和组织策略影响；部署后检查 Actions 运行结果和实际页面。

## 可选的大模型附件

13 型 GLB 与相应 `.parts.json` 放在 GitHub **[Releases](https://github.com/liangzhou2026/hasselblad-film-magazine-learning/releases/tag/v1.0.0)**，不放进 Git 仓库或 Pages。只浏览网页时可以完全不下载这些附件。自行发布副本时：

1. 创建标签 `v1.0.0` 的 Release，上传准备好的 13 个 `.glb` 和 13 个 `.parts.json` **单独文件**；仅上传 ZIP 无法满足网页的单文件链接。可额外附上模型 ZIP、说明、manifest 和 SHA256 校验表。
2. 确认附件上传完成后，修改 `site/release-config.js` 的 `repository` 为真实的 `账户名/仓库名`。`releaseTag` 必须与实际标签一致。
3. 提交配置并重新部署，核对一个 GLB 与一个零件表的实际下载链接。配置为空时，网页会说明附件尚未发布，不制造失效下载地址。

GLB 仅保存静态教学几何、分组和部分程序纹理；不含网页动画、Canvas 印字、浏览器灯光或交互。A12/A16/A24 的程序模型与动画包含在源码，当前没有对应独立 GLB 附件。模型/零件表的根变换必须保留，不能单独使用未经变换的局部坐标。

## 目录

```text
site/                 静态网页与程序建模源码
site/vendor/          Three.js 与其许可
site/manuals/         三份学习手册、页图与校验清单
scripts/              本地预览与发布检查
.github/workflows/    检查和 Pages 部署
```

除清单列出的三份手册和对应页图外，其他研究用 PDF、照片、Blender 文件、Windows 安装包和开发缓存留在私人研究目录。本仓库未包含 Windows 离线成品包。手册及页图保留原有版权标识和权利，不属于本项目 MIT 授权范围；详见 [资料与许可范围](THIRD_PARTY_NOTICES.md)。

## 贡献

欢迎提交带有手册版次、页码、可核实来源或自有实拍的纠错。新增资料请说明来源、权利与使用范围；不要把私人照片或未列入审核清单的手册混入 PR。几何改动请说明哪些有测量依据、哪些是教学示意，并检查该型号及共享构件。参见 [贡献说明](CONTRIBUTING.md)。

## 文件体积依据

GitHub 普通 Git 单文件超过 100 MiB 会被阻止，浏览器上传单文件上限 25 MiB；大型下载附件适合使用 Releases。Pages 发布站点上限 1 GB。具体规则以 [GitHub 大文件文档](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)、[Pages 限制](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)和 [Releases 文档](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)为准。
