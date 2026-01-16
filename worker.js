const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="zh">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>MOVIE HUB</title>
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .page-bg {
            background: #000; min-height: 100vh;
            background-image: radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.05) 1px, transparent 0%);
            background-size: 40px 40px;
        }
        .card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(20, 20, 20, 0.6); backdrop-filter: blur(12px);
        }
        .card-hover:hover { border-color: rgba(255, 255, 255, 0.4); transform: translateY(-4px); }
        .gradient-text { background: linear-gradient(to right, #fff, #999); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .settings-panel { transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .settings-panel.show { transform: translateX(0); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); } }
        .loading-text { animation: pulse 1.5s ease-in-out infinite; }
        .animate-results { animation: fadeIn 0.5s ease forwards; }
        .history-tag { cursor: pointer; transition: all 0.2s; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
        .line-btn.active { background: white !important; color: black !important; border-color: white !important; }
        .shake { animation: shake 0.4s ease; }
        .ep-btn.playing { background: white !important; color: black !important; border-color: white !important; }
        
        /* Toast 提示样式 */
        .toast {
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-100px);
            background: rgba(20, 20, 20, 0.95); backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white; padding: 12px 24px; border-radius: 12px;
            font-size: 14px; z-index: 1000; opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            max-width: 90%; text-align: center;
        }
        .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
        
        /* 移动端优化 */
        @media (max-width: 768px) {
            .ep-btn { min-height: 44px !important; } /* 增大移动端点击区域 */
            body { padding-bottom: env(safe-area-inset-bottom); } /* 底部安全区 */
        }
    </style>
</head>

<body class="page-bg text-white overflow-x-hidden">
    <!-- 密码验证界面 -->
    <div id="authScreen" class="fixed inset-0 bg-black z-[200] flex items-center justify-center">
        <div class="text-center w-full max-w-sm px-6">
            <div class="mb-8">
                <h1 class="text-5xl font-black gradient-text mb-2">MOVIE HUB</h1>
                <p class="text-gray-500 text-xs uppercase tracking-widest">Access Control</p>
            </div>
            <input type="password" id="passwordInput" placeholder="请输入访问密码" 
                   class="w-full bg-[#111] border border-[#333] text-white px-5 py-4 rounded-xl 
                          focus:outline-none focus:border-white text-center text-lg mb-4 transition-all">
            <button onclick="verifyPassword()" 
                    class="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 active:scale-95 transition-all">
                确认
            </button>
            <p id="authError" class="text-red-400 text-sm mt-4 opacity-0 transition-opacity">密码错误，请重试</p>
        </div>
    </div>
    <div class="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button onclick="toggleSettings(event)" class="bg-[#222]/60 hover:bg-[#333] border border-[#333] rounded-full p-2.5 backdrop-blur-md">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        </button>
    </div>

    <div id="settingsPanel" class="settings-panel fixed right-0 top-0 h-full w-72 bg-[#0a0a0a] border-l border-[#222] p-6 z-[110] shadow-2xl">
        <div class="flex justify-between items-center mb-8">
            <h3 class="text-xl font-bold gradient-text">配置</h3>
            <button onclick="toggleSettings()" class="text-gray-500 text-2xl">&times;</button>
        </div>
        <div class="space-y-6">
            <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">资源站点</label>
                <select id="apiSource" class="w-full bg-[#111] border border-[#333] text-sm text-white px-3 py-2.5 rounded-lg outline-none cursor-pointer">
                    <option value="lzzy">✨ 量子资源</option>
                    <option value="snzy">🎬 索尼资源</option>
                    <option value="heimuer">🍓 黑木耳影视</option>
                    <option value="ffzy">⚡ 非凡影视</option>
                    <option value="wlzy">🐉 卧龙资源</option>
                    <option value="tkyun">☁️ 天空资源</option>
                    <option value="kczy">🚀 快车资源</option>
                    <option value="hnzy">🐂 红牛资源</option>
                    <option value="jszy">🏎️ 极速资源</option>
                    <option value="dbzy">🔔 豆瓣资源</option>
                </select>
                <div class="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span class="text-[10px] text-gray-500 uppercase">当前站点状态</span>
                    <span id="siteStatus" class="flex items-center gap-1.5 text-[10px] font-medium transition-all duration-300">
                        <span class="w-2 h-2 rounded-full bg-gray-500"></span> 正在检测...
                    </span>
                </div>
            </div>
        </div>
    </div>

    <div class="container mx-auto px-4 md:px-6">
        <div id="mainContent" class="min-h-[70vh] flex flex-col justify-center items-center transition-all duration-500">
            <div id="headerText" class="text-center mb-8 transition-all duration-500">
                <h1 class="text-5xl md:text-6xl font-black gradient-text tracking-tighter mb-2">MOVIE HUB</h1>
                <p class="text-gray-500 tracking-[0.3em] text-[10px] uppercase">Smart Search & Play</p>
            </div>

            <div class="w-full max-w-2xl">
                <div class="relative flex items-center mb-6">
                    <input type="text" id="searchInput" 
                           class="w-full bg-[#111]/80 border border-[#333] text-white px-5 md:px-8 py-4 md:py-5 rounded-2xl focus:outline-none focus:border-white transition-all text-base md:text-lg backdrop-blur-md" 
                           placeholder="影片名称...">
                    <button onclick="search()" class="absolute right-2 px-6 md:px-8 py-2.5 md:py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 active:scale-95 transition-all">搜索</button>
                </div>
                <div id="historyContainer" class="flex flex-wrap gap-2 transition-opacity duration-300"></div>
            </div>
        </div>
        
        <div id="resultsArea" class="w-full pb-12 opacity-0 hidden">
            <div id="results" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"></div>
        </div>
    </div>

    <div id="modal" class="fixed inset-0 bg-black hidden z-[100] overflow-y-auto hide-scrollbar">
        <div class="flex flex-col min-h-screen w-full max-w-6xl mx-auto border-x border-[#222]">
            <div class="sticky top-0 bg-black/80 backdrop-blur-xl z-20 flex justify-between items-center p-4 border-b border-[#222]">
                <h2 id="modalTitle" class="text-base md:text-lg font-bold truncate pr-4 text-white/90"></h2>
                <button onclick="closeModal()" class="text-gray-500 hover:text-white text-3xl">&times;</button>
            </div>
            <div id="modalContent" class="p-4 md:p-6"></div>
        </div>
    </div>

    <div id="loading" class="fixed inset-0 bg-black/60 hidden items-center justify-center z-[150] backdrop-blur-sm">
        <div class="flex flex-col items-center gap-4">
            <div class="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            <div id="loadingText" class="loading-text text-sm text-white/80 text-center max-w-xs px-4"></div>
        </div>

    <!-- Toast 提示组件 -->
    <div id="toast" class="toast"></div>
    </div>

    <script>
        const JIE_XI_LIST = [
            { name: '线路2', url: 'https://lziplayer.com/?url='},
            { name: '线路3', url: 'https://m3u8player.co/player.html?url=' },
            { name: '线路4', url: 'https://playhls.com/?url=' },
            { name: '线路5', url: 'https://hoplayer.com/index.html?url=' },
            { name: '线路6', url: 'https://jx.jsonplayer.com/player/?url=' },
            { name: '线路7', url: 'https://jx.m3u8.tv/jiexi/?url=' },
            { name: '线路8', url: 'https://www.ckplayer.vip/jiexi/?url=' },
            { name: '线路9', url: 'https://jx.xmflv.com/?url=' },
        ];

        let currentVideoUrl = '';
        let currentEpName = '';
        let currentSelectedIdx = parseInt(localStorage.getItem('preferred_jiexi_idx') || '0');
        let searchHistory = JSON.parse(localStorage.getItem('movie_search_history') || '[]');
        let currentMovieName = ''; // 当前影片名称
        let currentMovieEpisodes = []; // 当前影片的所有集数数据
        let currentPlayingEpisode = null; // 记录当前播放的集数索引
        
        // ============ 请求缓存系统 ============
        const detailCache = new Map(); // 缓存详情数据
        const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存时间
        
        function getCachedDetail(id, source) {
            const key = \`\${source}_\${id}\`;
            const cached = detailCache.get(key);
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                console.log('使用缓存数据:', key);
                return cached.data;
            }
            return null;
        }
        
        function setCachedDetail(id, source, data) {
            const key = \`\${source}_\${id}\`;
            detailCache.set(key, { data, timestamp: Date.now() });
        }
        // ============ 缓存系统结束 ============

        // ============ 密码验证逻辑 ============
        const PASSWORD_HASH = '518184acefb5f85cb4bfce03ce7d427d1577514fb5e6773fb909e58828b27cfb';

        // 检查是否已通过验证
        function checkAuth() {
            const isAuthed = localStorage.getItem('movie_hub_authed') === 'true';
            const authScreen = document.getElementById('authScreen');
            if (isAuthed) {
                authScreen.style.display = 'none';
            } else {
                authScreen.style.display = 'flex';
            }
        }

        // SHA-256 哈希函数
        async function sha256(message) {
            const msgBuffer = new TextEncoder().encode(message);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }

        // 验证密码
        async function verifyPassword() {
            const input = document.getElementById('passwordInput');
            const errorEl = document.getElementById('authError');
            const hash = await sha256(input.value);
            
            if (hash === PASSWORD_HASH) {
                localStorage.setItem('movie_hub_authed', 'true');
                document.getElementById('authScreen').style.display = 'none';
                errorEl.style.opacity = '0';
            } else {
                // 显示错误提示并震动输入框
                input.classList.add('shake');
                errorEl.style.opacity = '1';
                input.value = '';
                setTimeout(() => input.classList.remove('shake'), 400);
            }
        }

        // 支持 Enter 键提交
        document.addEventListener('DOMContentLoaded', async () => {
            const pwdInput = document.getElementById('passwordInput');
            if (pwdInput) {
                pwdInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') verifyPassword();
                });
            }
            checkAuth(); // 页面加载时检查验证状态
            
            // 调试：在控制台输出正确的密码哈希（生产环境可删除）
            const correctHash = await sha256('我也不知道密码');
            console.log('正确的密码哈希:', correctHash);
        });
        // ============ 密码验证逻辑结束 ============ 

        // ============ Toast 提示系统 ============
        function showToast(message, duration = 3000) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, duration);
        }
        // ============ Toast 系统结束 ============ 

        // 显示加载状态，可选地带有提示文字
        function showLoading(message = '') {
            const loadingEl = document.getElementById('loading');
            const textEl = document.getElementById('loadingText');
            textEl.textContent = message;
            loadingEl.style.display = 'flex';
        }

        // 更新加载提示文字（不改变显示状态）
        function updateLoadingText(message) {
            document.getElementById('loadingText').textContent = message;
        }

        // 隐藏加载状态
        function hideLoading() {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('loadingText').textContent = '';
        }

        function toggleSettings(e) { e && e.stopPropagation(); document.getElementById('settingsPanel').classList.toggle('show'); }

        async function testSiteAvailability() {
            const statusEl = document.getElementById('siteStatus');
            const source = document.getElementById('apiSource').value;
            statusEl.innerHTML = '<span class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span> 检测中...';
            statusEl.className = "flex items-center gap-1.5 text-[10px] font-medium text-yellow-500";
            
            try {
                const response = await fetch('/api/search?wd=test&source=' + source);
                const data = await response.json();
                if (data.code === 400) throw new Error();
                statusEl.innerHTML = '<span class="w-2 h-2 rounded-full bg-green-500"></span> 服务可用';
                statusEl.className = "flex items-center gap-1.5 text-[10px] font-medium text-green-500";
            } catch (error) {
                statusEl.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-500"></span> 连接失败';
                statusEl.className = "flex items-center gap-1.5 text-[10px] font-medium text-red-500";
            }
        }

        function renderHistory() {
            const container = document.getElementById('historyContainer');
            if (searchHistory.length === 0) { container.innerHTML = ''; return; }
            container.innerHTML = searchHistory.map(h => \`
                <span class="history-tag text-[11px] px-3 py-1.5 rounded-lg text-gray-400" onclick="quickSearch('\${h}')">\${h}</span>
            \`).join('') + '<span class="text-[11px] px-3 py-1.5 text-red-500/50 cursor-pointer" onclick="clearHistory()">清空</span>';
        }

        function quickSearch(wd) { document.getElementById('searchInput').value = wd; search(); }
        function clearHistory() { searchHistory = []; localStorage.setItem('movie_search_history', '[]'); renderHistory(); }

        async function search() {
            const query = document.getElementById('searchInput').value.trim();
            if(!query) return;

            if (!searchHistory.includes(query)) {
                searchHistory.unshift(query);
                searchHistory = searchHistory.slice(0, 10);
                localStorage.setItem('movie_search_history', JSON.stringify(searchHistory));
                renderHistory();
            }
            
            showLoading('正在搜索...');
            const source = document.getElementById('apiSource').value;
            
            try {
                const response = await fetch('/api/search?wd=' + encodeURIComponent(query) + '&source=' + source);
                const data = await response.json();
                
                if (data.list && data.list.length > 0) {
                    const main = document.getElementById('mainContent');
                    main.classList.remove('min-h-[70vh]', 'justify-center');
                    main.classList.add('pt-12', 'pb-6');
                    document.getElementById('headerText').classList.add('scale-75', 'mb-2');
                    
                    const resArea = document.getElementById('resultsArea');
                    resArea.classList.remove('hidden');
                    resArea.classList.add('opacity-100', 'animate-results');
                    
                    document.getElementById('results').innerHTML = data.list.map(item => \`
                        <div class="card-hover rounded-xl overflow-hidden cursor-pointer p-4 flex flex-col h-32" onclick="showDetails('\${item.vod_id}','\${item.vod_name}')">
                            <h3 class="text-sm font-bold mb-2 line-clamp-2">\${item.vod_name}</h3>
                            <div class="flex items-center gap-2 mt-auto">
                                <span class="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">\${item.type_name}</span>
                                <span class="text-[10px] text-blue-400 font-medium">\${item.vod_remarks}</span>
                            </div>
                        </div>
                    \`).join('');
                } else {
                    showToast('未找到相关影片，请尝试其他关键词');
                }
            } catch (error) {
                showToast('搜索失败，请稍后重试');
            } finally { hideLoading(); }
        }

        async function showDetails(id, name) {
            const source = document.getElementById('apiSource').value;
            
            // 检查缓存
            const cached = getCachedDetail(id, source);
            if (cached) {
                displayEpisodes(name, cached);
                return;
            }
            
            showLoading('正在获取播放资源...');

            // 如果请求超过 3 秒，更新提示让用户知道可能需要等待
            const slowHint = setTimeout(() => {
                updateLoadingText('资源加载中，请耐心等待...');
            }, 3000);

            // 如果请求超过 8 秒，再次更新提示
            const verySlowHint = setTimeout(() => {
                updateLoadingText('正在努力加载，网络较慢请稍候...');
            }, 8000);

            try {
                const response = await fetch('/api/detail?id=' + id + '&source=' + source);
                const data = await response.json();
                
                if (data.episodes && data.episodes.length > 0) {
                    // 缓存数据
                    setCachedDetail(id, source, data.episodes);
                    displayEpisodes(name, data.episodes);
                } else {
                    showToast('未找到播放资源，请尝试其他资源站点');
                }
            } catch (e) {
                showToast('获取资源失败，请稍后重试或更换资源站点');
            } finally {
                clearTimeout(slowHint);
                clearTimeout(verySlowHint);
                hideLoading();
            }
        }
        
        // 显示集数列表
        function displayEpisodes(name, episodes) {
            currentMovieName = name;
            currentMovieEpisodes = episodes;
            currentPlayingEpisode = null; // 重置播放状态
            
            const episodesHtml = generateEpisodesHtml();
            
            document.getElementById('modalTitle').textContent = name;
            document.getElementById('modalContent').innerHTML = episodesHtml;
            document.getElementById('modal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
        
        // 生成集数按钮 HTML（动态生成以保持高亮状态）
        function generateEpisodesHtml() {
            return \`
                <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    \${currentMovieEpisodes.map((url, index) => {
                        const isPlaying = currentPlayingEpisode === index;
                        return \`
                            <button onclick="playVideo('\${url}', '\${currentMovieName}', \${index + 1}, \${index})" 
                                    class="ep-btn px-2 py-3 bg-[#111] hover:bg-white hover:text-black border border-[#222] rounded-lg transition-all text-xs font-medium \${isPlaying ? 'playing' : ''}">
                                第\${index + 1}集
                            </button>
                        \`;
                    }).join('')}
                </div>
            \`;
        }

        function playVideo(url, name, ep, index) {
            currentVideoUrl = url;
            currentEpName = \`\${name} - 第\${ep}集\`;
            currentPlayingEpisode = index; // 记录当前播放的集数索引
            renderPlayer();
        }

        function renderPlayer() {
            document.getElementById('modalTitle').textContent = currentEpName;
            const playerUrl = JIE_XI_LIST[currentSelectedIdx].url + currentVideoUrl;
            
            const lineBtnsHtml = JIE_XI_LIST.map((line, idx) => \`
                <button onclick="changeLine(\${idx})" 
                        class="line-btn px-4 py-2 text-[11px] rounded-lg border border-[#333] bg-[#111] transition-all \${idx === currentSelectedIdx ? 'active' : 'text-gray-400 hover:border-white'}">
                    \${line.name}
                </button>
            \`).join('');

            document.getElementById('modalContent').innerHTML = \`
                <div class="flex flex-col gap-6">
                    <div class="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-[#222]">
                        <iframe src="\${playerUrl}" class="w-full h-full border-0" allowfullscreen></iframe>
                    </div>
                    
                    <div class="flex flex-col gap-3">
                        <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">切换解析线路</p>
                        <div class="flex flex-wrap gap-2">
                            \${lineBtnsHtml}
                        </div>
                    </div>

                    <div>
                        <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">选集播放</p>
                        <div id="epListPlaceholder">\${generateEpisodesHtml()}</div>
                    </div>
                </div>
            \`;
            document.getElementById('modal').scrollTo({top: 0, behavior: 'smooth'});
        }

        function changeLine(idx) {
            currentSelectedIdx = idx;
            localStorage.setItem('preferred_jiexi_idx', idx);
            renderPlayer();
        }

        function closeModal() {
            document.getElementById('modal').classList.add('hidden');
            document.body.style.overflow = 'auto';
        }

        document.getElementById('searchInput').addEventListener('keypress', (e) => e.key === 'Enter' && search());
        document.getElementById('apiSource').addEventListener('change', testSiteAvailability);
        
        renderHistory();
        testSiteAvailability();
    </script>
</body>
</html>
`;

const API_SITES = {
    lzzy: { api: 'https://cj.lziapi.com', name: '量子资源', detail: 'https://lzizy2.com' },
    snzy: { api: 'https://suoniapi.com', name: '索尼资源', detail: 'https://www.suonizy.com' },
    heimuer: { api: 'https://json.heimuer.xyz', name: '黑木耳', detail: 'https://heimuer.tv' },
    ffzy: { api: 'http://ffzy5.tv', name: '非凡影视', detail: 'http://ffzy5.tv' },
    wlzy: { api: 'https://collect.wolongzyw.com', name: '卧龙资源', detail: 'https://www.wolongzyw.com' },
    tkyun: { api: 'https://api.tiankongapi.com', name: '天空资源', detail: 'https://tiankongzy.com' },
    kczy: { api: 'https://www.kczyapi.com', name: '快车资源', detail: 'https://www.kczyw.com' },
    hnzy: { api: 'https://www.hongniuzy2.com', name: '红牛资源', detail: 'https://www.hongniuzy.com' },
    jszy: { api: 'https://jszyapi.com', name: '极速资源', detail: 'https://jszyw.com' },
    dbzy: { api: 'https://dbzyapi.com', name: '豆瓣资源', detail: 'https://dbzyw.com' }
};

/**
 * 带重试机制的 fetch 请求
 * @param {string} url - 请求 URL
 * @param {Object} options - 配置选项
 * @param {number} options.maxRetries - 最大重试次数，默认 3
 * @param {number} options.timeoutMs - 单次请求超时时间（毫秒），默认 15000
 * @param {number} options.retryDelayMs - 初始重试延迟（毫秒），采用指数退避，默认 1000
 * @returns {Promise<Response>}
 */
async function fetchWithRetry(url, options = {}) {
    const { maxRetries = 3, timeoutMs = 15000, retryDelayMs = 1000 } = options;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            // 使用 AbortController 实现请求超时
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            // 检查 HTTP 状态码，非 2xx 视为失败
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response;
        } catch (error) {
            lastError = error;

            // 如果已达到最大重试次数，则抛出错误
            if (attempt >= maxRetries) {
                throw new Error(`请求失败，已重试 ${maxRetries} 次: ${lastError.message}`);
            }

            // 指数退避延迟：1s -> 2s -> 4s ...
            const delay = retryDelayMs * Math.pow(2, attempt);
            console.log(`[Retry] 第 ${attempt + 1} 次重试，${delay}ms 后重试... 错误: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

async function handleRequest(request) {
    const url = new URL(request.url);
    const source = url.searchParams.get('source') || 'lzzy';

    if (url.pathname === '/api/search') {
        const wd = url.searchParams.get('wd');
        try {
            const apiUrl = `${API_SITES[source].api}/api.php/provide/vod/?ac=list&wd=${encodeURIComponent(wd)}`;
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error();
            return new Response(await res.text(), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        } catch (e) {
            return new Response(JSON.stringify({ code: 400, msg: 'Error', list: [] }), { headers: { 'Content-Type': 'application/json' } });
        }
    }

    if (url.pathname === '/api/detail') {
        const id = url.searchParams.get('id');
        const detailPageUrl = `${API_SITES[source].detail}/index.php/vod/detail/id/${id}.html`;
        try {
            // 带重试机制的 fetch 请求
            const res = await fetchWithRetry(`https://r.jina.ai/${detailPageUrl}`, {
                maxRetries: 3,        // 最大重试次数
                timeoutMs: 15000,     // 单次请求超时 15 秒
                retryDelayMs: 1000,   // 初始重试延迟 1 秒（指数退避）
            });
            const content = await res.text();
            
            // 1. 初始匹配：提取所有可能的 m3u8 链接
            const rawMatches = content.match(/https?:\/\/[^"'\s\(\)\[\]]+?\.m3u8/g) || [];
            
            // // 2. 二次清洗：处理嵌套在跳转链接（如 ?url=...）中的真实地址
            // const cleanMatches = rawMatches.map(link => {
            //     // 如果包含 url=，则取其后的部分
            //     if (link.includes('url=')) {
            //         return link.split('url=')[1];
            //     }
            //     return link;
            // });

            // 3. 去重并过滤干扰项
            const episodes = [...new Set(rawMatches)].filter(link => 
                link.startsWith('http') && !link.includes('thumb') && !link.includes('?url')
            );
            
            return new Response(JSON.stringify({ episodes }), { headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
            return new Response(JSON.stringify({ episodes: [] }), { headers: { 'Content-Type': 'application/json' } });
        }
    }

    return new Response(HTML_TEMPLATE, { headers: { 'Content-Type': 'text/html' } });
}

addEventListener('fetch', event => event.respondWith(handleRequest(event.request)));
