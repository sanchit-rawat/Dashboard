/**
 * AESTHETIC DASHBOARD - CORE LOGIC
 * Includes: Clock, Google Search, Theme Switching, Notes, and Persistent To-Do List.
 */

// --- 1. CONFIGURATION ---
const WEATHER_API_KEY = 'b0677d9c940a9b4a0ff25a852a0c18b1';
const DEFAULT_LAT = 28.6139;
const DEFAULT_LON = 77.2090;

// --- 2. DOM ELEMENTS ---
const clockEl = document.getElementById('clock');
const dateEl = document.getElementById('date');
const searchInput = document.getElementById('google-search');
const themeBtn = document.getElementById('theme-toggle');
const notesArea = document.getElementById('quick-notes');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const addTodoBtn = document.getElementById('add-todo');

// --- 3. CLOCK & DATE ---
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    });
    clockEl.textContent = timeString;

    const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('en-US', dateOptions);
}
setInterval(updateClock, 1000);
updateClock();

// --- 4. GOOGLE SEARCH ---
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim() !== '') {
        const query = encodeURIComponent(searchInput.value);
        window.location.href = `https://www.google.com/search?q=${query}`;
    }
});

// --- 5. THEME TOGGLE (DARK/LIGHT) ---
const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeBtn.addEventListener('click', () => {
    const newTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    const icon = themeBtn.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

// --- 6. NOTES (AUTO-SAVE) ---
notesArea.value = localStorage.getItem('dashboard-notes') || '';
notesArea.addEventListener('input', () => {
    localStorage.setItem('dashboard-notes', notesArea.value);
});

// --- 7. TO-DO LIST (WITH LOCAL STORAGE) ---
let tasks = JSON.parse(localStorage.getItem('dashboard-tasks')) || [];

function renderTasks() {
    todoList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${task}</span>
            <button onclick="deleteTask(${index})" class="delete-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        todoList.appendChild(li);
    });
    localStorage.setItem('dashboard-tasks', JSON.stringify(tasks));
}

function addTask() {
    const text = todoInput.value.trim();
    if (text) {
        tasks.push(text);
        todoInput.value = '';
        renderTasks();
    }
}

window.deleteTask = (index) => {
    tasks.splice(index, 1);
    renderTasks();
};

addTodoBtn.addEventListener('click', addTask);
todoInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });
renderTasks();

// --- 8. WEATHER (HARDCODED DELHI COORDS - NO GEOLOCATION NEEDED) ---
async function fetchWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
        );
        if (!response.ok) throw new Error('Weather unavailable');

        const data = await response.json();
        document.querySelector('.temp').textContent = `${Math.round(data.main.temp)}°C`;
        document.querySelector('.desc').textContent = `${data.name} • ${data.weather[0].description}`;
    } catch (err) {
        console.error(err);
        document.querySelector('.desc').textContent = 'Weather unavailable';
    }
}

function getWeather() {
    // Try geolocation first, fall back to Delhi coords
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            () => {
                // Permission denied or unavailable — use Delhi as default
                fetchWeatherByCoords(DEFAULT_LAT, DEFAULT_LON);
            },
            { timeout: 5000 }
        );
    } else {
        fetchWeatherByCoords(DEFAULT_LAT, DEFAULT_LON);
    }
}

getWeather();
setInterval(getWeather, 600000);

// --- 9. CALENDAR WIDGET ---
(function () {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    let current = new Date();
    const saved = localStorage.getItem('dashboard-selected-date');
    let selected = saved ? new Date(saved) : null;

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    function isSameDate(a, b) {
        return a.getFullYear() === b.getFullYear() &&
               a.getMonth() === b.getMonth() &&
               a.getDate() === b.getDate();
    }

    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const monthName = date.toLocaleString('en-US', { month: 'long' });
        const firstDayIndex = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let html = `
            <div class="calendar-header">
                <button id="cal-prev" class="cal-nav">&lt;</button>
                <div class="cal-title">${monthName} ${year}</div>
                <button id="cal-next" class="cal-nav">&gt;</button>
            </div>
            <div class="calendar-grid">
        `;

        dayNames.forEach(name => { html += `<div class="day-name">${name}</div>`; });

        for (let i = 0; i < firstDayIndex; i++) {
            html += `<div class="day empty"></div>`;
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const cellDate = new Date(year, month, d);
            let classes = 'day';
            if (isSameDate(cellDate, new Date())) classes += ' today';
            if (selected && isSameDate(cellDate, selected)) classes += ' selected';
            html += `<div class="${classes}" data-day="${d}">${d}</div>`;
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

        calendarEl.querySelectorAll('.day').forEach(el => {
            if (el.classList.contains('empty')) return;
            el.addEventListener('click', () => {
                const day = parseInt(el.dataset.day, 10);
                selected = new Date(current.getFullYear(), current.getMonth(), day);
                localStorage.setItem('dashboard-selected-date', selected.toISOString());
                renderCalendar(current);
            });
        });
    }

    renderCalendar(current);

    const floatingPanel = document.getElementById('floating-calendar-panel');
    if (!floatingPanel) return;

    let panelHovered = false;

    function showFloatingCalendar() {
        floatingPanel.classList.add('visible');
    }

    function hideFloatingCalendar() {
        if (!panelHovered) floatingPanel.classList.remove('visible');
    }

    window.addEventListener('mousemove', (e) => {
        if (e.clientX <= 50) {
            showFloatingCalendar();
        } else if (e.clientX > 240 && !panelHovered) {
            hideFloatingCalendar();
        }
    });

    floatingPanel.addEventListener('mouseenter', () => { panelHovered = true; });
    floatingPanel.addEventListener('mouseleave', () => {
        panelHovered = false;
        hideFloatingCalendar();
    });
})();

// --- 10. SERVICE WORKER ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(() => console.log('Service Worker Registered'))
            .catch((err) => console.warn('Service Worker failed:', err));
    });
}
