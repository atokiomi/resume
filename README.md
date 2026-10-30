# LINWEI · 个人作品网站

使用 React 19 + Vite + Three.js r169 构建，首页为黑底玻璃立方体交互场景，根据原始 71 页 PDF 整理为 12 个项目，支持分类筛选、详情翻页、键盘控制、响应式布局及作品集下载。

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
- `src/GlassHero.jsx`：玻璃立方体场景、双通道折射、色散与旋转交互。
- `src/glass.css`：首页布局及全站黑白主题。
- `public/portfolio/`：从用户提供的作品集导出的 WebP 图片和原始 PDF。

项目详情支持左右方向键切换、Escape 关闭。联系方式使用原始作品集信息；不需要环境变量、外部 API 或数据库。

## Netlify 部署

在 Netlify 选择 **Add new project → Import an existing project → GitHub**，授权并选择 `atokiomi/resume`，部署分支选择 `main`。仓库根目录的 `netlify.toml` 已配置构建命令 `npm run build`、发布目录 `dist` 和 Node.js 24，无需填写环境变量。

## 玻璃场景

首页支持拖动旋转、左右按钮及键盘方向键旋转、三种预设视角。手机上保留垂直滑动浏览作品，水平拖动可旋转。开启系统减少动态效果时停止自动旋转及惯性，仍可手动操作。

Poppins 字体从 Google Fonts 加载；模型使用设计要求指定的 CloudFront GLB 地址直接加载，不存入仓库。模型加载失败或超过 8 秒时使用 RoundedBoxGeometry，WebGL 不可用时展示静态替代效果；作品与联系功能不依赖模型加载。Three.js 固定在 0.169.0，随构建打包，无需运行时 CDN 脚本。
