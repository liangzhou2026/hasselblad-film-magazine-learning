# 第三方资料与许可范围

本项目是独立社区学习项目，与 Hasselblad 品牌方无隶属或官方认证关系。品牌、型号和零件编号用于识别研究对象。

## 随源码提供

- 本项目原创代码、说明及程序生成的教学几何：根目录 [MIT 许可证](LICENSE)。同一维护者其他学习项目复用的代码纳入同一许可。
- Three.js 0.160.1：`site/vendor/three.min.js`，Copyright © 2010–2023 Three.js authors。完整 MIT 许可保留于 [THREE-LICENSE.txt](site/vendor/THREE-LICENSE.txt)。上游项目：[mrdoob/three.js](https://github.com/mrdoob/three.js)。

模型材料使用程序生成的表面图，不以网络商品照片或维修手册页面作为贴图。可选 Releases 中的教学 GLB 和零件表沿用本项目 MIT 许可；许可不代表尺寸、结构或维修顺序经过原厂验证。

## 随站点提供的维修学习资料

- Hasselblad《Film Magazines》原厂维修手册，66 页扫描版：`site/manuals/service-manual.pdf`。[Galerie-photo 来源 PDF](https://www.galerie-photo.com/manuels/hasselblad-magasins.pdf)。网页采用 PDF 阅读器页码，可能随扫描版本变化。
- 《A-type Film Magazines》使用说明书，23 页：`site/manuals/user-manual.pdf`。[Butkus 来源页](https://butkus.org/chinon/hasselblad/hasselblad_a-type_magazines/hasselblad_a-type_magazines.htm)。
- Service Infos / S7 改型通告，193 页合订本：`site/manuals/service-bulletins.pdf`。由维护者提供；原始公开下载地址尚未核实，因此不杜撰来源链接。
- `site/manuals/pages/` 中的页图由这些 PDF 渲染，便于对照零件和维修步骤；不是原创插画或重新授权的模型贴图。文件与 SHA256 记录于 `site/manuals/manifest.json`。

这三份手册及其页图供维修学习，保留原有作者、出版者、版权及来源标识；本项目没有将它们重新许可为 MIT。公开网站可下载、非商业学习用途均不表示原作品已成为公共领域。

## 只提供出处、不随公开包分发的资料

- 维护者收集的实物照片和网络商品照片不包含在仓库、Pages 文件或模型附件中。
- YouTube 视频只提供原始链接和用户主动点击后的嵌入播放，不包含下载片段、截图或转载视频。视频名称、链接见 `site/video-library.js`，视频版权属于原作者。

MIT 许可不覆盖上述原始手册及页图、照片、视频、品牌或商标。引用资料的链接失效时，请以同版原文核对；不要将私人资料目录重新加进仓库。

## 学习边界

中文说明和建模是教学整理，可能存在翻译、版本和几何误差；没有实测尺寸、碰撞校验、弹簧预紧、电气联锁或试卷验收。A12/A16/A24 具有较详细的课程，其他 13 型仅演示自由拆解和分层观察。不能据此加工替换零件或把动画位移视作已验证维修动作。
