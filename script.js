/**
 * AESTHETIC DASHBOARD — script.js
 */

// ─── LOADING SCREEN ───────────────────────────────────────
window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('loader').classList.add('hidden'), 1800);
});

// ─── WELCOME (new users only) ─────────────────────────────
(function () {
    if (localStorage.getItem('dashboard-welcomed')) return;
    const overlay = document.getElementById('welcome-overlay');
    const btn     = document.getElementById('welcome-done');
    if (!overlay || !btn) return;
    setTimeout(() => overlay.classList.add('active'), 2000);
    btn.addEventListener('click', () => {
        overlay.classList.remove('active');
        localStorage.setItem('dashboard-welcomed', 'true');
    });
})();

// ─── CONFIG ──────────────────────────────────────────────
const WEATHER_API_KEY     = 'b0677d9c940a9b4a0ff25a852a0c18b1';
const UNSPLASH_ACCESS_KEY = 'Pqb15MQf3mjxbeFMts0tYSc3W5La6qoS3uKETKr4m-A';

// ─── DOM ─────────────────────────────────────────────────
const clockEl     = document.getElementById('clock');
const dateEl      = document.getElementById('date');
const greetingEl  = document.getElementById('greeting');
const searchInput = document.getElementById('google-search');
const themeBtn    = document.getElementById('theme-toggle');
const notesArea   = document.getElementById('quick-notes');
const todoInput   = document.getElementById('todo-input');
const todoList    = document.getElementById('todo-list');
const addTodoBtn  = document.getElementById('add-todo');

// ─── HELPERS ─────────────────────────────────────────────
function lsGet(key, fallback) {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    try { return JSON.parse(v); } catch { return v; }
}
function lsSet(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function showToast(msg, icon = 'fa-circle-check') {
    let t = document.getElementById('perf-toast');
    if (!t) { t = document.createElement('div'); t.id = 'perf-toast'; t.className = 'perf-toast'; document.body.appendChild(t); }
    t.innerHTML = `<i class="fas ${icon}"></i> ${msg}`;
    t.classList.add('show');
    clearTimeout(t._tmr);
    t._tmr = setTimeout(() => t.classList.remove('show'), 2800);
}

// ─── CLOCK ────────────────────────────────────────────────
function getGreeting() {
    const h = new Date().getHours();
    if (h >= 5  && h < 12) return 'Good morning';
    if (h >= 12 && h < 17) return 'Good afternoon';
    if (h >= 17 && h < 21) return 'Good evening';
    return 'Good night';
}

function updateClock() {
    const now     = new Date();
    const use12   = lsGet('setting-12hr', false);
    const showSec = lsGet('setting-seconds', false);
    clockEl.textContent = now.toLocaleTimeString('en-US', {
        hour12: use12, hour: '2-digit', minute: '2-digit',
        ...(showSec ? { second: '2-digit' } : {})
    });
    dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    if (greetingEl) greetingEl.textContent = getGreeting();
}
window._clockInterval = setInterval(updateClock, 1000);
updateClock();

// ─── THEME ────────────────────────────────────────────────
const savedTheme = lsGet('dashboard-theme', 'dark');
document.body.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);
themeBtn.addEventListener('click', () => {
    const t = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', t);
    lsSet('dashboard-theme', t);
    updateThemeIcon(t);
});
function updateThemeIcon(t) { themeBtn.querySelector('i').className = t === 'dark' ? 'fas fa-moon' : 'fas fa-sun'; }

// ─── SEARCH ───────────────────────────────────────────────
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
        const engine = lsGet('setting-engine', 'https://www.google.com/search?q=');
        window.location.href = engine + encodeURIComponent(searchInput.value.trim());
    }
});

