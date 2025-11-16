import * as vscode from 'vscode'
import { translationCache, saveCache } from '../cache'
import { CacheEntry } from '../types'

/**
 * 打开缓存可视化 Webview
 */
export function openCacheView(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'hoverTranslatorCache',
    '翻译缓存管理',
    vscode.ViewColumn.One,
    { enableScripts: true }
  )

  const update = () => {
    panel.webview.html = getHtml(Array.from(translationCache.entries()))
  }

  update()

  // 监听前端消息
  panel.webview.onDidReceiveMessage(msg => {
    if (msg.type === 'delete') {
      translationCache.delete(msg.hash)
      saveCache()
      update()
    }

    if (msg.type === 'clear') {
      translationCache.clear()
      saveCache()
      update()
    }

    if (msg.type === 'editSave') {
      const entry = translationCache.get(msg.hash)
      if (entry) {
        entry.text = msg.text
        entry.time = Date.now()
        translationCache.set(msg.hash, entry)
        saveCache()
      }
      update()
    }
  })
}

/**
 * 构建 Webview HTML（包含编辑功能）
 */
function getHtml(items: [string, CacheEntry][]) {
  const rows = items
    .map(([hash, entry]) => {
      const time = new Date(entry.time).toLocaleString()
      return `
        <tr id="row-${hash}">
          <td class="col-hash">${hash}</td>

          <td class="col-text"><pre>${escape(entry.original)}</pre></td>

          <!-- ❤️ 翻译内容列：支持编辑 -->
          <td class="col-text">
            <div id="view-${hash}">
              <pre>${escape(entry.text)}</pre>
              <button class="btn-small" onclick="edit('${hash}')">编辑</button>
            </div>

            <div id="edit-${hash}" style="display:none;">
              <textarea id="text-${hash}" class="edit-box">${escape(entry.text)}</textarea>
              <br/>
              <button class="btn-small" onclick="saveEdit('${hash}')">保存</button>
              <button class="btn-small" onclick="cancelEdit('${hash}')">取消</button>
            </div>
          </td>

          <td class="col-time">${time}</td>

          <td class="col-actions">
            <button onclick="deleteCache('${hash}')">删除</button>
          </td>
        </tr>
      `
    })
    .join('\n')

  return `
  <!DOCTYPE html>
  <html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <style>
      body {
        font-family: sans-serif;
        padding: 16px;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
      }

      h2 {
        margin-bottom: 12px;
      }

      button {
        padding: 4px 10px;
        cursor: pointer;
      }

      .btn-small {
        padding: 2px 6px;
        font-size: 12px;
      }

      #clearAll {
        margin-bottom: 12px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }

      th, td {
        border: 1px solid #d0d0d0;
        padding: 8px;
        vertical-align: top;
      }

      .col-hash {
        width: 180px;
        word-break: break-all;
        font-family: monospace;
        font-size: 12px;
      }

      .col-time {
        width: 140px;
        white-space: nowrap;
      }

      .col-actions {
        width: 80px;
        text-align: center;
      }

      .col-text {
        width: 350px;
        max-height: 220px;
        overflow: auto;
      }

      pre {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
      }

      /* ❤️ 编辑框样式 */
      .edit-box {
        width: 100%;
        height: 160px;
        font-family: monospace;
        font-size: 13px;
        padding: 6px;
        box-sizing: border-box;
        background-color: #00000000;
        color: #ffffff;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <h2>🐾 翻译缓存查看器</h2>

      <button id="clearAll" onclick="clearAll()">清空全部缓存</button>

      <table>
        <thead>
          <tr>
            <th>Hash</th>
            <th>原文</th>
            <th>翻译内容</th>
            <th>时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <script>
      const vscode = acquireVsCodeApi()

      function deleteCache(hash) {
        vscode.postMessage({ type: 'delete', hash })
      }

      function clearAll() {
        vscode.postMessage({ type: 'clear' })
      }

      // ❤️ 进入编辑状态
      function edit(hash) {
        document.getElementById('view-' + hash).style.display = 'none'
        document.getElementById('edit-' + hash).style.display = 'block'
      }

      // ❤️ 保存编辑内容
      function saveEdit(hash) {
        const text = document.getElementById('text-' + hash).value
        vscode.postMessage({ type: 'editSave', hash, text })
      }

      // ❤️ 取消编辑
      function cancelEdit(hash) {
        document.getElementById('view-' + hash).style.display = 'block'
        document.getElementById('edit-' + hash).style.display = 'none'
      }
    </script>
  </body>
  </html>
  `
}


/** HTML 字符串转义 */
function escape(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
