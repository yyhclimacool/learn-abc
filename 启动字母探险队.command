#!/bin/bash
# Finder 双击时自动进入脚本所在目录，兼容带空格和中文的路径。
cd -- "$(dirname -- "$0")" || exit 1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

fail() {
  printf '\n%s\n' "$1"
  printf '按回车键关闭窗口……'
  read -r _answer
  exit 1
}

printf '\n🦊 字母探险队正在准备出发……\n\n'

# 兼容通过 nvm 安装 Node.js 的 Mac；Finder 不会读取交互式 shell 配置。
if ! command -v node >/dev/null 2>&1 && [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
  . "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
fi

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  /usr/bin/open 'https://nodejs.org/' >/dev/null 2>&1 || true
  fail '这台 Mac 还没有 Node.js。请在已打开的官网安装 LTS 版本，安装后再次双击本脚本。'
fi

node -e 'const [major,minor]=process.versions.node.split(".").map(Number);process.exit((major===20&&minor>=19)||(major>=22&&(major!==22||minor>=12))?0:1)' || fail 'Node.js 版本过低。请从 https://nodejs.org/ 安装当前 LTS 版本，再次双击启动。'
[ -f package-lock.json ] && [ -f scripts/launch.mjs ] || fail '项目文件不完整。请拷贝并解压整个项目文件夹，不要只拷贝启动脚本。'

# CPU 架构、Node 主版本或依赖锁文件改变时重新安装，避免复制另一台 Mac 的原生依赖。
fingerprint=$(node --input-type=module -e 'import {readFileSync} from "node:fs";import {createHash} from "node:crypto";console.log(createHash("sha256").update(readFileSync("package-lock.json")).update(process.platform+process.arch+process.versions.node.split(".")[0]).digest("hex"))') || fail '无法读取项目依赖信息。'
installed=''
[ ! -f node_modules/.letter-explorers-install ] || installed=$(cat node_modules/.letter-explorers-install)
if [ "$fingerprint" != "$installed" ] || [ ! -f node_modules/vite/bin/vite.js ]; then
  printf '首次启动或环境已变化，正在安装依赖（需要联网）……\n'
  npm ci --no-fund --no-audit || fail '依赖安装失败。请检查网络，然后重新双击启动脚本。'
  printf '%s' "$fingerprint" > node_modules/.letter-explorers-install || fail '无法写入安装记录，请将项目移到有写入权限的文件夹。'
fi

node scripts/launch.mjs || fail '启动没有完成，请查看上面的提示后重试。'