// ─── VOICE SEARCH ─────────────────────────────────────────
(function () {
    const voiceBtn = document.getElementById('voice-search-btn');
    if (!voiceBtn) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        voiceBtn.title = 'Voice search not supported in this browser';
        voiceBtn.style.opacity = '0.4';
        voiceBtn.style.cursor = 'not-allowed';
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let listening = false;

    voiceBtn.addEventListener('click', () => {
        if (listening) { recognition.stop(); return; }
        recognition.start();
    });

    recognition.addEventListener('start', () => {
        listening = true;
        voiceBtn.classList.add('listening');
        voiceBtn.title = 'Listening... click to stop';
        searchInput.placeholder = 'Listening...';
    });

    recognition.addEventListener('result', (e) => {
        const transcript = e.results[0][0].transcript;
        searchInput.value = transcript;
        // Auto search after voice input
        const engine = lsGet('setting-engine', 'https://www.google.com/search?q=');
        window.location.href = engine + encodeURIComponent(transcript);
    });

    recognition.addEventListener('end', () => {
        listening = false;
        voiceBtn.classList.remove('listening');
        voiceBtn.title = 'Voice search';
        searchInput.placeholder = 'Search the web...';
    });

    recognition.addEventListener('error', (e) => {
        listening = false;
        voiceBtn.classList.remove('listening');
        searchInput.placeholder = 'Search the web...';
        if (e.error !== 'aborted') showToast('Voice search failed: ' + e.error, 'fa-microphone-slash');
    });
})();

// ─── GOOGLE LENS ──────────────────────────────────────────
(function () {
    const lensBtn = document.getElementById('lens-search-btn');
    if (!lensBtn) return;

    lensBtn.addEventListener('click', () => {
        window.open('https://lens.google.com', '_blank');
    });
})();

// ─── NOTES ────────────────────────────────────────────────
notesArea.value = lsGet('dashboard-notes', '');
notesArea.addEventListener('input', () => lsSet('dashboard-notes', notesArea.value));

// ─── TASKS ────────────────────────────────────────────────
let tasks = JSON.parse(localStorage.getItem('dashboard-tasks') || '[]');

function renderTasks() {
    todoList.innerHTML = '';
    tasks.forEach((task, i) => {
        const li   = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = task;
        const btn = document.createElement('button');
        btn.className = 'delete-btn';
        btn.setAttribute('aria-label', 'Delete task');
        btn.innerHTML = '<i class="fas fa-trash"></i>';
        btn.addEventListener('click', () => { tasks.splice(i, 1); renderTasks(); });
        li.appendChild(span);
        li.appendChild(btn);
        todoList.appendChild(li);
    });
    localStorage.setItem('dashboard-tasks', JSON.stringify(tasks));
}

function addTask() {
    const text = todoInput.value.trim();
    if (!text) return;
    tasks.push(text);
    todoInput.value = '';
    renderTasks();
}

addTodoBtn.addEventListener('click', addTask);
todoInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
renderTasks();

// ─── WEATHER ──────────────────────────────────────────────
const WEATHER_DESC = {
    'clear sky':'Sunny','few clouds':'Mostly Sunny','scattered clouds':'Partly Cloudy',
    'broken clouds':'Mostly Cloudy','overcast clouds':'Cloudy','light rain':'Light Rain',
    'moderate rain':'Rain','heavy intensity rain':'Heavy Rain','light snow':'Light Snow',
    'snow':'Snow','mist':'Misty','smoke':'Smoky','haze':'Hazy','fog':'Foggy',
    'thunderstorm':'Thunderstorm','drizzle':'Drizzle','dust':'Dusty','sand':'Sandy',
    'shower rain':'Showers','light intensity shower rain':'Light Showers',
    'thunderstorm with rain':'Thunderstorm','thunderstorm with heavy rain':'Heavy Thunderstorm',
    'freezing rain':'Freezing Rain','sleet':'Sleet','tornado':'Tornado','squalls':'Windy',
};

