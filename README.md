# Vue 日记应用

一款基于 Vue.js 开发的日记应用，可以运行在 Android 系统上。

## 功能特性

- ✅ 创建、编辑和删除日记
- ✅ 查看日记列表和详情
- ✅ 本地存储日记数据
- ✅ 支持 Android 平台
- ✅ 响应式设计，适配移动设备
- ✅ 首次使用时提供示例数据

## 技术栈

- Vue 3
- Vite
- Vuex (状态管理)
- Vue Router (路由)
- Capacitor (跨平台应用构建)

## 快速开始

### 前提条件

确保你的系统上安装了以下软件：

- Node.js (v14 或更高版本) - [下载安装](https://nodejs.org/zh-cn/download/)
- npm (Node.js 自带) 或 yarn
- Android Studio (用于 Android 开发) - [下载安装](https://developer.android.com/studio)

### 安装依赖

**重要：** 在运行应用之前，必须先安装项目依赖。

```bash
# 使用 npm 安装依赖
npm install

# 或使用 yarn
# yarn install
```

如果遇到权限问题，可以尝试使用管理员权限运行命令提示符或终端。

### 开发模式

安装完依赖后，启动本地开发服务器：

```bash
npm run dev
```

然后在浏览器中打开 http://localhost:3000 查看应用。

### 构建应用

构建生产版本：

```bash
npm run build
```

### Android 部署

#### 1. 初始化 Capacitor Android 项目

首先确保已经构建了应用，然后运行：

```bash
# 安装 Capacitor CLI (如果尚未安装)
npm install -g @capacitor/cli

# 添加 Android 平台
npx cap add android

# 同步项目
npx cap sync
```

#### 2. 打开 Android Studio 并构建应用

```bash
npx cap open android
```

这将打开 Android Studio，你可以在其中构建和运行应用。

#### 3. 运行应用到设备

在 Android Studio 中，连接你的 Android 设备，然后点击运行按钮将应用安装到设备上。

## 常见问题解决

### 问题：无法找到 vite 模块

**错误信息：** `Error: Cannot find module 'vite'`

**解决方案：** 这是因为没有安装项目依赖，请运行 `npm install` 安装所有必要的依赖。

### 问题：无法识别 npm 命令

**错误信息：** `无法将"npm"项识别为 cmdlet、函数、脚本文件或可运行程序的名称`

**解决方案：** 这表明 Node.js 可能没有正确安装或没有添加到系统环境变量中。请重新安装 Node.js，并确保在安装过程中勾选了"Add to PATH"选项。

## 项目结构

```
├── src/
│   ├── components/       # Vue 组件
│   │   ├── HomePage.vue  # 日记列表页面
│   │   ├── EditDiaryPage.vue # 编辑日记页面
│   │   └── DiaryDetailPage.vue # 日记详情页面
│   ├── App.vue           # 根组件
│   └── main.js           # 应用入口文件
├── index.html            # HTML 入口文件
├── vite.config.js        # Vite 配置文件
├── package.json          # 项目依赖和脚本
├── capacitor.config.json # Capacitor 配置文件
└── .gitignore            # Git 忽略规则
```

## 数据存储

应用使用 Capacitor Preferences API 在本地存储日记数据。数据以 JSON 格式保存在设备上，即使关闭应用后数据也不会丢失。

首次使用时，应用会自动创建一些示例日记，以便你快速了解应用功能。

## License

MIT