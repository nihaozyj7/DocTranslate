# DocTranslate

一款 VSCode 悬浮文档翻译插件，支持 AI 翻译悬停文本，可自定义翻译 API 和提示词。

![介绍](<assets/README/25y11m17d 22H32M40S.gif>)

## 🌟 特性

- ✨ **悬浮翻译**：在代码中悬停鼠标即可自动翻译文本内容
- 🔄 **原文/译文切换**：轻松切换显示原文或译文
- 💾 **智能缓存**：自动缓存翻译结果，避免重复请求，支持30天过期清理
- 🔧 **高度自定义**：支持自定义API接口（阿里百炼、Moonshot、本地大模型等）、模型名称和提示词模板
- 📋 **缓存管理**：提供可视化缓存管理界面，可查看、编辑、删除缓存内容
- 🛠️ **手动/自动模式**：支持自动翻译和手动翻译两种模式，灵活适应不同需求
- 🌐 **多API支持**：兼容OpenAI格式的API接口，适用于阿里百炼、Moonshot等服务商

## 📦 安装

### 市场安装
1. 打开 VSCode 扩展市场
2. 搜索 "DocTranslate"
3. 点击安装

### 命令行安装
```bash
ext install doctranslate.doctranslate
```

## ⚙️ 配置

在 VSCode 设置中搜索 `hoverTranslator`，配置以下选项：

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `baseURL` | string | `https://dashscope.aliyuncs.com/compatible-mode/v1` | API 接口地址，支持阿里百炼等OpenAI格式接口 |
| `apiKey` | string | `""` | API 密钥 |
| `model` | string | `qwen3-next-80b-a3b-instruct` | 使用的AI模型名称 |
| `promptTemplate` | string | `简短解释一下：${content}` | 提示词模板，`${content}` 为原文占位符 |
| `autoTranslate` | boolean | `true` | 是否启用自动翻译（关闭后需手动点击翻译按钮） |
| `quantityTranslation` | number | `5` | 手动翻译模式下保留的翻译结果数量 |
| `startupDelay` | number | `3000` | 插件启动延迟时间（毫秒），确保翻译内容显示在悬浮提示顶部 |

### API 配置示例

#### 阿里百炼（默认）
- `baseURL`: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- `model`: `qwen3-next-80b-a3b-instruct`

#### OpenAI
- `baseURL`: `https://api.openai.com/v1`
- `model`: `gpt-4o` 或 `gpt-3.5-turbo`

#### 本地 Ollama
- `baseURL`: `http://localhost:11434/v1`
- `model`: `llama3` 或其他本地模型

** 注意：接口需要支持openai格式，目前国内主流大模型厂商均支持该格式，建议使用非思考模型 **

## 💡 使用方法

### 基本使用
1. 在代码文件中悬停鼠标到需要翻译的文本上
2. 等待翻译结果显示（自动模式）或点击"翻译"按钮（手动模式）
3. 点击"重新翻译"按钮更新翻译结果
4. 通过"禁用翻译"/"开启翻译"切换翻译功能状态

### 缓存管理
1. 使用 `Ctrl+Shift+P` 打开命令面板
2. 搜索并执行"查看翻译缓存"
3. 在缓存管理界面可以：
   - 查看所有缓存的翻译结果
   - 编辑翻译内容
   - 删除单个缓存条目
   - 清空全部缓存

### 提示词模板自定义
可以通过 `promptTemplate` 配置项自定义翻译提示词：
- `${content}` - 原文内容占位符
- 例如：`请将以下代码注释翻译成中文：${content}`

## 🛠️ 开发环境

### 先决条件
- Node.js (推荐 v18+)
- pnpm (推荐)
- VSCode

### 项目设置
```bash
# 克隆项目
git clone https://github.com/nihaozyj7/DocTranslate

# 进入项目目录
cd DocTranslate

# 安装依赖
pnpm install

# 编译项目
pnpm run compile

# 启动开发调试（按 F5）
# 或者监听编译
pnpm run watch
```

### 项目结构
```
src/
├── extension.ts        # 插件入口点，激活和停用逻辑
├── hoverProvider.ts    # 悬浮提供者，处理悬停事件和翻译显示
├── translation.ts      # 翻译核心逻辑，API请求和错误处理
├── cache.ts           # 缓存管理，包括过期清理和持久化
├── commands.ts        # 命令定义，提供翻译开关等功能
├── types.ts           # 类型定义
├── utils.ts           # 工具函数，如MD5哈希等
└── views/
    └── cacheView.ts   # 缓存可视化管理界面
```

### 主要功能实现
- **Hover翻译**: 利用VSCode的Hover Provider API实现悬浮翻译
- **缓存机制**: 使用MD5哈希作为键值缓存翻译结果，避免重复翻译
- **防抖处理**: 防止重复请求和界面闪烁
- **状态管理**: 使用globalState存储用户偏好和缓存数据

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进项目：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发规范
- 使用 TypeScript 进行类型安全的开发
- 遵循 ESLint 代码规范
- 保持代码模块化和可维护性

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📈 更新日志

### 最新版本 v0.0.11
- 支持手动翻译模式和自动翻译模式
- 添加缓存管理功能，支持查看、编辑、删除缓存
- 优化代码结构，提高可维护性
- 添加过期缓存清理机制

查看完整的更新历史请见 [CHANGELOG.md](CHANGELOG.md) 文件。


## 🐛 问题反馈

如果遇到问题或有建议，请在 [GitHub Issues](https://github.com/nihaozyj7/DocTranslate/issues) 中提交反馈。

---

**DocTranslate** © 2025 [nihaozyj7](https://github.com/nihaozyj7). Released under the MIT License.