async function fetchWeatherByCity(city) {
    const tempEl = document.querySelector('.temp');
    const descEl = document.querySelector('.desc');
    if (!tempEl || !descEl) return;
    descEl.textContent = 'Searching...';
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${WEATHER_API_KEY}`);
        if (res.status === 404) throw new Error('City not found');
        if (!res.ok) throw new Error('Weather unavailable');
        const d = await res.json();
        const raw = d.weather[0].description;
        const desc = WEATHER_DESC[raw.toLowerCase()] || (raw.charAt(0).toUpperCase() + raw.slice(1));
        tempEl.textContent = `${Math.round(d.main.temp)}°C`;
        descEl.textContent = `${d.name}, ${d.sys.country} · ${desc}`;
        lsSet('dashboard-city', city);
    } catch (err) {
        tempEl.textContent = '--°C';
        descEl.textContent = err.message;
    }
}

(function initWeather() {
    const cityInput = document.getElementById('city-input');
    const cityBtn   = document.getElementById('city-search-btn');
    const saved     = lsGet('dashboard-city', null);
    if (saved) { cityInput.value = saved; fetchWeatherByCity(saved); }
    else { document.querySelector('.desc').textContent = 'Enter your city above ↑'; }
    cityBtn.addEventListener('click', () => { const c = cityInput.value.trim(); if (c) fetchWeatherByCity(c); });
    cityInput.addEventListener('keydown', e => { if (e.key === 'Enter') { const c = cityInput.value.trim(); if (c) fetchWeatherByCity(c); } });
})();
setInterval(() => { const c = lsGet('dashboard-city', null); if (c) fetchWeatherByCity(c); }, 600000);

// ─── CALENDAR ─────────────────────────────────────────────
(function () {
    const calEl     = document.getElementById('floating-calendar');
    const panel     = document.getElementById('floating-calendar-panel');
    const calBtn    = document.getElementById('calendar-btn');
    if (!calEl || !panel || !calBtn) return;

    let current  = new Date();
    let selected = lsGet('dashboard-selected-date', null) ? new Date(lsGet('dashboard-selected-date', null)) : null;
    const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    function same(a, b) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

    function render(date) {
        const y = date.getFullYear(), m = date.getMonth();
        const name = date.toLocaleString('en-US', { month: 'long' });
        const first = new Date(y, m, 1).getDay();
        const total = new Date(y, m + 1, 0).getDate();
        let h = `<div class="calendar-header"><button id="cal-prev" class="cal-nav">&lt;</button><div class="cal-title">${name} ${y}</div><button id="cal-next" class="cal-nav">&gt;</button></div><div class="calendar-grid">`;
        days.forEach(d => h += `<div class="day-name">${d}</div>`);
        for (let i = 0; i < first; i++) h += `<div class="day empty"></div>`;
        for (let d = 1; d <= total; d++) {
            const cell = new Date(y, m, d);
            let cls = 'day';
            if (same(cell, new Date())) cls += ' today';
            if (selected && same(cell, selected)) cls += ' selected';
            h += `<div class="${cls}" data-day="${d}">${d}</div>`;
        }
        h += '</div>';
        calEl.innerHTML = h;
        calEl.querySelector('#cal-prev').addEventListener('click', () => { current = new Date(current.getFullYear(), current.getMonth()-1, 1); render(current); });
        calEl.querySelector('#cal-next').addEventListener('click', () => { current = new Date(current.getFullYear(), current.getMonth()+1, 1); render(current); });
        calEl.querySelectorAll('.day:not(.empty)').forEach(el => {
            el.addEventListener('click', () => {
                selected = new Date(current.getFullYear(), current.getMonth(), parseInt(el.dataset.day));
                lsSet('dashboard-selected-date', selected.toISOString());
                render(current);
            });
        });
    }

    render(current);

    // Click button to toggle
    calBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = panel.classList.contains('visible');
        if (!isOpen) {
            // Position below the calendar button dynamically
            const rect = calBtn.getBoundingClientRect();
            panel.style.top  = (rect.bottom + 8) + 'px';
            panel.style.left = rect.left + 'px';
        }
        const open = panel.classList.toggle('visible');
        calBtn.classList.toggle('cal-active', open);
    });

    // Clicks inside panel stay open
    panel.addEventListener('click', e => e.stopPropagation());

    // Click outside to close
    document.addEventListener('click', () => {
        panel.classList.remove('visible');
        calBtn.classList.remove('cal-active');
    });
})();

// ─── OPTIMIZATION MODE (3 levels) ────────────────────────
(function () {
    const perfBtn  = document.getElementById('perf-toggle');
    const dropdown = document.getElementById('perf-dropdown');
    if (!perfBtn || !dropdown) return;

    const LEVELS = {
        min:    { toast: 'Minimum optimization ✨', icon: 'fa-gauge-simple-high' },
        medium: { toast: 'Medium optimization ⚡',  icon: 'fa-gauge' },
        high:   { toast: 'Maximum optimization 🚀', icon: 'fa-gauge-simple' },
    };

    function applyLevel(level) {
        document.body.classList.remove('perf-min', 'perf-medium', 'perf-high');
        perfBtn.classList.remove('level-min', 'level-medium', 'level-high');
        if (level) {
            document.body.classList.add('perf-' + level);
            perfBtn.classList.add('level-' + level);
        }
        // Update checkmarks
        dropdown.querySelectorAll('.perf-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.level === level);
        });
        lsSet('dashboard-opt-level', level || '');
    }

    // Restore saved level
    const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const saved = lsGet('dashboard-opt-level', null) || (isMobile ? 'medium' : null);
    if (saved) applyLevel(saved);

    // Position dropdown under the perf button
    function positionDropdown() {
        const rect = perfBtn.getBoundingClientRect();
        dropdown.style.top   = (rect.bottom + 8) + 'px';
        dropdown.style.right = (window.innerWidth - rect.right) + 'px';
        dropdown.style.left  = 'auto';
    }

    // Toggle dropdown
    perfBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('open');
        if (!isOpen) positionDropdown();
        dropdown.classList.toggle('open');
    });

    // Option selection — use mousedown so it fires before blur/click-outside
    dropdown.querySelectorAll('.perf-option').forEach(opt => {
        opt.addEventListener('mousedown', (e) => {
            e.preventDefault(); // prevent dropdown from closing via blur
            e.stopPropagation();
            const level = opt.dataset.level;
            applyLevel(level);
            dropdown.classList.remove('open');
            showToast(LEVELS[level].toast, LEVELS[level].icon);
        });
        // Touch support
        opt.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const level = opt.dataset.level;
            applyLevel(level);
            dropdown.classList.remove('open');
            showToast(LEVELS[level].toast, LEVELS[level].icon);
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!perfBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
})();

// ─── WALLPAPER ────────────────────────────────────────────
(function () {
    const overlay      = document.getElementById('wallpaper-overlay');
    const modal        = document.getElementById('wallpaper-modal');
    const openBtn      = document.getElementById('wallpaper-btn');
    const closeBtn     = document.getElementById('wallpaper-close');
    const tabs         = document.querySelectorAll('.wp-tab');
    const panels       = document.querySelectorAll('.wp-panel');
    const gradientGrid = document.getElementById('gradient-grid');
    const clearBtn     = document.getElementById('clear-wallpaper');
    const uQuery       = document.getElementById('unsplash-query');
    const uBtn         = document.getElementById('unsplash-search-btn');
    const uGrid        = document.getElementById('unsplash-grid');

    const GRADIENTS = [
        { label:'Midnight',  value:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' },
        { label:'Aurora',    value:'linear-gradient(135deg,#0b3d2e,#1a6b4a,#0d2137)' },
        { label:'Dusk',      value:'linear-gradient(135deg,#2d1b69,#c0392b,#f39c12)' },
        { label:'Ocean',     value:'linear-gradient(135deg,#0f2027,#203a43,#2c5364)' },
        { label:'Rose Gold', value:'linear-gradient(135deg,#f7971e,#ffd200,#c94b4b)' },
        { label:'Nebula',    value:'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460,#e94560)' },
        { label:'Forest',    value:'linear-gradient(135deg,#134e5e,#71b280)' },
        { label:'Candy',     value:'linear-gradient(135deg,#f953c6,#b91d73)' },
        { label:'Steel',     value:'linear-gradient(135deg,#1c1c2e,#2c3e50,#4ca1af)' },
        { label:'Lava',      value:'linear-gradient(135deg,#200122,#6f0000)' },
        { label:'Citrus',    value:'linear-gradient(135deg,#f7971e,#ffd200)' },
        { label:'Arctic',    value:'linear-gradient(135deg,#4facfe,#00f2fe)' },
    ];

    GRADIENTS.forEach(({ label, value }) => {
        const s = document.createElement('button');
        s.className = 'gradient-swatch'; s.title = label;
        s.style.background = value;
        s.innerHTML = `<span class="swatch-label">${label}</span>`;
        s.addEventListener('click', () => { applyWallpaper({ type:'gradient', value }); closeModal(); });
        gradientGrid.appendChild(s);
    });

    function applyWallpaper(wp) {
        if (wp.type === 'gradient') { overlay.style.background = wp.value; }
        else { overlay.style.background = `url('${wp.value}') center/cover no-repeat`; }
        document.body.classList.add('has-wallpaper');
        lsSet('dashboard-wallpaper', wp);
    }

    function clearWallpaper() {
        overlay.style.background = '';
        document.body.classList.remove('has-wallpaper');
        localStorage.removeItem('dashboard-wallpaper');
    }

    const saved = lsGet('dashboard-wallpaper', null);
    if (saved) { try { applyWallpaper(saved); } catch(_) {} }

    function openModal()  { modal.classList.add('open'); }
    function closeModal() { modal.classList.remove('open'); }

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    clearBtn.addEventListener('click', () => { clearWallpaper(); closeModal(); });
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.add('hidden'));
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab).classList.remove('hidden');
        });
    });

    async function searchPhotos(q) {
        uGrid.innerHTML = '<p class="wp-hint">Loading...</p>';
        try {
            const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=12&orientation=landscape`, { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } });
            if (!res.ok) throw new Error('Search failed');
            const data = await res.json();
            if (!data.results.length) { uGrid.innerHTML = '<p class="wp-hint">No photos found.</p>'; return; }
            uGrid.innerHTML = '';
            data.results.forEach(p => {
                const btn = document.createElement('button');
                btn.className = 'unsplash-thumb'; btn.title = `Photo by ${p.user.name}`;
                btn.style.backgroundImage = `url('${p.urls.small}')`;
                btn.addEventListener('click', () => { applyWallpaper({ type:'photo', value: p.urls.full }); closeModal(); });
                uGrid.appendChild(btn);
            });
        } catch(err) { uGrid.innerHTML = `<p class="wp-hint">Error: ${err.message}</p>`; }
    }

    uBtn.addEventListener('click', () => { const q = uQuery.value.trim(); if (q) searchPhotos(q); });
    uQuery.addEventListener('keydown', e => { if (e.key === 'Enter') { const q = uQuery.value.trim(); if (q) searchPhotos(q); } });

    let photosLoaded = false;
    document.querySelector('[data-tab="unsplash"]').addEventListener('click', () => {
        if (!photosLoaded) { photosLoaded = true; uQuery.value = 'nature landscape'; searchPhotos('nature landscape'); }
    });
})();

