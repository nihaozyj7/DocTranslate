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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const cache_1 = require("./cache");
const commands_1 = require("./commands");
const hoverProvider_1 = require("./hoverProvider");
/**
 * 插件激活入口
 * 初始化缓存、注册命令和创建悬停翻译提供者
 * @param context VSCode 扩展上下文
 * @returns 插件导出对象，包含插件停用方法
 */
function activate(context) {
    // 初始化翻译缓存系统
    (0, cache_1.initCache)(context);
    // 注册所有命令（切换模式、重新翻译、查看缓存等）
    (0, commands_1.registerCommands)(context);
    // 获取启动延迟配置（确保翻译内容始终显示在悬浮提示的最顶部）
    const config = vscode.workspace.getConfiguration('hoverTranslator');
    const startupDelay = config.get('startupDelay', 5000);
    // 延迟注册悬停提供者以确保正确显示位置
    setTimeout(() => {
        const hoverProvider = (0, hoverProvider_1.createHoverProvider)();
        context.subscriptions.push(hoverProvider);
        console.log('🐾 hoverTranslator: 插件已启动');
    }, startupDelay);
    // 返回扩展对象
    return {
        // 插件停用时的清理函数
        deactivate
    };
}
/**
 * 插件停用
 * 清理资源和缓存
 */
function deactivate() {
    console.log('🐾 hoverTranslator: 插件已停用');
}
//# sourceMappingURL=extension.js.map