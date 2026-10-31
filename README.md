# LINWEI · 个人作品网站

使用 React 19 + Vite + Three.js 构建，首页采用黑色背景、Libre Caslon Display 巨型衬线字标与可交互的 3D 精装作品书列。原始 71 页 PDF 整理为 12 个项目，保留分类筛选、详情翻页、键盘控制、响应式布局及作品集下载。

## 本地开发

```sh
cd /workspace/resume
npm ci
npm run dev
```

开发服务监听 `0.0.0.0:3000`。使用 `npm run build` 生成 `dist/`；使用 `npm run preview` 在 3000 端口预览构建（请先关闭开发服务）。

## 内容维护

- `src/main.jsx`：项目、介绍、联系方式和组件。
- `src/style.css`：作品区的桌面及移动端样式。
- `src/PortfolioHero.jsx`：首页、分类导航、抽屉菜单与键盘作品入口。
- `src/BookShelf.jsx`：32 本 3D 作品书、弹簧起伏、入场动画、鼠标拾取与 WebGL 降级。
- `src/portfolio.css`：首页布局及全站黑金主题。
- `public/fonts/`：本地 Libre Caslon Display 和 Inter 字体及其 SIL Open Font License。
- `public/portfolio/`：从用户提供的作品集导出的 WebP 图片和原始 PDF。

项目详情支持左右方向键切换、Escape 关闭。联系方式使用原始作品集信息；不需要环境变量、外部 API 或数据库。

## Netlify 部署

在 Netlify 选择 **Add new project → Import an existing project → GitHub**，授权并选择 `atokiomi/resume`，部署分支选择 `main`。仓库根目录的 `netlify.toml` 已配置构建命令 `npm run build`、发布目录 `dist` 和 Node.js 24，无需填写环境变量。

## 首页交互

首页将现有 12 个项目设计成 32 本交错排列的 3D 精装书，使用原作品图片、英文项目名及原分类。每本书使用独立的弹簧模拟，鼠标附近的书本平滑抬升，点击书本进入原项目详情。触屏设备或鼠标闲置 4 秒后，书列自动起伏；下方控制可暂停和继续动画。首屏分类链接同时切换下方作品筛选。

字体与作品资源均为本地文件，不需要外部图片服务或 Google Fonts。Three.js 场景按需加载。开启系统减少动态效果时停止书列入场与自动/指针起伏；键盘用户可通过 Tab 聚焦作品入口并按 Enter 打开项目。不支持 WebGL 时显示可点击的 CSS 书列。

桌面“更多”和手机菜单按钮打开抽屉导航，支持 Escape 关闭、焦点约束、背景点击关闭及页面滚动锁定。原项目文案、联系方式、71 页作品图片和原始 PDF 均保留。