// ─── SHORTCUTS ────────────────────────────────────────────
(function () {
    const list        = document.getElementById('shortcuts-list');
    const addBtn      = document.getElementById('add-shortcut-btn');
    const modal       = document.getElementById('shortcut-modal');
    const closeBtn    = document.getElementById('shortcut-close');
    const titleEl     = document.getElementById('shortcut-modal-title');
    const nameInput   = document.getElementById('shortcut-name');
    const urlInput    = document.getElementById('shortcut-url');
    const saveBtn     = document.getElementById('shortcut-save-btn');
    const deleteBtn   = document.getElementById('shortcut-delete-btn');
    const iconPreview = document.getElementById('shortcut-icon-preview');
    const iconOptions = document.getElementById('shortcut-icon-options');

    const ICONS = ['fa-globe','fa-youtube','fa-github','fa-twitter','fa-instagram','fa-linkedin','fa-reddit','fa-facebook','fa-twitch','fa-discord','fa-spotify','fa-whatsapp','fa-telegram-plane','fa-slack','fa-figma','fa-code','fa-terminal','fa-database','fa-envelope','fa-bookmark','fa-shopping-cart','fa-newspaper','fa-film','fa-music','fa-gamepad','fa-graduation-cap','fa-briefcase','fa-chart-line','fa-cloud','fa-star'];
    const BRANDS = new Set(['fa-youtube','fa-github','fa-twitter','fa-instagram','fa-linkedin','fa-reddit','fa-facebook','fa-twitch','fa-discord','fa-spotify','fa-whatsapp','fa-telegram-plane','fa-slack','fa-figma']);
    const ic = i => (BRANDS.has(i) ? 'fab ' : 'fas ') + i;

    ICONS.forEach(i => {
        const b = document.createElement('button');
        b.className = 'icon-opt'; b.dataset.icon = i;
        b.innerHTML = `<i class="${ic(i)}"></i>`;
        b.addEventListener('click', () => selectIcon(i));
        iconOptions.appendChild(b);
    });

    let selIcon = 'fa-globe';
    function selectIcon(i) {
        selIcon = i;
        iconPreview.innerHTML = `<i class="${ic(i)}"></i>`;
        iconOptions.querySelectorAll('.icon-opt').forEach(b => b.classList.toggle('active', b.dataset.icon === i));
    }
    selectIcon('fa-globe');

    let shortcuts = JSON.parse(localStorage.getItem('dashboard-shortcuts') || '[]');
    function save() { localStorage.setItem('dashboard-shortcuts', JSON.stringify(shortcuts)); }

    function render() {
        list.innerHTML = '';
        shortcuts.forEach((sc, idx) => {
            const a = document.createElement('a');
            a.className = 'shortcut-chip'; a.href = sc.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.title = sc.name;
            a.innerHTML = `<span class="sc-icon"><i class="${ic(sc.icon)}"></i></span><span class="sc-label">${escHtml(sc.name)}</span><button class="sc-edit-btn" title="Edit" aria-label="Edit shortcut"><i class="fas fa-pen"></i></button>`;
            a.querySelector('.sc-edit-btn').addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openEdit(idx); });
            list.appendChild(a);
        });
    }

    let editIdx = null;
    function openAdd()  { editIdx = null; titleEl.textContent = 'Add Shortcut'; nameInput.value = ''; urlInput.value = ''; selectIcon('fa-globe'); deleteBtn.classList.add('hidden'); modal.classList.add('open'); setTimeout(() => nameInput.focus(), 80); }
    function openEdit(i) { editIdx = i; const sc = shortcuts[i]; titleEl.textContent = 'Edit Shortcut'; nameInput.value = sc.name; urlInput.value = sc.url; selectIcon(sc.icon||'fa-globe'); deleteBtn.classList.remove('hidden'); modal.classList.add('open'); setTimeout(() => nameInput.focus(), 80); }

    function handleSave() {
        const name = nameInput.value.trim(); let url = urlInput.value.trim();
        if (!name || !url) return;
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        if (editIdx !== null) shortcuts[editIdx] = { name, url, icon: selIcon };
        else shortcuts.push({ name, url, icon: selIcon });
        save(); render(); modal.classList.remove('open');
    }

    addBtn.addEventListener('click', openAdd);
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    saveBtn.addEventListener('click', handleSave);
    deleteBtn.addEventListener('click', () => { if (editIdx === null) return; shortcuts.splice(editIdx, 1); save(); render(); modal.classList.remove('open'); });
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.remove('open'); });
    render();
})();

