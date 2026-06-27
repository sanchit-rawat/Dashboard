/**
 * AESTHETIC DASHBOARD — background.js
 * Tracks time spent on each website across all tabs.
 * Stores data in chrome.storage.local per day.
 */

let activeTabId   = null;
let activeUrl     = null;
let activeStart   = null;

// ── Helpers ──────────────────────────────────────────────
function getTodayKey() {
    const d = new Date();
    return `track_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
}

function getHostname(url) {
    try {
        const u = new URL(url);
        // Skip chrome:// and extension pages
        if (u.protocol === 'chrome:' || u.protocol === 'chrome-extension:') return null;
        // Remove www.
        return u.hostname.replace(/^www\./, '');
    } catch { return null; }
}

function getFaviconUrl(url) {
    try {
        const u = new URL(url);
        return `https://www.google.com/s2/favicons?sz=32&domain=${u.hostname}`;
    } catch { return null; }
}

// ── Save elapsed time for current active tab ──────────────
async function saveElapsed() {
    if (!activeUrl || !activeStart) return;
    const host = getHostname(activeUrl);
    if (!host) return;

    const elapsed = Math.floor((Date.now() - activeStart) / 1000); // seconds
    if (elapsed < 1) return;

    const key = getTodayKey();
    const result = await chrome.storage.local.get([key]);
    const data = result[key] || {};

    if (!data[host]) {
        data[host] = {
            seconds: 0,
            favicon: getFaviconUrl(activeUrl),
            lastVisit: Date.now()
        };
    }
    data[host].seconds  += elapsed;
    data[host].lastVisit = Date.now();

    await chrome.storage.local.set({ [key]: data });
}

// ── Start tracking a new URL ──────────────────────────────
async function startTracking(tabId, url) {
    await saveElapsed(); // save previous
    activeTabId  = tabId;
    activeUrl    = url;
    activeStart  = Date.now();
}

// ── Stop tracking (window unfocused etc.) ─────────────────
async function stopTracking() {
    await saveElapsed();
    activeUrl   = null;
    activeStart = null;
}

// ── Tab events ────────────────────────────────────────────
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    try {
        const tab = await chrome.tabs.get(tabId);
        if (tab.url) await startTracking(tabId, tab.url);
    } catch {}
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (tabId !== activeTabId) return;
    if (changeInfo.status === 'complete' && tab.url) {
        await startTracking(tabId, tab.url);
    }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
    if (tabId === activeTabId) await stopTracking();
});

// ── Window focus events ───────────────────────────────────
chrome.windows.onFocusChanged.addListener(async (windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        await stopTracking();
    } else {
        try {
            const [tab] = await chrome.tabs.query({ active: true, windowId });
            if (tab && tab.url) await startTracking(tab.id, tab.url);
        } catch {}
    }
});

// ── Save every 30 seconds via alarm ──────────────────────
chrome.alarms.create('save-tracking', { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'save-tracking') await saveElapsed();
    if (activeStart) activeStart = Date.now(); // reset timer after save
});

// ── Init on startup ───────────────────────────────────────
chrome.runtime.onStartup.addListener(async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        if (tab && tab.url) await startTracking(tab.id, tab.url);
    } catch {}
});

// ── Streak tracking ───────────────────────────────────────
// Track which days the user opened the extension
async function updateStreak() {
    const today = new Date().toDateString();
    const result = await chrome.storage.local.get(['streak_data']);
    const streak = result.streak_data || { lastDay: null, count: 0, days: [] };

    if (streak.lastDay === today) return; // already counted today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const wasYesterday = streak.lastDay === yesterday.toDateString();

    streak.count = wasYesterday ? streak.count + 1 : 1;
    streak.lastDay = today;
    if (!streak.days.includes(today)) streak.days.push(today);
    // Keep only last 30 days
    if (streak.days.length > 30) streak.days = streak.days.slice(-30);

    await chrome.storage.local.set({ streak_data: streak });
}

chrome.runtime.onInstalled.addListener(updateStreak);
chrome.runtime.onStartup.addListener(updateStreak);
