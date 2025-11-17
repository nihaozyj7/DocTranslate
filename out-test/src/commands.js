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
exports.getShowTranslated = getShowTranslated;
exports.setShowTranslated = setShowTranslated;
exports.registerCommands = registerCommands;
const vscode = __importStar(require("vscode"));
const cacheView_1 = require("./views/cacheView");
const translation_1 = require("./translation");
const utils_1 = require("./utils");
/** 当前是否显示翻译内容 */
let showTranslated = true;
/**
 * 获取当前是否显示翻译内容的状态
 * @returns 是否显示翻译内容
 */
function getShowTranslated() {
    return showTranslated;
}
/**
 * 设置是否显示翻译内容的状态
 * @param value 新的状态值
 */
function setShowTranslated(value) {
    showTranslated = value;
}
/**
 * 注册所有命令
 */
function registerCommands(context) {
    showTranslated = context.globalState.get('showTranslated', true);
    /** 切换显示模式 */
    const toggleMode = vscode.commands.registerCommand('hoverTranslator.toggleMode', () => {
        showTranslated = !showTranslated;
        context.globalState.update('showTranslated', showTranslated);
        vscode.window.showInformationMessage(`🐾 已${showTranslated ? '启用' : '禁用'}悬浮翻译～`);
    });
    /** 强制重新翻译 */
    const retranslate = vscode.commands.registerCommand('hoverTranslator.retranslate', async (encoded) => {
        if (!encoded)
            return;
        const original = Buffer.from(encoded, 'base64').toString('utf-8');
        const hash = (0, utils_1.md5)(original);
        // 尝试获取当前编辑器的文档和位置，用于上下文提取
        const activeEditor = vscode.window.activeTextEditor;
        let document = undefined;
        let position = undefined;
        if (activeEditor) {
            document = activeEditor.document;
            position = activeEditor.selection.active; // 使用当前光标位置
        }
        // 重新翻译，尝试使用当前文档上下文
        await (0, translation_1.forceRetranslate)(original, hash, document, position);
        vscode.commands.executeCommand('editor.action.showHover');
    });
    const showCache = vscode.commands.registerCommand('hoverTranslator.showCache', () => (0, cacheView_1.openCacheView)(context));
    context.subscriptions.push(toggleMode, retranslate, showCache);
}
//# sourceMappingURL=commands.js.map