/**
 * AESTHETIC DASHBOARD — script.js
 * Clock · Greeting · Search · Theme · Notes · Tasks · Weather · Wallpaper Picker
 */

// ─── LOADING SCREEN ───────────────────────────────────────
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    // Wait for bar animation to finish then fade out
    setTimeout(() => {
        loader.classList.add('hidden');
    }, 1800);
});

// ─── NEW USER WELCOME ─────────────────────────────────────
(function () {
    const isNewUser = !localStorage.getItem('dashboard-welcomed');
    if (!isNewUser) return;

    const overlay = document.getElementById('welcome-overlay');
    const doneBtn = document.getElementById('welcome-done');
    if (!overlay || !doneBtn) return;

    // Show after loader finishes
    setTimeout(() => {
        overlay.classList.add('active');
    }, 2000);

    doneBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
        localStorage.setItem('dashboard-welcomed', 'true');
    });
})();

// ─── CONFIG ──────────────────────────────────────────────
const WEATHER_API_KEY    = 'b0677d9c940a9b4a0ff25a852a0c18b1';
const UNSPLASH_ACCESS_KEY = 'Pqb15MQf3mjxbeFMts0tYSc3W5La6qoS3uKETKr4m-A';

// ─── DOM ELEMENTS ─────────────────────────────────────────
const clockEl     = document.getElementById('clock');
const dateEl      = document.getElementById('date');
const greetingEl  = document.getElementById('greeting');
const searchInput = document.getElementById('google-search');
const themeBtn    = document.getElementById('theme-toggle');
const notesArea   = document.getElementById('quick-notes');
const todoInput   = document.getElementById('todo-input');
const todoList    = document.getElementById('todo-list');
const addTodoBtn  = document.getElementById('add-todo');

// ─── CLOCK, DATE & GREETING ───────────────────────────────
function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5  && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night';
}

function updateClock() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-US', {
        hour12: false, hour: '2-digit', minute: '2-digit'
    });
    dateEl.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
    });
    greetingEl.textContent = getGreeting();
}
window._clockInterval = setInterval(updateClock, 1000);
updateClock();

// ─── GOOGLE SEARCH ────────────────────────────────────────
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
        const query = encodeURIComponent(searchInput.value.trim());
        window.location.href = `https://www.google.com/search?q=${query}`;
    }
});