// ─── SETTINGS ─────────────────────────────────────────────
(function () {
    const modal    = document.getElementById('settings-modal');
    const openBtn  = document.getElementById('settings-btn');
    const closeBtn = document.getElementById('settings-close');

    openBtn.addEventListener('click', () => modal.classList.add('open'));
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.remove('open'); });

    // Clock settings
    const el12hr = document.getElementById('setting-12hr');
    const elSec  = document.getElementById('setting-seconds');
    el12hr.checked = lsGet('setting-12hr', false);
    elSec.checked  = lsGet('setting-seconds', false);
    el12hr.addEventListener('change', () => lsSet('setting-12hr', el12hr.checked));
    elSec.addEventListener('change',  () => lsSet('setting-seconds', elSec.checked));

    // Search engine
    const engineBtns = document.querySelectorAll('.engine-btn');
    const curEngine  = lsGet('setting-engine', 'https://www.google.com/search?q=');
    engineBtns.forEach(b => {
        b.classList.toggle('active', b.dataset.url === curEngine);
        b.addEventListener('click', () => {
            lsSet('setting-engine', b.dataset.url);
            engineBtns.forEach(x => x.classList.toggle('active', x === b));
        });
    });

    // Widget visibility
    const WMAP = { 'setting-weather':'.widget:nth-child(1)', 'setting-notes':'.widget:nth-child(2)', 'setting-tasks':'.widget:nth-child(3)', 'setting-spotify':'.widget:nth-child(4)' };
    Object.keys(WMAP).forEach(id => {
        const toggle = document.getElementById(id);
        const shown  = lsGet(id, true);
        toggle.checked = shown;
        const el = document.querySelector(WMAP[id]);
        if (el) el.style.display = shown ? '' : 'none';
        toggle.addEventListener('change', () => {
            lsSet(id, toggle.checked);
            const el2 = document.querySelector(WMAP[id]);
            if (el2) el2.style.display = toggle.checked ? '' : 'none';
        });
    });

    // Glass sliders
    const blurS = document.getElementById('setting-blur');
    const opS   = document.getElementById('setting-opacity');
    const borS  = document.getElementById('setting-border');
    const blurV = document.getElementById('blur-val');
    const opV   = document.getElementById('opacity-val');
    const borV  = document.getElementById('border-val');
    const prev  = document.getElementById('glass-preview-card');

    function applyGlass(b, o, br) {
        document.documentElement.style.setProperty('--glass-blur',   b + 'px');
        document.documentElement.style.setProperty('--glass-bg',     `rgba(255,255,255,${(o/100).toFixed(2)})`);
        document.documentElement.style.setProperty('--glass-border', `rgba(255,255,255,${(br/100).toFixed(2)})`);
        if (prev) {
            prev.style.backdropFilter = `blur(${b}px)`;
            prev.style.webkitBackdropFilter = `blur(${b}px)`;
            prev.style.background  = `rgba(255,255,255,${(o/100).toFixed(2)})`;
            prev.style.borderColor = `rgba(255,255,255,${(br/100).toFixed(2)})`;
        }
        blurV.textContent = b + 'px'; opV.textContent = o + '%'; borV.textContent = br + '%';
        lsSet('setting-blur', b); lsSet('setting-opacity', o); lsSet('setting-border', br);
    }

    blurS.value = lsGet('setting-blur', 12); opS.value = lsGet('setting-opacity', 5); borS.value = lsGet('setting-border', 8);
    applyGlass(+blurS.value, +opS.value, +borS.value);
    [blurS, opS, borS].forEach(s => s.addEventListener('input', () => applyGlass(+blurS.value, +opS.value, +borS.value)));

    // Font
    const fontBtns = document.querySelectorAll('.font-btn');
    function applyFont(f) {
        document.documentElement.style.setProperty('--font-main', `'${f}', sans-serif`);
        lsSet('setting-font', f);
        fontBtns.forEach(b => b.classList.toggle('active-font', b.dataset.font === f));
    }
    applyFont(lsGet('setting-font', 'Inter'));
    fontBtns.forEach(b => b.addEventListener('click', () => applyFont(b.dataset.font)));

    // Accent
    const swatches = document.querySelectorAll('.accent-swatch');
    const customEl = document.getElementById('accent-custom');
    function shadeColor(hex, p) {
        let r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
        return '#'+[Math.min(255,Math.max(0,r+p)),Math.min(255,Math.max(0,g+p)),Math.min(255,Math.max(0,b+p))].map(v=>v.toString(16).padStart(2,'0')).join('');
    }
    function applyAccent(c) {
        document.documentElement.style.setProperty('--accent', c);
        document.documentElement.style.setProperty('--accent-dark', shadeColor(c, -18));
        lsSet('setting-accent', c);
        swatches.forEach(s => s.classList.toggle('active-swatch', s.dataset.color === c));
        customEl.value = c;
    }
    applyAccent(lsGet('setting-accent', '#8b5cf6'));
    swatches.forEach(s => s.addEventListener('click', () => applyAccent(s.dataset.color)));
    customEl.addEventListener('input', () => applyAccent(customEl.value));

    // Clear data
    document.getElementById('settings-clear-data').addEventListener('click', () => {
        if (!confirm('Reset everything? Notes, tasks, weather, Spotify, shortcuts, theme and all settings will be cleared.')) return;
        localStorage.clear();
        location.reload();
    });
})();

