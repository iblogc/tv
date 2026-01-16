const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MOVIE HUB - 极致搜视</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .page-bg {
            background: #000;
            min-height: 100vh;
            background-image: 
                radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.05) 1px, transparent 0%);
            background-size: 40px 40px;
        }
        .card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(20, 20, 20, 0.6);
            backdrop-filter: blur(12px);
        }
        .card-hover:hover {
            border-color: rgba(255, 255, 255, 0.4);
            transform: translateY(-4px);
            background: rgba(30, 30, 30, 0.8);
        }
        .gradient-text {
            background: linear-gradient(to right, #fff, #999);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        /* 布局切换动画 */
        #mainContent {
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .settings-panel {
            transform: translateX(100%);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .settings-panel.show { transform: translateX(0); }
        
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-results { animation: fadeIn 0.5s ease forwards; }
    </style>
</head>
<body class="page-bg text-white">
    <div class="fixed top-4 right-4 z-50">
        <button onclick="toggleSettings(event)" class="bg-[#222]/60 hover:bg-[#333] border border-[#333] rounded-full p-2.5 transition-all backdrop-blur-md">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        </button>
    </div>

    <div id="settingsPanel" class="settings-panel fixed right-0 top-0 h-full w-72 bg-[#0a0a0a] border-l border-[#222] p-6 z-40 shadow-2xl">
        <div class="flex justify-between items-center mb-8">
            <h3 class="text-xl font-bold gradient-text">配置</h3>
            <button onclick="toggleSettings()" class="text-gray-500 hover:text-white text-2xl">&times;</button>
        </div>
        <div class="space-y-6">
            <div>
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">资源站点</label>
                <select id="apiSource" class="w-full bg-[#111] border border-[#333] text-sm text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-white appearance-none cursor-pointer">
                    <option value="lzzy">✨ 量子资源</option>
                    <option value="snzy">🎬 索尼资源</option>
                    <option value="heimuer">🍓 黑木耳影视</option>
                    <option value="ffzy">⚡ 非凡影视</option>
                    <option value="wlzy">🐉 卧龙资源</option>
                    <option value="tkyun">☁️ 天空资源</option>
                    <option value="custom">🛠️ 自定义</option>
                </select>
            </div>
            <div id="customApiInput" class="hidden">
                <label class="block text-[10px] font-bold text-gray-500 uppercase mb-2">自定义接口</label>
                <input type="text" id="customApiUrl" class="w-full bg-[#111] border border-[#333] text-sm text-white px-3 py-2.5 rounded-lg" placeholder="https://...">
            </div>
            <div class="pt-4 border-t border-[#222]">
                <div class="flex items-center justify-between text-[10px]">
                    <span class="text-gray-500">接口状态</span>
                    <span id="siteStatus" class="text-gray-400">检测中...</span>
                </div>
            </div>
        </div>
    </div>

    <div class="container mx-auto px-4 md:px-6">
        <div id="mainContent" class="min-h-[80vh] flex flex-col justify-center items-center">
            <div id="headerText" class="text-center mb-8 transition-all duration-500">
                <h1 class="text-4xl md:text-6xl font-black gradient-text tracking-tighter mb-2">MOIVE HUB</h1>
                <p class="text-gray-500 tracking-[0.3em] text-[10px] md:text-xs uppercase">Search & Play Anything</p>
            </div>

            <div class="w-full max-w-2xl transition-all duration-500">
                <div class="relative flex items-center group">
                    <input type="text" id="searchInput" 
                           class="w-full bg-[#111]/80 border border-[#333] text-white px-5 md:px-8 py-4 md:py-5 rounded-2xl focus:outline-none focus:border-white transition-all text-base md:text-lg backdrop-blur-md" 
                           placeholder="搜搜看...">
                    <button onclick="search()" class="absolute right-2 px-6 md:px-8 py-2.5 md:py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 active:scale-95 transition-all text-sm md:text-base">
                        搜索
                    </button>
                </div>
            </div>
        </div>
        
        <div id="resultsArea" class="w-full pb-12 opacity-0 hidden">
            <div id="results" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"></div>
        </div>
    </div>

    <div id="modal" class="fixed inset-0 bg-black/98 hidden z-[100] backdrop-blur-xl">
        <div class="flex flex-col h-full w-full max-w-6xl mx-auto border-x border-[#222]">
            <div class="flex justify-between items-center p-4 md:p-6 border-b border-[#222]">
                <h2 id="modalTitle" class="text-lg md:text-xl font-bold truncate"></h2>
                <button onclick="closeModal()" class="text-gray-500 hover:text-white text-3xl">&times;</button>
            </div>
            <div id="modalContent" class="overflow-y-auto flex-1 p-4 md:p-6 hide-scrollbar"></div>
        </div>
    </div>

    <div id="toast" class="fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl transform transition-all duration-300 opacity-0 translate-y-10 z-[200] text-xs"></div>
    <div id="loading" class="fixed inset-0 bg-black/60 hidden items-center justify-center z-[150] backdrop-blur-sm">
        <div class="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>

    <script>
        let currentApiSource = localStorage.getItem('currentApiSource') || 'lzzy';
        let customApiUrl = localStorage.getItem('customApiUrl') || '';

        function toggleSettings(e) {
            e && e.stopPropagation();
            document.getElementById('settingsPanel').classList.toggle('show');
        }

        async function checkStatus() {
            const statusEl = document.getElementById('siteStatus');
            try {
                const apiParams = currentApiSource === 'custom' ? '&customApi=' + encodeURIComponent(customApiUrl) : '&source=' + currentApiSource;
                await fetch('/api/search?wd=test' + apiParams);
                statusEl.innerHTML = '<span class="text-green-500">● 在线</span>';
            } catch (e) {
                statusEl.innerHTML = '<span class="text-red-500">● 异常</span>';
            }
        }

        document.getElementById('apiSource').addEventListener('change', (e) => {
            currentApiSource = e.target.value;
            localStorage.setItem('currentApiSource', currentApiSource);
            document.getElementById('customApiInput').classList.toggle('hidden', currentApiSource !== 'custom');
            checkStatus();
        });

        function showToast(msg) {
            const toast = document.getElementById('toast');
            toast.className = "fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-white text-black shadow-2xl transform transition-all duration-300 z-[200] text-xs font-bold";
            toast.textContent = msg;
            toast.style.opacity = '1'; toast.style.transform = 'translateX(-50%) translateY(0)';
            setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(-50%) translateY(40px)'; }, 2500);
        }

        async function search() {
            const query = document.getElementById('searchInput').value.trim();
            if(!query) return;
            
            document.getElementById('loading').style.display = 'flex';
            const apiParams = currentApiSource === 'custom' ? '&customApi=' + encodeURIComponent(customApiUrl) : '&source=' + currentApiSource;
            
            try {
                const response = await fetch('/api/search?wd=' + encodeURIComponent(query) + apiParams);
                const data = await response.json();
                
                if (!data.list || data.list.length === 0) {
                    showToast('未找到资源');
                } else {
                    // 布局变换：核心区域上移
                    const main = document.getElementById('mainContent');
                    main.classList.remove('min-h-[80vh]', 'justify-center');
                    main.classList.add('pt-12', 'md:pt-20', 'pb-8');
                    document.getElementById('headerText').classList.add('scale-75', 'mb-4');
                    
                    const resArea = document.getElementById('resultsArea');
                    resArea.classList.remove('hidden');
                    setTimeout(() => resArea.classList.add('opacity-100', 'animate-results'), 50);
                    
                    document.getElementById('results').innerHTML = data.list.map(item => \`
                        <div class="card-hover rounded-xl overflow-hidden cursor-pointer p-4 md:p-5 flex flex-col h-full" onclick="showDetails('\${item.vod_id}','\${item.vod_name}')">
                            <h3 class="text-sm md:text-base font-bold mb-2 line-clamp-1">\${item.vod_name}</h3>
                            <div class="flex items-center gap-2 mt-auto">
                                <span class="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">\${item.type_name}</span>
                                <span class="text-[9px] text-blue-400 font-medium">\${item.vod_remarks}</span>
                            </div>
                        </div>
                    \`).join('');
                }
            } catch (error) {
                showToast('请求失败');
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
                document.getElementById('modalTitle').textContent = name;
                document.getElementById('modalContent').innerHTML = \`
                    <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3" id="epList">
                        \${data.episodes.map((url, index) => \`
                            <button onclick="playVideo('\${url}', '\${name}', \${index + 1})" 
                                    class="px-2 py-3 bg-[#111] hover:bg-white hover:text-black border border-[#222] rounded-lg transition-all text-xs">
                                第\${index + 1}集
                            </button>
                        \`).join('')}
                    </div>
                \`;
                document.getElementById('modal').classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            } catch (e) { showToast('加载失败'); }
            finally { document.getElementById('loading').style.display = 'none'; }
        }

        function playVideo(url, name, ep) {
            const modalContent = document.getElementById('modalContent');
            const epListHtml = document.getElementById('epList').outerHTML;
            document.getElementById('modalTitle').textContent = \`\${name} - 第\${ep}集\`;
            modalContent.innerHTML = \`
                <div class="flex flex-col gap-6">
                    <div class="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                        <iframe src="https://hoplayer.com/index.html?url=\${url}&autoplay=true" class="w-full h-full border-0" allowfullscreen></iframe>
                    </div>
                    <div>
                        <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">选集</p>
                        \${epListHtml}
                    </div>
                </div>
            \`;
            modalContent.scrollTo({top: 0, behavior: 'smooth'});
        }

        function closeModal() {
            document.getElementById('modal').classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
        document.getElementById('searchInput').addEventListener('keypress', (e) => e.key === 'Enter' && search());
        checkStatus();
    </script>
</body>
</html>
`;

// 资源站配置
const API_SITES = {
    lzzy: { api: 'https://cj.lziapi.com', name: '量子资源', detail: 'https://lzizy2.com' },
    snzy: { api: 'https://suoniapi.com', name: '索尼资源', detail: 'https://www.suonizy.com' },
    heimuer: { api: 'https://json.heimuer.xyz', name: '黑木耳', detail: 'https://heimuer.tv' },
    ffzy: { api: 'http://ffzy5.tv', name: '非凡影视', detail: 'http://ffzy5.tv' },
    wlzy: { api: 'https://collect.wolongzyw.com', name: '卧龙资源', detail: 'https://www.wolongzyw.com' },
    tkyun: { api: 'https://api.tiankongapi.com', name: '天空资源', detail: 'https://tiankongzy.com' }
};

async function handleRequest(request) {
    const url = new URL(request.url);
    const source = url.searchParams.get('source') || 'lzzy';
    const customApi = url.searchParams.get('customApi') || '';

    if (url.pathname === '/api/search') {
        const wd = url.searchParams.get('wd');
        const apiUrl = customApi ? customApi : API_SITES[source].api + '/api.php/provide/vod/?ac=list&wd=' + encodeURIComponent(wd);
        const res = await fetch(apiUrl);
        return new Response(await res.text(), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }

    if (url.pathname === '/api/detail') {
        const id = url.searchParams.get('id');
        const siteDetailBase = customApi ? customApi.split('/api.php')[0] : API_SITES[source].detail;
        const detailPageUrl = `${siteDetailBase}/index.php/vod/detail/id/${id}.html`;
        const res = await fetch(`https://r.jina.ai/${detailPageUrl}`);
        const content = await res.text();
        const matches = content.match(/https?:\/\/[^"'\s\n$]+?\.m3u8/g) || [];
        const episodes = [...new Set(matches)].filter(link => !link.includes('thumb'));
        return new Response(JSON.stringify({ episodes }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(HTML_TEMPLATE, { headers: { 'Content-Type': 'text/html' } });
}

addEventListener('fetch', event => event.respondWith(handleRequest(event.request)));
