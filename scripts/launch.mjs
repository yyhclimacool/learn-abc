import { createServer } from 'vite';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.LETTER_EXPLORERS_PORT || 5173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  console.error('启动端口必须是 1024–65535 之间的整数。');
  process.exit(1);
}
const url = `http://127.0.0.1:${port}/`;
function openBrowser() {
  execFile('/usr/bin/open', [url], (error) => {
    if (error) console.log(`请手动在浏览器中打开：${url}`);
  });
}

let response;
try {
  response = await fetch(url, { signal: AbortSignal.timeout(1500) });
} catch {
  // 没有已运行的服务，继续启动；端口占用最终由 strictPort 检查。
}
if (response) {
  let html = '';
  try { html = await response.text(); } catch { /* 无法确认身份时不复用服务。 */ }
  if (response.ok && html.includes('<title>字母探险队 · 小小字母，大大世界</title>')) {
    console.log(`字母探险队已经在运行，为你重新打开：${url}`);
    openBrowser();
  } else {
    console.error(`端口 ${port} 被其他程序占用。请先关闭该程序，再次双击启动。`);
    process.exitCode = 1;
  }
} else {
  let server;
  try {
    server = await createServer({ root, server: { host: '127.0.0.1', port, strictPort: true } });
    await server.listen();
    console.log(`\n字母探险队已启动：${url}`);
    console.log('浏览器会自动打开。学习期间请保留这个终端窗口。');
    console.log('结束时按 Control + C 停止服务；下次继续双击启动即可。\n');
    openBrowser();
    let closing = false;
    const stop = async () => {
      if (closing) return;
      closing = true;
      await server.close();
      process.exit(0);
    };
    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);
    process.on('SIGHUP', stop);
  } catch (error) {
    await server?.close();
    console.error(`无法启动：${error.message}`);
    process.exitCode = 1;
  }
}
