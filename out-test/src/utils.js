"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.md5 = md5;
exports.debounce = debounce;
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
//# sourceMappingURL=utils.js.map