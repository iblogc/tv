const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的电视 - 极致搜视</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .page-bg {
            background: #000;
            min-height: 100vh;
            background-image: 
                radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%),
                radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.05) 2%, transparent 0%);
            background-size: 100px 100px;
        }
        .card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(17, 17, 17, 0.8);
            backdrop-filter: blur(10px);
        }
        .card-hover:hover {
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-4px);
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
        }
        .gradient-text {
            background: linear-gradient(to right, #fff, #999);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .settings-panel {
            transform: translateX(100%);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .settings-panel.show {
            transform: translateX(0);
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
        .episodes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 0.75rem;
        }
    </style>
</head>
<body class="page-bg text-white">
    <div class="fixed top-4 right-4 z-50 flex items-center space-x-3">
        <button onclick="toggleSettings(event)" class="bg-[#222]/80 hover:bg-[#333] border border-[#333] rounded-full p-3 transition-all backdrop-blur-md">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
        </button>
    </div>

    <div id="settingsPanel" class="settings-panel fixed right-0 top-0 h-full w-80 bg-[#0a0a0a] border-l border-[#222] p-8 z-40 shadow-2xl">
        <div class="flex justify-between items-center mb-8">
            <h3 class="text-2xl font-bold gradient-text">资源配置</h3>
            <button onclick="toggleSettings()" class="text-gray-500 hover:text-white text-3xl transition-colors">&times;</button>
        </div>
        <div class="space-y-6">
            <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">当前采集站点</label>
                <select id="apiSource" class="w-full bg-[#111] border border-[#333] text-sm text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                    <option value="lzzy">✨ 量子资源 (推荐)</option>
                    <option value="snzy">🎬 索尼资源</option>
                    <option value="heimuer">🍓 黑木耳影视</option>
                    <option value="ffzy">⚡ 非凡影视</option>
                    <option value="wlzy">🐉 卧龙资源</option>
                    <option value="tkyun">☁️ 天空资源</option>
                    <option value="custom">🛠️ 自定义接口</option>
                </select>
            </div>
            
            <div id="customApiInput" class="hidden animate-fade-in">
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">自定义接口地址</label>
                <input type="text" id="customApiUrl" class="w-full bg-[#111] border border-[#333] text-sm text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-all" placeholder="https://.../api.php">
            </div>
            
            <div class="pt-6 border-t border-[#222]">
                <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-500">连接状态</span>
                    <span id="siteStatus" class="flex items-center">
                        <span class="w-2 h-2 rounded-full bg-gray-500 mr-2"></span>
                        <span class="text-gray-400">正在检查...</span>
                    </span>
                </div>
                <p class="mt-4 text-[10px] text-gray-600 leading-relaxed">
                    注：资源来自第三方公开接口，本站仅提供解析展示，不存储任何视频文件。
                </p>
            </div>
        </div>
    </div>

    <div class="container mx-auto px-6 py-12 flex flex-col min-h-screen">
        <div id="mainContent" class="flex-1 flex flex-col justify-center transition-all duration-700">
            <div class="text-center mb-12">
                <h1 class="text-6xl font-black gradient-text tracking-tighter mb-4">MOIVE HUB</h1>
                <p class="text-gray-500 tracking-widest text-sm uppercase">Search & Play Anything</p>
            </div>

            <div class="w-full max-w-3xl mx-auto">
                <div class="relative group">
                    <input type="text" id="searchInput" 
                           class="w-full bg-[#111]/50 border border-[#333] text-white px-8 py-5 rounded-2xl focus:outline-none focus:border-white focus:bg-[#111] transition-all text-lg backdrop-blur-sm group-hover:border-[#555]" 
                           placeholder="输入电影、电视剧、综艺名称...">
                    <button onclick="search()" class="absolute right-3 top-3 px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95">
                        搜索
                    </button>
                </div>
            </div>
        </div>
        
        <div id="resultsArea" class="w-full mt-12 hidden">
            <div id="results" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"></div>
        </div>
    </div>

    <div id="modal" class="fixed inset-0 bg-black/98 hidden flex items-center justify-center z-[100] backdrop-blur-xl">
        <div class="bg-[#0a0a0a] rounded-3xl w-full h-full md:w-11/12 md:h-[90vh] md:max-w-6xl border border-[#222] flex flex-col overflow-hidden shadow-2xl">
            <div class="flex justify-between items-center p-6 border-b border-[#222]">
                <h2 id="modalTitle" class="text-xl font-bold truncate pr-8"></h2>
                <button onclick="closeModal()" class="text-gray-400 hover:text-white text-4xl transition-colors">&times;</button>
            </div>
            <div id="modalContent" class="overflow-y-auto flex-1 p-6"></div>
        </div>
    </div>

    <div id="toast" class="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl transform transition-all duration-300 opacity-0 translate-y-10 z-[200] text-sm font-medium"></div>
    
    <div id="loading" class="fixed inset-0 bg-black/60 hidden items-center justify-center z-[150] backdrop-blur-sm">
        <div class="bg-[#111] px-8 py-6 rounded-2xl border border-[#333] flex flex-col items-center">
            <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-sm text-gray-400">正在处理，请稍候...</p>
        </div>
    </div>

    <script>
        let currentApiSource = localStorage.getItem('currentApiSource') || 'lzzy';
        let customApiUrl = localStorage.getItem('customApiUrl') || '';

        // 初始化
        document.addEventListener('DOMContentLoaded', () => {
            const apiSelect = document.getElementById('apiSource');
            apiSelect.value = currentApiSource;
            if (currentApiSource === 'custom') {
                document.getElementById('customApiInput').classList.remove('hidden');
                document.getElementById('customApiUrl').value = customApiUrl;
            }
            checkStatus();
        });

        function toggleSettings(e) {
            e && e.stopPropagation();
            document.getElementById('settingsPanel').classList.toggle('show');
        }

        async function checkStatus() {
            const statusEl = document.getElementById('siteStatus');
            try {
                const apiParams = currentApiSource === 'custom' ? '&customApi=' + encodeURIComponent(customApiUrl) : '&source=' + currentApiSource;
                const res = await fetch('/api/search?wd=test' + apiParams);
                const data = await res.json();
                statusEl.innerHTML = '<span class="w-2 h-2 rounded-full bg-green-500 mr-2"></span><span class="text-green-500">服务正常</span>';
            } catch (e) {
                statusEl.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-500 mr-2"></span><span class="text-red-500">响应超时</span>';
            }
        }

        document.getElementById('apiSource').addEventListener('change', (e) => {
            currentApiSource = e.target.value;
            localStorage.setItem('currentApiSource', currentApiSource);
            document.getElementById('customApiInput').classList.toggle('hidden', currentApiSource !== 'custom');
            checkStatus();
        });

        document.getElementById('customApiUrl').addEventListener('blur', (e) => {
            customApiUrl = e.target.value;
            localStorage.setItem('customApiUrl', customApiUrl);
            if(currentApiSource === 'custom') checkStatus();
        });

        function showToast(msg, type = 'error') {
            const toast = document.getElementById('toast');
            const colors = { error: 'bg-red-500 text-white', success: 'bg-green-500 text-white', info: 'bg-blue-600 text-white' };
            toast.className = \`fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full shadow-2xl transform transition-all duration-300 z-[200] \${colors[type]}\`;
            toast.textContent = msg;
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(-50%) translateY(40px)';
            }, 3000);
        }

        async function search() {
            const query = document.getElementById('searchInput').value.trim();
            if(!query) return showToast('请输入关键词');
            
            document.getElementById('loading').style.display = 'flex';
            const apiParams = currentApiSource === 'custom' ? '&customApi=' + encodeURIComponent(customApiUrl) : '&source=' + currentApiSource;
            
            try {
                const response = await fetch('/api/search?wd=' + encodeURIComponent(query) + apiParams);
                const data = await response.json();
                
                if (!data.list || data.list.length === 0) {
                    showToast('未找到相关结果');
                } else {
                    document.getElementById('mainContent').classList.replace('flex-col', 'pt-8');
                    document.getElementById('mainContent').classList.remove('justify-center');
                    document.getElementById('resultsArea').classList.remove('hidden');
                    
                    const resultsDiv = document.getElementById('results');
                    resultsDiv.innerHTML = data.list.map(item => \`
                        <div class="card-hover rounded-2xl overflow-hidden cursor-pointer p-5 flex flex-col" onclick="showDetails('\${item.vod_id}','\${item.vod_name}')">
                            <div class="flex-1">
                                <h3 class="text-lg font-bold mb-2 line-clamp-2 hover:text-blue-400">\${item.vod_name}</h3>
                                <div class="flex gap-2 mb-3">
                                    <span class="text-[10px] bg-white/10 px-2 py-1 rounded text-gray-400">\${item.type_name}</span>
                                    <span class="text-[10px] bg-blue-500/20 px-2 py-1 rounded text-blue-400 font-bold">\${item.vod_remarks}</span>
                                </div>
                            </div>
                            <p class="text-gray-500 text-[11px] mt-auto">更新于：\${item.vod_time.split(' ')[0]}</p>
                        </div>
                    \`).join('');
                }
            } catch (error) {
                showToast('搜索请求失败，请尝试切换站点');
            } finally {
                document.getElementById('loading').style.display = 'none';
            }
        }

        async function showDetails(id, name) {
            document.getElementById('loading').style.display = 'flex';
            const apiParams = currentApiSource === 'custom' ? '&customApi=' + encodeURIComponent(customApiUrl) : '&source=' + currentApiSource;
            
            try {
                const response = await fetch('/api/detail?id=' + id + apiParams);
                const data = await response.json();
                
                const modal = document.getElementById('modal');
                const modalTitle = document.getElementById('modalTitle');
                const modalContent = document.getElementById('modalContent');
                
                modalTitle.textContent = name;
                modalContent.innerHTML = \`
                    <div class="episodes-grid" id="epList">
                        \${data.episodes.map((url, index) => \`
                            <button onclick="playVideo('\${url}', '\${name}', \${index + 1})" 
                                    class="px-3 py-4 bg-[#111] hover:bg-white hover:text-black border border-[#222] rounded-xl transition-all text-sm font-medium">
                                第\${index + 1}集
                            </button>
                        \`).join('')}
                    </div>
                \`;
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            } catch (error) {
                showToast('详情加载失败');
            } finally {
                document.getElementById('loading').style.display = 'none';
            }
        }

        function closeModal() {
            document.getElementById('modal').classList.add('hidden');
            document.getElementById('modalContent').innerHTML = '';
            document.body.style.overflow = 'auto';
        }

        function playVideo(url, name, ep) {
            const modalContent = document.getElementById('modalContent');
            const epListHtml = document.getElementById('epList').outerHTML;
            document.getElementById('modalTitle').textContent = \`正在播放：\${name} - 第 \${ep} 集\`;
            
            modalContent.innerHTML = \`
                <div class="flex flex-col h-full">
                    <div class="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl mb-8">
                        <iframe 
                            src="https://hoplayer.com/index.html?url=\${url}&autoplay=true"
                            class="absolute inset-0 w-full h-full border-0"
                            allowfullscreen="true">
                        </iframe>
                    </div>
                    <div class="flex-1">
                        <h4 class="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">剧集列表</h4>
                        \${epListHtml}
                    </div>
                </div>
            \`;
            modalContent.scrollTo({top: 0, behavior: 'smooth'});
        }

        document.getElementById('searchInput').addEventListener('keypress', (e) => e.key === 'Enter' && search());
    </script>
</body>
</html>
`;

// 资源站配置中心
const API_SITES = {
    lzzy: {
        api: 'https://cj.lziapi.com',
        name: '量子资源',
        detail: 'https://lzizy2.com',
    },
    snzy: {
        api: 'https://suoniapi.com',
        name: '索尼资源',
        detail: 'https://www.suonizy.com',
    },
    heimuer: {
        api: 'https://json.heimuer.xyz',
        name: '黑木耳',
        detail: 'https://heimuer.tv',
    },
    ffzy: {
        api: 'http://ffzy5.tv',
        name: '非凡影视',
        detail: 'http://ffzy5.tv',
    },
    wlzy: {
        api: 'https://collect.wolongzyw.com',
        name: '卧龙资源',
        detail: 'https://www.wolongzyw.com',
    },
    tkyun: {
        api: 'https://api.tiankongapi.com',
        name: '天空资源',
        detail: 'https://tiankongzy.com',
    }
};

async function handleRequest(request) {
    const url = new URL(request.url);
    const customApi = url.searchParams.get('customApi') || '';
    const source = url.searchParams.get('source') || 'lzzy';

    // API: 搜索列表
    if (url.pathname === '/api/search') {
        const wd = url.searchParams.get('wd');
        try {
            // 拼接标准的苹果CMS API 搜索地址
            let apiUrl = customApi ? customApi : API_SITES[source].api + '/api.php/provide/vod/?ac=list&wd=' + encodeURIComponent(wd);
            
            const response = await fetch(apiUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 Chrome/122.0.0.0', 'Accept': 'application/json' },
            });
            const data = await response.text();
            return new Response(data, { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        } catch (e) {
            return new Response(JSON.stringify({ code: 400, msg: 'Error', list: [] }));
        }
    }

    // API: 获取播放详情 (核心解析逻辑)
    if (url.pathname === '/api/detail') {
        const id = url.searchParams.get('id');
        // 构造资源站详情页 URL
        const siteDetailBase = customApi ? customApi.split('/api.php')[0] : API_SITES[source].detail;
        const detailPageUrl = `${siteDetailBase}/index.php/vod/detail/id/${id}.html`;
        
        // 使用 Jina AI 将 HTML 转为 Markdown/Text 方便提取链接
        const jinaUrl = `https://r.jina.ai/${detailPageUrl}`;
        
        try {
            const response = await fetch(jinaUrl);
            const content = await response.text();

            // 增强型正则：匹配主流采集站的所有 m3u8 格式
            // 规则 1: $http...m3u8 (标准格式)
            // 规则 2: 直接的 http...m3u8 (部分非凡/量子格式)
            let matches = content.match(/https?:\/\/[^"'\s\n$]+?\.m3u8/g) || [];
            
            // 去重并过滤掉可能的干扰链接
            let episodes = [...new Set(matches)].filter(link => !link.includes('thumb'));

            return new Response(JSON.stringify({ episodes, detailUrl: detailPageUrl }), {
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (e) {
            return new Response(JSON.stringify({ episodes: [], error: e.message }));
        }
    }

    return new Response(HTML_TEMPLATE, { headers: { 'Content-Type': 'text/html' } });
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});
