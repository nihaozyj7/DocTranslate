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
const assert = __importStar(require("assert"));
const utils_1 = require("../src/utils");
suite('Utils Test Suite', () => {
    test('md5 function should generate correct hash', () => {
        const input = 'hello world';
        const expectedHash = '5d41402abc4b2a76b9719d911017c592';
        const result = (0, utils_1.md5)(input);
        assert.strictEqual(result, expectedHash);
    });
    test('md5 function should handle empty string', () => {
        const input = '';
        const expectedHash = 'd41d8cd98f00b204e9800998ecf8427e';
        const result = (0, utils_1.md5)(input);
        assert.strictEqual(result, expectedHash);
    });
    test('md5 function should handle special characters', () => {
        const input = 'hello@#$%世界';
        const result = (0, utils_1.md5)(input);
        // Just ensure it returns a valid MD5 hash (32 hex characters)
        assert.ok(/^[a-f0-9]{32}$/.test(result));
    });
    test('debounce function should delay execution', (done) => {
        let callCount = 0;
        const debouncedFn = (0, utils_1.debounce)(() => {
            callCount++;
        }, 10);
        // Call multiple times in quick succession
        debouncedFn();
        debouncedFn();
        debouncedFn();
        // Wait longer than debounce delay
        setTimeout(() => {
            assert.strictEqual(callCount, 1);
            done();
        }, 50);
    });
    test('debounce function should not execute if cleared', (done) => {
        let callCount = 0;
        const debouncedFn = (0, utils_1.debounce)(() => {
            callCount++;
        }, 10);
        debouncedFn();
        // Clear the timeout by calling debounced function again after a short delay
        setTimeout(() => {
            debouncedFn(); // This should clear the previous timeout
            setTimeout(() => {
                assert.strictEqual(callCount, 1); // Only the last call should execute
                done();
            }, 50);
        }, 5);
    });
});
//# sourceMappingURL=utils.test.js.map