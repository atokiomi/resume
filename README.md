# LINWEI · 个人作品网站

使用 React 19 + Vite 构建，首页为白色极简风格，配有弧形遮罩、可拖拽循环作品带与抽屉导航，根据原始 71 页 PDF 整理为 12 个项目，支持分类筛选、详情翻页、键盘控制、响应式布局及作品集下载。

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
- `src/PortfolioHero.jsx`：首页、抽屉导航、循环作品带及拖拽惯性。
- `src/portfolio.css`：首页布局及全站白色主题。
- `public/portfolio/`：从用户提供的作品集导出的 WebP 图片和原始 PDF。

项目详情支持左右方向键切换、Escape 关闭。联系方式使用原始作品集信息；不需要环境变量、外部 API 或数据库。

## Netlify 部署

在 Netlify 选择 **Add new project → Import an existing project → GitHub**，授权并选择 `atokiomi/resume`，部署分支选择 `main`。仓库根目录的 `netlify.toml` 已配置构建命令 `npm run build`、发布目录 `dist` 和 Node.js 24，无需填写环境变量。

## 首页交互

字体使用 Google Fonts Geist。首页图片带展示现有的六个项目封面，requestAnimationFrame 驱动循环滚动，支持水平拖动、松手惯性、暂停与继续；点击作品打开原有项目详情。手机上保留垂直滑动。开启系统减少动态效果时停止自动滚动和惯性，仍可手动拖动浏览。

顶部两条线按钮打开导航菜单：桌面为右侧抽屉，手机为全屏上滑菜单。菜单支持 Escape 关闭、焦点约束、背景点击关闭与页面滚动锁定。首页图片均使用本地原始作品，不依赖外部图片或 3D 模型。
