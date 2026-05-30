/**
 * AESTHETIC DASHBOARD - CORE LOGIC
 * Includes: Clock, Google Search, Theme Switching, Notes, Persistent To-Do List, and Weather by City.
 */

// --- 1. CONFIGURATION ---
const WEATHER_API_KEY = 'b0677d9c940a9b4a0ff25a852a0c18b1';

// --- 2. DOM ELEMENTS ---
const clockEl      = document.getElementById('clock');
const dateEl       = document.getElementById('date');
const searchInput  = document.getElementById('google-search');
const themeBtn     = document.getElementById('theme-toggle');
const notesArea    = document.getElementById('quick-notes');
const todoInput    = document.getElementById('todo-input');
const todoList     = document.getElementById('todo-list');
const addTodoBtn   = document.getElementById('add-todo');

// --- 3. CLOCK & DATE ---
function updateClock() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-US', {
        hour12: false, hour: '2-digit', minute: '2-digit'
    });
    dateEl.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
    });
}
setInterval(updateClock, 1000);
updateClock();

// --- 4. GOOGLE SEARCH ---
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(searchInput.value)}`;
    }
});

// --- 5. THEME TOGGLE ---
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
    themeBtn.querySelector('i').className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

// --- 6. NOTES (AUTO-SAVE) ---
notesArea.value = localStorage.getItem('dashboard-notes') || '';
notesArea.addEventListener('input', () => {
    localStorage.setItem('dashboard-notes', notesArea.value);
});

// --- 7. TO-DO LIST ---
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

// --- 8. WEATHER WITH MANUAL CITY SEARCH ---

// Inject city input UI into the weather widget
function buildWeatherUI() {
    const weatherInfo = document.getElementById('weather-info');
    if (!weatherInfo) return;

    weatherInfo.innerHTML = `
        <p class="temp">--°C</p>
        <p class="desc">Loading...</p>
        <div class="weather-input-group">
            <input
                type="text"
                id="city-input"
                placeholder="Enter city..."
                value="${localStorage.getItem('dashboard-city') || 'Delhi'}"
            />
            <button id="city-search-btn"><i class="fas fa-search"></i></button>
        </div>
    `;

    document.getElementById('city-search-btn').addEventListener('click', () => {
        const city = document.getElementById('city-input').value.trim();
        if (city) fetchWeatherByCity(city);
    });

    document.getElementById('city-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const city = document.getElementById('city-input').value.trim();
            if (city) fetchWeatherByCity(city);
        }
    });
}

// Fetch weather by city name
async function fetchWeatherByCity(city) {
    const tempEl = document.querySelector('.temp');
    const descEl = document.querySelector('.desc');
    descEl.textContent = 'Searching...';

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${WEATHER_API_KEY}`
        );

        if (!response.ok) {
            if (response.status === 404) throw new Error('City not found');
            throw new Error('Weather unavailable');
        }

        const data = await response.json();
        tempEl.textContent = `${Math.round(data.main.temp)}°C`;
        descEl.textContent = `${data.name}, ${data.sys.country} • ${data.weather[0].description}`;

        // Save city so it reloads on next visit
        localStorage.setItem('dashboard-city', city);

    } catch (err) {
        console.error(err);
        tempEl.textContent = '--°C';
        descEl.textContent = err.message === 'City not found' ? '❌ City not found' : 'Weather unavailable';
    }
}

// On load: use saved city or default to Delhi
function initWeather() {
    buildWeatherUI();
    const savedCity = localStorage.getItem('dashboard-city') || 'Delhi';
    fetchWeatherByCity(savedCity);
}

initWeather();
setInterval(() => {
    const city = localStorage.getItem('dashboard-city') || 'Delhi';
    fetchWeatherByCity(city);
}, 600000);

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
        dayNames.forEach(n => { html += `<div class="day-name">${n}</div>`; });
        for (let i = 0; i < firstDayIndex; i++) html += `<div class="day empty"></div>`;
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
                selected = new Date(current.getFullYear(), current.getMonth(), parseInt(el.dataset.day, 10));
                localStorage.setItem('dashboard-selected-date', selected.toISOString());
                renderCalendar(current);
            });
        });
    }

    renderCalendar(current);

    const floatingPanel = document.getElementById('floating-calendar-panel');
    if (!floatingPanel) return;
    let panelHovered = false;

    window.addEventListener('mousemove', (e) => {
        if (e.clientX <= 50) floatingPanel.classList.add('visible');
        else if (e.clientX > 240 && !panelHovered) floatingPanel.classList.remove('visible');
    });
    floatingPanel.addEventListener('mouseenter', () => { panelHovered = true; });
    floatingPanel.addEventListener('mouseleave', () => {
        panelHovered = false;
        floatingPanel.classList.remove('visible');
    });
})();

// --- 10. SERVICE WORKER ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(() => console.log('Service Worker Registered'))
            .catch(err => console.warn('Service Worker failed:', err));
    });
}