// ─── DRAG TO REORDER ──────────────────────────────────────
(function () {
    const grid = document.getElementById('widget-grid');
    if (!grid) return;
    let dragging = null, placeholder = null;

    const savedOrder = JSON.parse(localStorage.getItem('widget-order') || '[]');
    if (savedOrder.length) savedOrder.forEach(id => { const el = grid.querySelector(`[data-id="${id}"]`); if (el) grid.appendChild(el); });

    function saveOrder() { localStorage.setItem('widget-order', JSON.stringify([...grid.querySelectorAll('.widget[data-id]')].map(el => el.dataset.id))); }

    grid.addEventListener('pointerdown', e => {
        const handle = e.target.closest('.drag-handle');
        if (!handle) return;
        dragging = handle.closest('.widget');
        if (!dragging) return;
        e.preventDefault();
        const rect = dragging.getBoundingClientRect();
        const ox = e.clientX - rect.left, oy = e.clientY - rect.top;
        placeholder = document.createElement('div');
        placeholder.className = 'drag-placeholder';
        placeholder.style.height = rect.height + 'px';
        dragging.parentNode.insertBefore(placeholder, dragging);
        dragging.classList.add('is-dragging');
        dragging.style.cssText = `width:${rect.width}px;left:${rect.left}px;top:${rect.top}px;`;
        document.body.appendChild(dragging);

        const onMove = e => {
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            dragging.style.left = (cx - ox) + 'px';
            dragging.style.top  = (cy - oy) + 'px';
            dragging.style.pointerEvents = 'none';
            const over = document.elementFromPoint(cx, cy);
            dragging.style.pointerEvents = '';
            const overW = over && over.closest('.widget[data-id]');
            if (overW && overW !== dragging) {
                const r = overW.getBoundingClientRect();
                grid.insertBefore(placeholder, cy < r.top + r.height / 2 ? overW : overW.nextSibling);
            }
        };
        const onEnd = () => {
            dragging.classList.remove('is-dragging');
            dragging.style.cssText = '';
            grid.insertBefore(dragging, placeholder);
            placeholder.remove();
            placeholder = dragging = null;
            saveOrder();
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onEnd);
        };
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onEnd);
    });
})();