// ─── THEME TOGGLE ─────────────────────────────────────────
const savedTheme = localStorage.getItem('dashboard-theme') || 'dark';
document.body.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeBtn.addEventListener('click', () => {
    const newTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('dashboard-theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeBtn.querySelector('i').className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

// ─── NOTES (AUTO-SAVE) ────────────────────────────────────
notesArea.value = localStorage.getItem('dashboard-notes') || '';
notesArea.addEventListener('input', () => {
    localStorage.setItem('dashboard-notes', notesArea.value);
});

// ─── TO-DO LIST ───────────────────────────────────────────
let tasks = JSON.parse(localStorage.getItem('dashboard-tasks') || '[]');

function renderTasks() {
    todoList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');

        const span = document.createElement('span');
        span.textContent = task;

        const btn = document.createElement('button');
        btn.className = 'delete-btn';
        btn.innerHTML = '<i class="fas fa-trash"></i>';
        btn.addEventListener('click', () => {
            tasks.splice(index, 1);
            renderTasks();
        });

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

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

addTodoBtn.addEventListener('click', addTask);
todoInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });
renderTasks();

// ─── WEATHER DESCRIPTION MAP ──────────────────────────────
const WEATHER_DESCRIPTIONS = {
    // Clear
    'clear sky'                : 'Sunny',
    // Clouds
    'few clouds'               : 'Mostly Sunny',
    'scattered clouds'         : 'Partly Cloudy',
    'broken clouds'            : 'Mostly Cloudy',
    'overcast clouds'          : 'Cloudy',
    // Drizzle
    'light intensity drizzle'  : 'Light Drizzle',
    'drizzle'                  : 'Drizzle',
    'heavy intensity drizzle'  : 'Heavy Drizzle',
    'light intensity drizzle rain' : 'Drizzle',
    'drizzle rain'             : 'Drizzle & Rain',
    'shower rain and drizzle'  : 'Showers',
    // Rain
    'light rain'               : 'Light Rain',
    'moderate rain'            : 'Rain',
    'heavy intensity rain'     : 'Heavy Rain',
    'very heavy rain'          : 'Very Heavy Rain',
    'extreme rain'             : 'Extreme Rain',
    'freezing rain'            : 'Freezing Rain',
    'light intensity shower rain' : 'Light Showers',
    'shower rain'              : 'Showers',
    'heavy intensity shower rain' : 'Heavy Showers',
    'ragged shower rain'       : 'Scattered Showers',
    // Thunderstorm
    'thunderstorm with light rain'   : 'Thunderstorm',
    'thunderstorm with rain'         : 'Thunderstorm',
    'thunderstorm with heavy rain'   : 'Heavy Thunderstorm',
    'light thunderstorm'             : 'Light Thunderstorm',
    'thunderstorm'                   : 'Thunderstorm',
    'heavy thunderstorm'             : 'Heavy Thunderstorm',
    'ragged thunderstorm'            : 'Severe Thunderstorm',
    'thunderstorm with light drizzle': 'Thunderstorm',
    'thunderstorm with drizzle'      : 'Thunderstorm',
    'thunderstorm with heavy drizzle': 'Heavy Thunderstorm',
    // Snow
    'light snow'               : 'Light Snow',
    'snow'                     : 'Snow',
    'heavy snow'               : 'Heavy Snow',
    'sleet'                    : 'Sleet',
    'light shower sleet'       : 'Light Sleet',
    'shower sleet'             : 'Sleet',
    'light rain and snow'      : 'Rain & Snow',
    'rain and snow'            : 'Rain & Snow',
    'light shower snow'        : 'Light Snow Showers',
    'shower snow'              : 'Snow Showers',
    'heavy shower snow'        : 'Heavy Snow Showers',
    // Atmosphere
    'mist'                     : 'Misty',
    'smoke'                    : 'Smoky',
    'haze'                     : 'Hazy',
    'sand/dust whirls'         : 'Dusty',
    'fog'                      : 'Foggy',
    'sand'                     : 'Sandy',
    'dust'                     : 'Dusty',
    'volcanic ash'             : 'Volcanic Ash',
    'squalls'                  : 'Windy Squalls',
    'tornado'                  : 'Tornado',
};

function friendlyDesc(raw) {
    return WEATHER_DESCRIPTIONS[raw.toLowerCase()] || 
           // Capitalize first letter as fallback
           raw.charAt(0).toUpperCase() + raw.slice(1);
}

// ─── WEATHER BY CITY ──────────────────────────────────────
async function fetchWeatherByCity(city) {
    const tempEl = document.querySelector('.temp');
    const descEl = document.querySelector('.desc');
    descEl.textContent = 'Searching...';

    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${WEATHER_API_KEY}`
        );
        if (res.status === 404) throw new Error('City not found');
        if (!res.ok)            throw new Error('Weather unavailable');

        const data = await res.json();
        const desc = friendlyDesc(data.weather[0].description);
        tempEl.textContent = `${Math.round(data.main.temp)}°C`;
        descEl.textContent = `${data.name}, ${data.sys.country} · ${desc}`;
        localStorage.setItem('dashboard-city', city);
    } catch (err) {
        tempEl.textContent = '--°C';
        descEl.textContent = err.message;
    }
}

function initWeather() {
    const cityInput     = document.getElementById('city-input');
    const citySearchBtn = document.getElementById('city-search-btn');
    const savedCity     = localStorage.getItem('dashboard-city');

    if (savedCity) {
        // Returning user — load their saved city
        cityInput.value = savedCity;
        fetchWeatherByCity(savedCity);
    } else {
        // New user — show empty state
        document.querySelector('.temp').textContent = '--°C';
        document.querySelector('.desc').textContent = 'Enter your city above ↑';
    }

    citySearchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) fetchWeatherByCity(city);
    });

    cityInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) fetchWeatherByCity(city);
        }
    });
}

initWeather();
setInterval(() => {
    const city = localStorage.getItem('dashboard-city');
    if (city) fetchWeatherByCity(city);
}, 600_000);

// ─── CALENDAR WIDGET ──────────────────────────────────────
(function () {
    const calendarEl = document.getElementById('floating-calendar');
    if (!calendarEl) return;

    let current = new Date();
    const saved = localStorage.getItem('dashboard-selected-date');
    let selected = saved ? new Date(saved) : null;
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    function isSameDate(a, b) {
        return a.getFullYear() === b.getFullYear() &&
               a.getMonth()    === b.getMonth()    &&
               a.getDate()     === b.getDate();
    }

    function renderCalendar(date) {
        const year        = date.getFullYear();
        const month       = date.getMonth();
        const monthName   = date.toLocaleString('en-US', { month: 'long' });
        const firstDayIdx = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let html = `
            <div class="calendar-header">
                <button id="cal-prev" class="cal-nav">&lt;</button>
                <div class="cal-title">${monthName} ${year}</div>
                <button id="cal-next" class="cal-nav">&gt;</button>
            </div>
            <div class="calendar-grid">
        `;

        dayNames.forEach(n => { html += `<div class="day-name">${n}</div>`; });
        for (let i = 0; i < firstDayIdx; i++) html += `<div class="day empty"></div>`;
        for (let d = 1; d <= daysInMonth; d++) {
            const cell = new Date(year, month, d);
            let cls = 'day';
            if (isSameDate(cell, new Date())) cls += ' today';
            if (selected && isSameDate(cell, selected)) cls += ' selected';
            html += `<div class="${cls}" data-day="${d}">${d}</div>`;
        }
        html += `</div>`;
        calendarEl.innerHTML = html;

        calendarEl.querySelector('#cal-prev').addEventListener('click', () => {
            current = new Date(current.getFullYear(), current.getMonth() - 1, 1);
            renderCalendar(current);
        });
        calendarEl.querySelector('#cal-next').addEventListener('click', () => {
            current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
            renderCalendar(current);
        });
        calendarEl.querySelectorAll('.day:not(.empty)').forEach(el => {
            el.addEventListener('click', () => {
                selected = new Date(current.getFullYear(), current.getMonth(), parseInt(el.dataset.day, 10));
                localStorage.setItem('dashboard-selected-date', selected.toISOString());
                renderCalendar(current);
            });
        });
    }

    renderCalendar(current);

    const floatingPanel = document.getElementById('floating-calendar-panel');
    if (!floatingPanel) return;

    const calBtn = document.getElementById('calendar-btn');

    // Stop ALL clicks inside the panel from bubbling to document
    floatingPanel.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Toggle calendar on button click
    calBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = floatingPanel.classList.contains('visible');
        floatingPanel.classList.toggle('visible', !isOpen);
        calBtn.classList.toggle('cal-active', !isOpen);
    });

    // Only close when clicking truly outside
    document.addEventListener('click', () => {
        floatingPanel.classList.remove('visible');
        calBtn.classList.remove('cal-active');
    });
})();

// ─── WALLPAPER PICKER ─────────────────────────────────────
(function () {
    const overlay       = document.getElementById('wallpaper-overlay');
    const modal         = document.getElementById('wallpaper-modal');
    const openBtn       = document.getElementById('wallpaper-btn');
    const closeBtn      = document.getElementById('wallpaper-close');
    const tabs          = document.querySelectorAll('.wp-tab');
    const panels        = document.querySelectorAll('.wp-panel');
    const gradientGrid  = document.getElementById('gradient-grid');
    const clearBtn      = document.getElementById('clear-wallpaper');
    const unsplashQuery = document.getElementById('unsplash-query');
    const unsplashBtn   = document.getElementById('unsplash-search-btn');
    const unsplashGrid  = document.getElementById('unsplash-grid');

    // ── Gradient presets ──
    const GRADIENTS = [
        { label: 'Midnight',   value: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' },
        { label: 'Aurora',     value: 'linear-gradient(135deg,#0b3d2e,#1a6b4a,#0d2137)' },
        { label: 'Dusk',       value: 'linear-gradient(135deg,#2d1b69,#c0392b,#f39c12)' },
        { label: 'Ocean',      value: 'linear-gradient(135deg,#0f2027,#203a43,#2c5364)' },
        { label: 'Rose Gold',  value: 'linear-gradient(135deg,#f7971e,#ffd200,#f7971e,#c94b4b)' },
        { label: 'Nebula',     value: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460,#e94560)' },
        { label: 'Forest',     value: 'linear-gradient(135deg,#134e5e,#71b280)' },
        { label: 'Candy',      value: 'linear-gradient(135deg,#f953c6,#b91d73)' },
        { label: 'Steel',      value: 'linear-gradient(135deg,#1c1c2e,#2c3e50,#4ca1af)' },
        { label: 'Lava',       value: 'linear-gradient(135deg,#200122,#6f0000)' },
        { label: 'Citrus',     value: 'linear-gradient(135deg,#f7971e,#ffd200)' },
        { label: 'Arctic',     value: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
    ];

    // Build gradient swatches
    GRADIENTS.forEach(({ label, value }) => {
        const swatch = document.createElement('button');
        swatch.className = 'gradient-swatch';
        swatch.title = label;
        swatch.style.background = value;
        swatch.innerHTML = `<span class="swatch-label">${label}</span>`;
        swatch.addEventListener('click', () => {
            applyWallpaper({ type: 'gradient', value });
            closeModal();
        });
        gradientGrid.appendChild(swatch);
    });

    // ── Apply / clear wallpaper ──
    function applyWallpaper(wp) {
        if (wp.type === 'gradient') {
            overlay.style.background = wp.value;
            overlay.style.backgroundSize = 'cover';
            overlay.style.backgroundPosition = 'center';
            document.body.classList.add('has-wallpaper');
        } else if (wp.type === 'photo') {
            overlay.style.background = `url('${wp.value}') center/cover no-repeat`;
            document.body.classList.add('has-wallpaper');
        }
        localStorage.setItem('dashboard-wallpaper', JSON.stringify(wp));
    }

    function clearWallpaper() {
        overlay.style.background = '';
        document.body.classList.remove('has-wallpaper');
        localStorage.removeItem('dashboard-wallpaper');
    }

    // Restore saved wallpaper on load
    const saved = localStorage.getItem('dashboard-wallpaper');
    if (saved) {
        try { applyWallpaper(JSON.parse(saved)); } catch (_) {}
    }

    // ── Modal open / close ──
    function openModal()  { modal.classList.add('open'); }
    function closeModal() { modal.classList.remove('open'); }

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    clearBtn.addEventListener('click', () => { clearWallpaper(); closeModal(); });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // ── Tab switching ──
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.add('hidden'));
            tab.classList.add('active');
            document.getElementById(`tab-${tab.dataset.tab}`).classList.remove('hidden');
        });
    });

    // ── Unsplash photo search ──
    async function searchPhotos(query) {
        unsplashGrid.innerHTML = '<p class="wp-hint">Loading...</p>';
        try {
            const res = await fetch(
                `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape`,
                { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
            );
            if (!res.ok) throw new Error('Search failed');
            const data = await res.json();

            if (!data.results.length) {
                unsplashGrid.innerHTML = '<p class="wp-hint">No photos found. Try another keyword.</p>';
                return;
            }

            unsplashGrid.innerHTML = '';
            data.results.forEach(photo => {
                const thumb = photo.urls.small;
                const full  = photo.urls.full;
                const name  = photo.user.name;

                const btn = document.createElement('button');
                btn.className = 'unsplash-thumb';
                btn.title = `Photo by ${name}`;
                btn.style.backgroundImage = `url('${thumb}')`;
                btn.addEventListener('click', () => {
                    applyWallpaper({ type: 'photo', value: full });
                    closeModal();
                });
                unsplashGrid.appendChild(btn);
            });
        } catch (err) {
            unsplashGrid.innerHTML = `<p class="wp-hint">Error: ${err.message}</p>`;
        }
    }

    unsplashBtn.addEventListener('click', () => {
        const q = unsplashQuery.value.trim();
        if (q) searchPhotos(q);
    });
    unsplashQuery.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const q = unsplashQuery.value.trim();
            if (q) searchPhotos(q);
        }
    });

    // Auto-load when Photos tab is first opened
    let photosLoaded = false;
    document.querySelector('[data-tab="unsplash"]').addEventListener('click', () => {
        if (!photosLoaded) {
            photosLoaded = true;
            unsplashQuery.value = 'nature landscape';
            searchPhotos('nature landscape');
        }
    });
})();

// ─── SHORTCUTS ────────────────────────────────────────────
(function () {
    const shortcutsList   = document.getElementById('shortcuts-list');
    const addBtn          = document.getElementById('add-shortcut-btn');
    const modal           = document.getElementById('shortcut-modal');
    const closeBtn        = document.getElementById('shortcut-close');
    const modalTitle      = document.getElementById('shortcut-modal-title');
    const nameInput       = document.getElementById('shortcut-name');
    const urlInput        = document.getElementById('shortcut-url');
    const saveBtn         = document.getElementById('shortcut-save-btn');
    const deleteBtn       = document.getElementById('shortcut-delete-btn');
    const iconPreview     = document.getElementById('shortcut-icon-preview');
    const iconOptions     = document.getElementById('shortcut-icon-options');

    // ── Icon palette ──
    const ICONS = [
        'fa-globe','fa-youtube','fa-github','fa-twitter','fa-instagram',
        'fa-linkedin','fa-reddit','fa-facebook','fa-twitch','fa-discord',
        'fa-spotify','fa-whatsapp','fa-telegram-plane','fa-slack','fa-figma',
        'fa-code','fa-terminal','fa-database','fa-envelope','fa-bookmark',
        'fa-shopping-cart','fa-newspaper','fa-film','fa-music','fa-gamepad',
        'fa-graduation-cap','fa-briefcase','fa-chart-line','fa-cloud','fa-star',
    ];

    const ICON_BRANDS = new Set([
        'fa-youtube','fa-github','fa-twitter','fa-instagram','fa-linkedin',
        'fa-reddit','fa-facebook','fa-twitch','fa-discord','fa-spotify',
        'fa-whatsapp','fa-telegram-plane','fa-slack','fa-figma',
    ]);

    function iconClass(ic) {
        return ICON_BRANDS.has(ic) ? `fab ${ic}` : `fas ${ic}`;
    }

    // Build icon picker
    ICONS.forEach(ic => {
        const btn = document.createElement('button');
        btn.className = 'icon-opt';
        btn.dataset.icon = ic;
        btn.innerHTML = `<i class="${iconClass(ic)}"></i>`;
        btn.addEventListener('click', () => selectIcon(ic));
        iconOptions.appendChild(btn);
    });

    let selectedIcon = 'fa-globe';
    function selectIcon(ic) {
        selectedIcon = ic;
        iconPreview.innerHTML = `<i class="${iconClass(ic)}"></i>`;
        iconOptions.querySelectorAll('.icon-opt').forEach(b => {
            b.classList.toggle('active', b.dataset.icon === ic);
        });
    }
    selectIcon('fa-globe');

    // ── Storage ──
    let shortcuts = JSON.parse(localStorage.getItem('dashboard-shortcuts') || '[]');

    function save() {
        localStorage.setItem('dashboard-shortcuts', JSON.stringify(shortcuts));
    }

    // ── Render shortcut chips ──
    function render() {
        shortcutsList.innerHTML = '';
        shortcuts.forEach((sc, idx) => {
            const a = document.createElement('a');
            a.className = 'shortcut-chip';
            a.href = sc.url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.title = sc.name;
            a.innerHTML = `
                <span class="sc-icon"><i class="${iconClass(sc.icon)}"></i></span>
                <span class="sc-label">${escapeHtml(sc.name)}</span>
                <button class="sc-edit-btn" title="Edit" data-idx="${idx}">
                    <i class="fas fa-pen"></i>
                </button>
            `;
            // Edit button — stop link from firing
            a.querySelector('.sc-edit-btn').addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openEdit(idx);
            });
            shortcutsList.appendChild(a);
        });
    }

    // ── Modal helpers ──
    let editingIdx = null;

    function openAdd() {
        editingIdx = null;
        modalTitle.textContent = 'Add Shortcut';
        nameInput.value = '';
        urlInput.value  = '';
        selectIcon('fa-globe');
        deleteBtn.classList.add('hidden');
        openModal();
        setTimeout(() => nameInput.focus(), 80);
    }

    function openEdit(idx) {
        editingIdx = idx;
        const sc = shortcuts[idx];
        modalTitle.textContent = 'Edit Shortcut';
        nameInput.value = sc.name;
        urlInput.value  = sc.url;
        selectIcon(sc.icon || 'fa-globe');
        deleteBtn.classList.remove('hidden');
        openModal();
        setTimeout(() => nameInput.focus(), 80);
    }

    function openModal()  { modal.classList.add('open'); }
    function closeModal() { modal.classList.remove('open'); }

    function handleSave() {
        const name = nameInput.value.trim();
        let   url  = urlInput.value.trim();
        if (!name || !url) return;
        // Auto-prepend https if missing
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

        if (editingIdx !== null) {
            shortcuts[editingIdx] = { name, url, icon: selectedIcon };
        } else {
            shortcuts.push({ name, url, icon: selectedIcon });
        }
        save();
        render();
        closeModal();
    }

    function handleDelete() {
        if (editingIdx === null) return;
        shortcuts.splice(editingIdx, 1);
        save();
        render();
        closeModal();
    }

    // ── Event listeners ──
    addBtn.addEventListener('click', openAdd);
    closeBtn.addEventListener('click', closeModal);
    saveBtn.addEventListener('click', handleSave);
    deleteBtn.addEventListener('click', handleDelete);

    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'Enter' && modal.classList.contains('open') &&
            document.activeElement !== urlInput) {
            handleSave();
        }
    });

    render();
})();

// ─── SETTINGS ─────────────────────────────────────────────
(function () {
    const modal      = document.getElementById('settings-modal');
    const openBtn    = document.getElementById('settings-btn');
    const closeBtn   = document.getElementById('settings-close');

    // ── Open / Close ──
    function openModal()  { modal.classList.add('open'); }
    function closeModal() { modal.classList.remove('open'); }

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    // ── Helpers ──
    function load(key, fallback) {
        const v = localStorage.getItem(key);
        return v === null ? fallback : JSON.parse(v);
    }
    function save(key, val) {
        localStorage.setItem(key, JSON.stringify(val));
    }

    // ── Clock: 12hr toggle ──
    const el12hr = document.getElementById('setting-12hr');
    el12hr.checked = load('setting-12hr', false);
    el12hr.addEventListener('change', () => save('setting-12hr', el12hr.checked));

    // ── Clock: show seconds toggle ──
    const elSec = document.getElementById('setting-seconds');
    elSec.checked = load('setting-seconds', false);
    elSec.addEventListener('change', () => save('setting-seconds', elSec.checked));

    // Patch updateClock to respect these settings
    const _origUpdate = window._patchedClock;
    function patchedUpdateClock() {
        const now     = new Date();
        const use12   = load('setting-12hr', false);
        const showSec = load('setting-seconds', false);
        clockEl.textContent = now.toLocaleTimeString('en-US', {
            hour12:  use12,
            hour:    '2-digit',
            minute:  '2-digit',
            ...(showSec ? { second: '2-digit' } : {})
        });
        dateEl.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric'
        });
        greetingEl.textContent = getGreeting();
    }
    // Override the global clock updater
    clearInterval(window._clockInterval);
    window._clockInterval = setInterval(patchedUpdateClock, 1000);
    patchedUpdateClock();

    // ── Search engine ──
    const engineBtns = document.querySelectorAll('.engine-btn');
    let currentEngine = load('setting-engine', 'https://www.google.com/search?q=');

    function setEngine(url) {
        currentEngine = url;
        save('setting-engine', url);
        engineBtns.forEach(b => b.classList.toggle('active', b.dataset.url === url));
    }

    // Mark saved engine on load
    engineBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.url === currentEngine);
        btn.addEventListener('click', () => setEngine(btn.dataset.url));
    });

    // Patch search to use chosen engine
    searchInput.replaceWith(searchInput.cloneNode(true)); // remove old listener
    const freshSearch = document.getElementById('google-search');
    freshSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && freshSearch.value.trim()) {
            const q = encodeURIComponent(freshSearch.value.trim());
            window.location.href = load('setting-engine', 'https://www.google.com/search?q=') + q;
        }
    });

    // ── Widget visibility toggles ──
    const WIDGET_MAP = {
        'setting-weather': '.widget:nth-child(1)',
        'setting-notes':   '.widget:nth-child(2)',
        'setting-tasks':   '.widget:nth-child(3)',
        'setting-spotify': '.widget:nth-child(4)',
    };

    function applyWidgetVisibility(id, show) {
        const el = document.querySelector(WIDGET_MAP[id]);
        if (el) el.style.display = show ? '' : 'none';
    }

    Object.keys(WIDGET_MAP).forEach(id => {
        const toggle = document.getElementById(id);
        const shown  = load(id, true);
        toggle.checked = shown;
        applyWidgetVisibility(id, shown);

        toggle.addEventListener('change', () => {
            save(id, toggle.checked);
            applyWidgetVisibility(id, toggle.checked);
        });
    });

    // ── Glassmorphism intensity ──
    const blurSlider    = document.getElementById('setting-blur');
    const opacitySlider = document.getElementById('setting-opacity');
    const borderSlider  = document.getElementById('setting-border');
    const blurVal       = document.getElementById('blur-val');
    const opacityVal    = document.getElementById('opacity-val');
    const borderVal     = document.getElementById('border-val');
    const previewCard   = document.getElementById('glass-preview-card');

    function applyGlass(blur, opacity, border) {
        const blurPx      = `${blur}px`;
        const opacityFrac = (opacity / 100).toFixed(2);
        const borderFrac  = (border  / 100).toFixed(2);

        document.documentElement.style.setProperty('--glass-blur',   blurPx);
        document.documentElement.style.setProperty('--glass-bg',     `rgba(255,255,255,${opacityFrac})`);
        document.documentElement.style.setProperty('--glass-border', `rgba(255,255,255,${borderFrac})`);

        // Update preview card
        previewCard.style.backdropFilter       = `blur(${blurPx})`;
        previewCard.style.webkitBackdropFilter = `blur(${blurPx})`;
        previewCard.style.background           = `rgba(255,255,255,${opacityFrac})`;
        previewCard.style.borderColor          = `rgba(255,255,255,${borderFrac})`;

        blurVal.textContent    = `${blur}px`;
        opacityVal.textContent = `${opacity}%`;
        borderVal.textContent  = `${border}%`;

        save('setting-blur',    blur);
        save('setting-opacity', opacity);
        save('setting-border',  border);
    }

    // Restore saved values
    const initBlur    = load('setting-blur',    12);
    const initOpacity = load('setting-opacity', 5);
    const initBorder  = load('setting-border',  8);

    blurSlider.value    = initBlur;
    opacitySlider.value = initOpacity;
    borderSlider.value  = initBorder;
    applyGlass(initBlur, initOpacity, initBorder);

    blurSlider.addEventListener('input',    () => applyGlass(+blurSlider.value,    +opacitySlider.value, +borderSlider.value));
    opacitySlider.addEventListener('input', () => applyGlass(+blurSlider.value,    +opacitySlider.value, +borderSlider.value));
    borderSlider.addEventListener('input',  () => applyGlass(+blurSlider.value,    +opacitySlider.value, +borderSlider.value));

    // ── Font picker ──
    const fontBtns = document.querySelectorAll('.font-btn');

    function applyFont(fontName) {
        document.documentElement.style.setProperty('--font-main', `'${fontName}', sans-serif`);
        save('setting-font', fontName);
        fontBtns.forEach(b => b.classList.toggle('active-font', b.dataset.font === fontName));
    }

    const savedFont = load('setting-font', 'Inter');
    applyFont(savedFont);

    fontBtns.forEach(btn => {
        btn.addEventListener('click', () => applyFont(btn.dataset.font));
    });

    // ── Accent color ──
    const accentSwatches  = document.querySelectorAll('.accent-swatch');
    const accentCustom    = document.getElementById('accent-custom');

    function applyAccent(color) {
        document.documentElement.style.setProperty('--accent', color);
        // Derive a slightly darker shade for hover states
        document.documentElement.style.setProperty('--accent-dark', shadeColor(color, -18));
        save('setting-accent', color);
        // Update swatch active states
        accentSwatches.forEach(s => {
            s.classList.toggle('active-swatch', s.dataset.color === color);
        });
        accentCustom.value = color;
    }

    // Lighten/darken a hex color by percent
    function shadeColor(hex, percent) {
        let r = parseInt(hex.slice(1,3),16);
        let g = parseInt(hex.slice(3,5),16);
        let b = parseInt(hex.slice(5,7),16);
        r = Math.min(255, Math.max(0, r + percent));
        g = Math.min(255, Math.max(0, g + percent));
        b = Math.min(255, Math.max(0, b + percent));
        return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
    }

    // Restore saved accent on load
    const savedAccent = load('setting-accent', '#8b5cf6');
    applyAccent(savedAccent);

    accentSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => applyAccent(swatch.dataset.color));
    });

    accentCustom.addEventListener('input', () => applyAccent(accentCustom.value));

    // ── Clear all data ──
    document.getElementById('settings-clear-data').addEventListener('click', () => {
        if (!confirm('This will reset everything — notes, tasks, weather city, Spotify playlist, shortcuts, theme and all settings. You\'ll see a fresh dashboard. Continue?')) return;

        // Clear every single key
        const keysToRemove = [
            'dashboard-notes',
            'dashboard-tasks',
            'dashboard-city',
            'dashboard-spotify',
            'dashboard-theme',
            'dashboard-widgets',
            'dashboard-perf',
            'dashboard-wallpaper',
            'dashboard-widget-order',
            'dashboard-selected-date',
            'dashboard-shortcuts',
            'nexus-theme',
            'nexus-notes',
            'nexus-tasks',
            'nexus-city',
        ];
        keysToRemove.forEach(k => localStorage.removeItem(k));

        // Full clear just in case anything was missed
        localStorage.clear();

        location.reload();
    });
})();

// ─── DRAG TO REORDER WIDGETS ──────────────────────────────
(function () {
    const grid = document.getElementById('widget-grid');
    if (!grid) return;

    let dragging   = null;   // element being dragged
    let placeholder = null;  // drop target indicator

    // Restore saved order on load
    const savedOrder = JSON.parse(localStorage.getItem('widget-order') || '[]');
    if (savedOrder.length) {
        savedOrder.forEach(id => {
            const el = grid.querySelector(`[data-id="${id}"]`);
            if (el) grid.appendChild(el);
        });
    }

    function saveOrder() {
        const order = [...grid.querySelectorAll('.widget[data-id]')].map(el => el.dataset.id);
        localStorage.setItem('widget-order', JSON.stringify(order));
    }

    function createPlaceholder(height) {
        const ph = document.createElement('div');
        ph.className = 'drag-placeholder';
        ph.style.height = height + 'px';
        return ph;
    }

    // ── Pointer events (works on touch + mouse) ──
    grid.addEventListener('pointerdown', (e) => {
        const handle = e.target.closest('.drag-handle');
        if (!handle) return;

        dragging = handle.closest('.widget');
        if (!dragging) return;

        e.preventDefault();

        const rect    = dragging.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        const width   = rect.width;
        const height  = rect.height;

        // Create placeholder
        placeholder = createPlaceholder(height);
        dragging.parentNode.insertBefore(placeholder, dragging);

        // Style the dragging card
        dragging.classList.add('is-dragging');
        dragging.style.width    = width + 'px';
        dragging.style.left     = rect.left + 'px';
        dragging.style.top      = rect.top  + 'px';
        document.body.appendChild(dragging);

        function onMove(e) {
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            dragging.style.left = (clientX - offsetX) + 'px';
            dragging.style.top  = (clientY - offsetY) + 'px';

            // Find which widget to insert before
            dragging.style.pointerEvents = 'none';
            const target = document.elementFromPoint(clientX, clientY);
            dragging.style.pointerEvents = '';

            const overWidget = target && target.closest('.widget[data-id]');
            if (overWidget && overWidget !== dragging) {
                const overRect   = overWidget.getBoundingClientRect();
                const overMiddle = overRect.top + overRect.height / 2;
                if (clientY < overMiddle) {
                    grid.insertBefore(placeholder, overWidget);
                } else {
                    grid.insertBefore(placeholder, overWidget.nextSibling);
                }
            }
        }

        function onEnd() {
            dragging.classList.remove('is-dragging');
            dragging.style.cssText = '';
            grid.insertBefore(dragging, placeholder);
            placeholder.remove();
            placeholder = null;
            dragging    = null;
            saveOrder();
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup',   onEnd);
        }

        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup',   onEnd);
    });
})();

// ─── SERVICE WORKER ───────────────────────────────────────
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(() => console.log('Service Worker Registered'))
            .catch(err => console.warn('Service Worker failed:', err));
    });
}

// ─── OPTIMIZATION MODE — 3 LEVELS ────────────────────────
(function () {
    const perfBtn    = document.getElementById('perf-toggle');
    const dropdown   = document.getElementById('perf-dropdown');
    const options    = document.querySelectorAll('.perf-option');
    if (!perfBtn || !dropdown) return;

    const LEVELS = {
        min:    { label: 'Minimum',  icon: 'fa-gauge-simple-high', toast: 'Minimum optimization — full effects ✨' },
        medium: { label: 'Medium',   icon: 'fa-gauge',             toast: 'Medium optimization — balanced ⚡' },
        high:   { label: 'Maximum',  icon: 'fa-gauge-simple',      toast: 'Maximum optimization — smoothest 🚀' },
    };

    // Toast helper
    function showToast(msg, icon = 'fa-gauge-high') {
        let toast = document.getElementById('perf-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'perf-toast';
            toast.className = 'perf-toast';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<i class="fas ${icon}"></i> ${msg}`;
        toast.classList.add('show');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
    }

    // Apply a level to body and button
    function applyLevel(level) {
        // Remove all level classes
        document.body.classList.remove('perf-min', 'perf-medium', 'perf-high');
        perfBtn.classList.remove('level-min', 'level-medium', 'level-high');

        // Apply new level
        document.body.classList.add(`perf-${level}`);
        perfBtn.classList.add(`level-${level}`);

        // Update active option in dropdown
        options.forEach(opt => {
            opt.classList.toggle('active', opt.dataset.level === level);
        });

        // Save
        localStorage.setItem('dashboard-opt-level', level);
    }

    // Load saved level — desktop default is none, mobile default is medium
    const isMobile = window.innerWidth <= 768 ||
                     /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const defaultLevel = isMobile ? 'medium' : null;
    const saved = localStorage.getItem('dashboard-opt-level') || defaultLevel;

    if (saved) applyLevel(saved);

    // Toggle dropdown open/close
    perfBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });

    // Option click
    options.forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            const level = opt.dataset.level;
            applyLevel(level);
            dropdown.classList.remove('open');
            showToast(LEVELS[level].toast, LEVELS[level].icon);
        });
    });

    // Close on outside click
    document.addEventListener('click', () => dropdown.classList.remove('open'));
    dropdown.addEventListener('click', e => e.stopPropagation());
})();

