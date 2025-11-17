"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTranslationConfig = getTranslationConfig;
exports.translateText = translateText;
exports.forceRetranslate = forceRetranslate;
const vscode = __importStar(require("vscode"));
const cache_1 = require("./cache");
/**
 * 获取翻译配置
 */
function getTranslationConfig() {
    const config = vscode.workspace.getConfiguration('hoverTranslator');
    return {
        baseURL: config.get('baseURL', ''),
        apiKey: config.get('apiKey', ''),
        model: config.get('model', ''),
        promptTemplate: config.get('promptTemplate', '请将以下文本翻译为中文：\n${content}'),
        /** 手动翻译模式下，保留的翻译结果数量 */
        quantityTranslation: config.get('quantityTranslation', 5),
        /** 是否启用自动翻译功能 */
        autoTranslate: config.get('autoTranslate', true)
    };
}
/**
 * 翻译文本（含错误处理和超时控制）
 * @param text 待翻译的文本
 * @returns 翻译后的文本或错误信息
 */
async function translateText(text) {
    const { baseURL, apiKey, model, promptTemplate } = getTranslationConfig();
    if (!baseURL || !apiKey) {
        return '❌ **未配置翻译接口**\n请在设置中填写 `baseURL` 和 `apiKey`。';
    }
    const prompt = promptTemplate.replace('${content}', text);
    // 创建 AbortController 用于请求超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
    try {
        const res = await fetch(`${baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: 'system',
                        content: '你是一个编程语言专家，能准确识别声明语法结构并判断其复杂度'
                    },
                    { role: 'user', content: prompt }
                ]
            }),
            signal: controller.signal // 添加信号以支持超时控制
        });
        clearTimeout(timeoutId); // 请求完成，清除超时定时器
        if (!res.ok) {
            return `❌ **翻译请求失败（HTTP ${res.status}）**`;
        }
        const data = await res.json();
        // 增强 API 响应的类型检查
        if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
            return '⚠️ **API 响应格式异常**：未找到翻译结果';
        }
        if (!data.choices[0].message || typeof data.choices[0].message.content !== 'string') {
            return '⚠️ **API 响应格式异常**：翻译内容格式不正确';
        }
        const content = data.choices[0].message.content.trim();
        vscode.window.showInformationMessage('🐾 翻译完成，请重新悬停查看结果～');
        return content || '⚠️ 服务未返回内容';
    }
    catch (err) {
        clearTimeout(timeoutId); // 发生错误，也清除超时定时器
        // 检查是否是超时错误
        if (err instanceof Error && err.name === 'AbortError') {
            return '❌ **翻译请求超时**：请检查网络连接或API服务状态';
        }
        return `❌ **翻译失败**：${String(err)}`;
    }
}
/**
 * 重新翻译文本（覆盖缓存）
 */
async function forceRetranslate(original, hash) {
    const config = getTranslationConfig();
    const result = await translateText(original);
    const entry = {
        original,
        text: result,
        time: Date.now()
    };
    const length = cache_1.allowShowTranslated.unshift(hash);
    // 溢出的翻译不再显示
    if (length > config.quantityTranslation) {
        cache_1.allowShowTranslated.splice(config.quantityTranslation, length);
    }
    cache_1.translationCache.set(hash, entry);
    (0, cache_1.saveCache)();
}
//# sourceMappingURL=translation.js.map