// ─── SPOTIFY ──────────────────────────────────────────────
(function () {
    const iframe = document.getElementById('spotify-iframe');
    const input  = document.getElementById('spotify-url-input');
    const btn    = document.getElementById('spotify-set-btn');
    if (!iframe || !input || !btn) return;

    function toEmbed(raw) {
        try {
            const url = new URL(raw.trim());
            if (url.pathname.startsWith('/embed/')) return raw.trim();
            return `https://open.spotify.com/embed${url.pathname}?utm_source=generator`;
        } catch { return null; }
    }

    function applyPlaylist(url) { iframe.style.display = 'block'; iframe.src = url; lsSet('dashboard-spotify', url); }

    const saved = lsGet('dashboard-spotify', null);
    if (saved) applyPlaylist(saved);
    else { iframe.style.display = 'none'; input.placeholder = 'Paste your Spotify playlist link to get started...'; }

    btn.addEventListener('click', () => {
        const url = toEmbed(input.value);
        if (!url) { input.style.borderColor = '#f87171'; setTimeout(() => input.style.borderColor = '', 1500); return; }
        applyPlaylist(url);
        input.value = '';
        input.placeholder = 'Playlist updated! ✓';
        setTimeout(() => input.placeholder = 'Paste your Spotify playlist link...', 3000);
    });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });
})();

// ─── SERVICE WORKER ───────────────────────────────────────
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(() => console.log('SW registered'))
            .catch(e => console.warn('SW failed:', e));
    });
}