// ─── CUSTOM SPOTIFY PLAYLIST ──────────────────────────────
(function () {
    const iframe    = document.getElementById('spotify-iframe');
    const input     = document.getElementById('spotify-url-input');
    const btn       = document.getElementById('spotify-set-btn');
    if (!iframe || !input || !btn) return;

    const DEFAULT = 'https://open.spotify.com/embed/playlist/33f6SkybskktunLAWRpSAe?utm_source=generator';

    // Extract Spotify embed URL from any Spotify link the user pastes
    function toEmbedUrl(raw) {
        try {
            const url = new URL(raw.trim());

            // Already an embed link — use as-is
            if (url.pathname.startsWith('/embed/')) return raw.trim();

            // e.g. /playlist/37i9dQZF1DX... → /embed/playlist/37i9dQZF1DX...
            const embedPath = '/embed' + url.pathname;
            return `https://open.spotify.com${embedPath}?utm_source=generator`;
        } catch {
            return null;
        }
    }

    // Apply a playlist URL to the iframe
    function applyPlaylist(embedUrl) {
        iframe.style.display = 'block';
        iframe.src = embedUrl;
        localStorage.setItem('dashboard-spotify', embedUrl);
    }

    // Load saved playlist on startup — nothing for new users
    const saved = localStorage.getItem('dashboard-spotify');
    if (saved) {
        applyPlaylist(saved);
    } else {
        // New user — hide iframe, show prompt
        iframe.style.display = 'none';
        input.placeholder = 'Paste your Spotify playlist link to get started...';
    }

    // Handle button click
    btn.addEventListener('click', () => {
        const embedUrl = toEmbedUrl(input.value);
        if (!embedUrl) {
            input.style.borderColor = '#f87171';
            setTimeout(() => input.style.borderColor = '', 1500);
            return;
        }
        applyPlaylist(embedUrl);
        input.value = '';
        input.placeholder = 'Playlist updated! ✓';
        setTimeout(() => input.placeholder = 'Paste your Spotify playlist link...', 3000);
    });

    // Handle Enter key
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') btn.click();
    });
})();
