"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.md5 = md5;
exports.debounce = debounce;
exports.getContextAround = getContextAround;
const crypto_1 = require("crypto");
/**
 * 计算 MD5 值
 * @param str 输入字符串
 * @returns md5 哈希值
 */
function md5(str) {
    return (0, crypto_1.createHash)('md5').update(str, 'utf-8').digest('hex');
}
/**
 * 创建一个防抖函数
 * @param fn 需要防抖执行的函数
 * @param delay 延迟时间
 */
function debounce(fn, delay) {
    let timer = null;
    return () => {
        if (timer)
            clearTimeout(timer);
        timer = setTimeout(() => fn(), delay);
    };
}
/**
 * 获取文档上下文
 * @param document 文档对象
 * @param position 光标位置
 * @param contextLines 上下文行数
 * @param maxContextLength 最大上下文长度
 * @returns 上下文字符串
 */
function getContextAround(document, position, contextLines, maxContextLength) {
    const startLine = Math.max(0, position.line - contextLines);
    const endLine = Math.min(document.lineCount - 1, position.line + contextLines);
    let contextLinesArray = [];
    for (let i = startLine; i <= endLine; i++) {
        const lineText = document.lineAt(i).text;
        contextLinesArray.push(lineText);
    }
    let context = contextLinesArray.join('\n');
    // 如果上下文长度超过限制，进行截断
    if (context.length > maxContextLength) {
        context = context.substring(0, maxContextLength) + '... (上下文截断)';
    }
    return context;
}
//# sourceMappingURL=utils.js.map