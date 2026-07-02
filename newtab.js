const STORAGE_KEY = "tasks";
const HABITS_KEY = "habits";
const HISTORY_KEY = "completedTasks";
const THEME_KEY = "theme";
const TASKS_PER_PAGE = 6;
const HABITS_PER_PAGE = 9;

const form = document.getElementById("task-form");
const emojiInput = document.getElementById("emoji");
const emojiTrigger = document.getElementById("emoji-trigger");
const emojiPopup = document.getElementById("emoji-picker-popup");
const emojiPickerEl = document.querySelector("emoji-picker");
const titleInput = document.getElementById("title");
const deadlineInput = document.getElementById("deadline");
const editIdInput = document.getElementById("edit-id");
const submitBtn = document.getElementById("submit-btn");
const completeBtn = document.getElementById("complete-btn");
const deleteBtn = document.getElementById("delete-btn");
const taskList = document.getElementById("task-list");
const historyToggle = document.getElementById("history-toggle");
const historyModalOverlay = document.getElementById("history-modal-overlay");
const historyList = document.getElementById("history-list");
const focusToggle = document.getElementById("focus-toggle");
const focusModalOverlay = document.getElementById("focus-modal-overlay");
const focusForm = document.getElementById("focus-form");
const focusDomainsInput = document.getElementById("focus-domains");
const focusDurationPills = document.getElementById("focus-duration-pills");
const focusCustomMinutes = document.getElementById("focus-custom-minutes");
const focusToggleIcon = document.getElementById("focus-toggle-icon");
const focusToggleLabel = document.getElementById("focus-toggle-label");
const focusActiveView = document.getElementById("focus-active-view");
const focusActiveTime = document.getElementById("focus-active-time");
const focusActiveDomains = document.getElementById("focus-active-domains");
const focusAddDomainForm = document.getElementById("focus-add-domain-form");
const focusAddDomainInput = document.getElementById("focus-add-domain-input");
const themeGroup = document.getElementById("theme-group");
const languageGroup = document.getElementById("language-group");
const settingsToggle = document.getElementById("settings-toggle");
const settingsMenu = document.getElementById("settings-menu");
const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importFile = document.getElementById("import-file");
const taskDots = document.getElementById("task-dots");

const habitList = document.getElementById("habit-list");
const habitDots = document.getElementById("habit-dots");
const habitCreateBtn = document.getElementById("habit-create-btn");
const habitModalOverlay = document.getElementById("habit-modal-overlay");
const habitForm = document.getElementById("habit-form");
const habitEmojiInput = document.getElementById("habit-emoji");
const habitEmojiTrigger = document.getElementById("habit-emoji-trigger");
const habitEmojiPopup = document.getElementById("habit-emoji-picker-popup");
const habitEmojiPickerEl = document.querySelector("#habit-emoji-picker-popup emoji-picker");
const habitTitleInput = document.getElementById("habit-title");
const habitDays = document.getElementById("habit-days");
const habitModalList = document.getElementById("habit-modal-list");
const habitDetail = document.getElementById("habit-detail");
const habitDetailBack = document.getElementById("habit-detail-back");
const habitDetailList = document.getElementById("habit-detail-list");
const habitDetailAddDate = document.getElementById("habit-detail-add-date");
const habitDetailAddBtn = document.getElementById("habit-detail-add-btn");
const habitEditIdInput = document.getElementById("habit-edit-id");
const habitSubmitBtn = document.getElementById("habit-submit-btn");
const habitDeleteBtn = document.getElementById("habit-delete-btn");

let taskPage = 0;
let taskTotalPages = 0;
let habitPage = 0;
let habitTotalPages = 0;

function loadTasks() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      resolve(result[STORAGE_KEY] || []);
    });
  });
}

function saveTasks(tasks) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: tasks }, resolve);
  });
}

function loadHabits() {
  return new Promise((resolve) => {
    chrome.storage.local.get([HABITS_KEY], (result) => {
      resolve(result[HABITS_KEY] || []);
    });
  });
}

function saveHabits(habits) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [HABITS_KEY]: habits }, resolve);
  });
}

function loadHistory() {
  return new Promise((resolve) => {
    chrome.storage.local.get([HISTORY_KEY], (result) => {
      resolve(result[HISTORY_KEY] || []);
    });
  });
}

function saveHistory(history) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [HISTORY_KEY]: history }, resolve);
  });
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateToStr(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatRemaining(deadline) {
  const today = startOfDay(new Date());
  const due = startOfDay(deadline);
  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: t("overdueDays", Math.abs(diffDays)), status: "overdue" };
  }
  if (diffDays === 0) {
    return { text: t("todayText"), status: "urgent" };
  }
  if (diffDays === 1) {
    return { text: t("oneDayLeft"), status: "urgent" };
  }
  if (diffDays <= 3) {
    return { text: t("daysLeft", diffDays), status: "urgent" };
  }
  return { text: t("daysLeft", diffDays), status: "normal" };
}

async function render() {
  const tasks = await loadTasks();

  if (tasks.length === 0) {
    taskList.innerHTML = `<li class="empty"></li>`;
    taskDots.innerHTML = "";
    taskTotalPages = 0;
    return;
  }

  const sorted = [...tasks].sort(
    (a, b) => new Date(a.deadline) - new Date(b.deadline)
  );

  const totalPages = Math.ceil(sorted.length / TASKS_PER_PAGE);
  taskTotalPages = totalPages;
  if (taskPage >= totalPages) taskPage = totalPages - 1;
  if (taskPage < 0) taskPage = 0;

  const pageTasks = sorted.slice(
    taskPage * TASKS_PER_PAGE,
    taskPage * TASKS_PER_PAGE + TASKS_PER_PAGE
  );

  taskList.innerHTML = "";
  for (const task of pageTasks) {
    const { text, status } = formatRemaining(task.deadline);

    const li = document.createElement("li");
    li.className = `task-item ${status}`;
    li.dataset.id = task.id;

    const deadlineStr = new Date(task.deadline).toLocaleDateString(localeTag(), {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    li.innerHTML = `
      <div class="task-top">
        <div class="task-icon">
          <span class="task-emoji">${escapeHtml(task.emoji)}</span>
        </div>
        <div class="task-info">
          <span class="task-title">${escapeHtml(task.title)}</span>
        </div>
      </div>
      <div class="task-right">
        <span class="task-remaining">${text}</span>
        <span class="task-deadline">${deadlineStr}</span>
      </div>
    `;
    taskList.appendChild(li);
  }

  taskDots.innerHTML = "";
  if (totalPages > 1) {
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement("span");
      if (i === taskPage) dot.className = "active";
      dot.addEventListener("click", () => {
        taskPage = i;
        render();
      });
      taskDots.appendChild(dot);
    }
  }
}

const RANDOM_EMOJIS = [
  "📝", "📌", "🔥", "⭐", "🚀", "💡", "✅", "📅", "🎯", "📚",
  "💻", "🛠️", "📞", "🛒", "🏠", "🎨", "🧹", "💰", "🏃", "☕",
];

function randomEmoji() {
  return RANDOM_EMOJIS[Math.floor(Math.random() * RANDOM_EMOJIS.length)];
}

function localeTag() {
  return getLanguage() === "vi" ? "vi-VN" : "en-US";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  await saveCurrentTask();
  resetForm();
  await render();
});

async function saveCurrentTask() {
  const title = titleInput.value.trim();
  if (!title || !deadlineInput.value) return;

  const tasks = await loadTasks();
  const editId = editIdInput.value;

  if (editId) {
    const task = tasks.find((t) => t.id === editId);
    if (task) {
      task.emoji = emojiInput.value.trim();
      task.title = title;
      task.deadline = new Date(deadlineInput.value).toISOString();
    }
  } else {
    tasks.push({
      id: crypto.randomUUID(),
      emoji: emojiInput.value.trim(),
      title: title,
      deadline: new Date(deadlineInput.value).toISOString(),
    });
  }

  await saveTasks(tasks);
}

function resetForm() {
  form.reset();
  editIdInput.value = "";
  const emoji = randomEmoji();
  emojiInput.value = emoji;
  emojiTrigger.textContent = emoji;
  deadlineInput.value = todayStr();
  submitBtn.classList.remove("hidden");
  completeBtn.classList.add("hidden");
  deleteBtn.classList.add("hidden");
  emojiPopup.classList.add("hidden");
}

taskList.addEventListener("click", async (e) => {
  const li = e.target.closest(".task-item");
  if (!li) return;

  const id = li.dataset.id;
  const tasks = await loadTasks();
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  emojiInput.value = task.emoji;
  emojiTrigger.textContent = task.emoji;
  titleInput.value = task.title;
  deadlineInput.value = dateToStr(task.deadline);
  editIdInput.value = task.id;
  submitBtn.classList.add("hidden");
  completeBtn.classList.remove("hidden");
  deleteBtn.classList.remove("hidden");
  titleInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

deleteBtn.addEventListener("click", async () => {
  const id = editIdInput.value;
  if (!id) return;
  const tasks = await loadTasks();
  const updated = tasks.filter((t) => t.id !== id);
  await saveTasks(updated);
  resetForm();
  await render();
});

completeBtn.addEventListener("click", async () => {
  const id = editIdInput.value;
  if (!id) return;
  const tasks = await loadTasks();
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const updated = tasks.filter((t) => t.id !== id);
  await saveTasks(updated);

  const history = await loadHistory();
  history.unshift({
    id: task.id,
    emoji: task.emoji,
    title: task.title,
    deadline: task.deadline,
    completedAt: new Date().toISOString(),
  });
  await saveHistory(history);

  resetForm();
  await render();
});

// Emoji picker
function positionEmojiPopup(trigger, popup) {
  const rect = trigger.getBoundingClientRect();
  popup.style.left = `${rect.left}px`;
  popup.style.top = `${rect.bottom + 4}px`;
}

emojiTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  const willShow = emojiPopup.classList.contains("hidden");
  emojiPopup.classList.toggle("hidden");
  if (willShow) positionEmojiPopup(emojiTrigger, emojiPopup);
});

emojiPickerEl.addEventListener("emoji-click", (e) => {
  const emoji = e.detail.unicode;
  emojiInput.value = emoji;
  emojiTrigger.textContent = emoji;
  emojiPopup.classList.add("hidden");
});

document.addEventListener("click", async (e) => {
  if (!emojiPopup.contains(e.target) && e.target !== emojiTrigger) {
    emojiPopup.classList.add("hidden");
  }
  if (editIdInput.value && !form.contains(e.target) && !e.target.closest(".task-item")) {
    await saveCurrentTask();
    resetForm();
    await render();
  }
});

// Theme toggle
async function loadTheme() {
  const result = await new Promise((resolve) =>
    chrome.storage.local.get([THEME_KEY], resolve)
  );
  const theme = result[THEME_KEY] || "dark";
  applyTheme(theme);
  requestAnimationFrame(() => {
    document.documentElement.classList.add("theme-ready");
  });
}

function applyTheme(theme) {
  document.documentElement.classList.toggle("light", theme === "light");
  localStorage.setItem("theme", theme);
  themeGroup.querySelectorAll(".language-pill").forEach((pill) => {
    pill.classList.toggle("active", pill.dataset.theme === theme);
  });
}

themeGroup.addEventListener("click", async (e) => {
  const pill = e.target.closest(".language-pill");
  if (!pill) return;
  const newTheme = pill.dataset.theme;
  applyTheme(newTheme);
  chrome.storage.local.set({ [THEME_KEY]: newTheme });
});

// Language switcher
function updateLanguageToggleLabel() {
  languageGroup.querySelectorAll(".language-pill").forEach((pill) => {
    pill.classList.toggle("active", pill.dataset.lang === getLanguage());
  });
}

languageGroup.addEventListener("click", async (e) => {
  const pill = e.target.closest(".language-pill");
  if (!pill) return;
  const newLang = pill.dataset.lang;
  if (newLang === getLanguage()) return;

  await setLanguage(newLang);
  updateLanguageToggleLabel();
  await render();
  await renderHabits();
  await renderHistory();
  await updateFocusButtonState();
});

// Settings dropdown
settingsToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  settingsMenu.classList.toggle("hidden");
});

document.addEventListener("click", (e) => {
  if (!settingsMenu.contains(e.target) && e.target !== settingsToggle && !settingsToggle.contains(e.target)) {
    settingsMenu.classList.add("hidden");
  }
});

// History modal
async function renderHistory() {
  const history = await loadHistory();

  if (history.length === 0) {
    historyList.innerHTML = `<li class="empty">${t("noCompletedTasks")}</li>`;
    return;
  }

  historyList.innerHTML = "";
  for (const item of history) {
    const dateStr = new Date(item.completedAt).toLocaleDateString(localeTag(), {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const li = document.createElement("li");
    li.className = "history-item";
    li.dataset.id = item.id;
    li.innerHTML = `
      <div class="task-icon">
        <span class="task-emoji">${escapeHtml(item.emoji)}</span>
        <button type="button" class="history-remove" title="${t("deleteTitle")}"><i class="fa-solid fa-trash"></i></button>
      </div>
      <div class="history-info">
        <div class="history-title">${escapeHtml(item.title)}</div>
        <div class="history-date">${t("completedOn", dateStr)}</div>
      </div>
    `;
    li.querySelector(".history-remove").addEventListener("click", async () => {
      const all = await loadHistory();
      const updated = all.filter((h) => h.id !== item.id);
      await saveHistory(updated);
      await renderHistory();
    });
    historyList.appendChild(li);
  }
}

historyToggle.addEventListener("click", async () => {
  await renderHistory();
  historyModalOverlay.classList.remove("hidden");
});

historyModalOverlay.addEventListener("click", (e) => {
  if (e.target === historyModalOverlay) {
    historyModalOverlay.classList.add("hidden");
  }
});

// Focus modal
const FOCUS_KEY = "focusSession";
let selectedFocusMinutes = null;

function normalizeDomain(raw) {
  let d = raw.trim().toLowerCase();
  if (!d) return "";
  d = d.replace(/^https?:\/\//, "").replace(/^www\./, "");
  d = d.split("/")[0];
  return d;
}

function formatFocusRemaining(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

let currentFocusSession = null;

async function getFocusSession() {
  const result = await new Promise((resolve) => chrome.storage.local.get([FOCUS_KEY], resolve));
  const session = result[FOCUS_KEY];
  return session && session.active && session.endTime > Date.now() ? session : null;
}

async function updateFocusButtonState() {
  currentFocusSession = await getFocusSession();
  focusToggle.classList.toggle("active", !!currentFocusSession);

  if (currentFocusSession) {
    focusToggleIcon.className = "fa-solid fa-hourglass-half fa-spin-pulse";
    focusToggleLabel.textContent = formatFocusRemaining(currentFocusSession.endTime - Date.now());
    focusToggle.title = t("focusActiveButtonTitle");
  } else {
    focusToggleIcon.className = "fa-solid fa-crosshairs";
    focusToggleLabel.textContent = t("focusBtn");
    focusToggle.title = t("focusTitle");
  }

  if (!focusModalOverlay.classList.contains("hidden")) {
    renderFocusModal();
  }
}

function renderFocusModal() {
  if (currentFocusSession) {
    focusForm.classList.add("hidden");
    focusActiveView.classList.remove("hidden");
    focusActiveTime.textContent = formatFocusRemaining(currentFocusSession.endTime - Date.now());
    focusActiveDomains.innerHTML = "";
    for (const domain of currentFocusSession.domains) {
      const li = document.createElement("li");
      li.textContent = domain;
      focusActiveDomains.appendChild(li);
    }
  } else {
    focusForm.classList.remove("hidden");
    focusActiveView.classList.add("hidden");
  }
}

const DEFAULT_FOCUS_DOMAINS = ["threads.com", "instagram.com", "facebook.com", "tiktok.com", "messenger.com"];

focusToggle.addEventListener("click", async () => {
  await updateFocusButtonState();
  if (!currentFocusSession) {
    focusDomainsInput.value = DEFAULT_FOCUS_DOMAINS.join("\n");
    focusCustomMinutes.value = "";
    selectedFocusMinutes = null;
    focusDurationPills.querySelectorAll(".focus-duration-pill").forEach((p) => p.classList.remove("active"));
  }
  renderFocusModal();
  focusModalOverlay.classList.remove("hidden");
});

focusModalOverlay.addEventListener("click", (e) => {
  if (e.target === focusModalOverlay) {
    focusModalOverlay.classList.add("hidden");
  }
});

focusAddDomainForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const domain = normalizeDomain(focusAddDomainInput.value);
  if (!domain) return;

  await new Promise((resolve) =>
    chrome.runtime.sendMessage({ type: "ADD_FOCUS_DOMAINS", domains: [domain] }, resolve)
  );

  focusAddDomainInput.value = "";
  await updateFocusButtonState();
});

focusDurationPills.addEventListener("click", (e) => {
  const pill = e.target.closest(".focus-duration-pill");
  if (!pill) return;
  selectedFocusMinutes = Number(pill.dataset.minutes);
  focusCustomMinutes.value = "";
  focusDurationPills.querySelectorAll(".focus-duration-pill").forEach((p) => p.classList.remove("active"));
  pill.classList.add("active");
});

focusCustomMinutes.addEventListener("input", () => {
  if (focusCustomMinutes.value) {
    selectedFocusMinutes = null;
    focusDurationPills.querySelectorAll(".focus-duration-pill").forEach((p) => p.classList.remove("active"));
  }
});

focusForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const domains = focusDomainsInput.value
    .split("\n")
    .map(normalizeDomain)
    .filter(Boolean);
  if (domains.length === 0) return;

  const minutes = focusCustomMinutes.value ? Number(focusCustomMinutes.value) : selectedFocusMinutes;
  if (!minutes || minutes <= 0) return;

  const endTime = Date.now() + minutes * 60 * 1000;
  await new Promise((resolve) =>
    chrome.runtime.sendMessage({ type: "START_FOCUS", domains, endTime }, resolve)
  );

  focusModalOverlay.classList.add("hidden");
  await updateFocusButtonState();
});

// Export data
exportBtn.addEventListener("click", async () => {
  const tasks = await loadTasks();
  const habits = await loadHabits();
  const completedTasks = await loadHistory();
  const result = await new Promise((resolve) =>
    chrome.storage.local.get([THEME_KEY], resolve)
  );
  const data = {
    tasks,
    habits,
    completedTasks,
    theme: result[THEME_KEY] || "dark",
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tasks-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  settingsMenu.classList.add("hidden");
});

// Import data
importBtn.addEventListener("click", () => {
  importFile.click();
});

importFile.addEventListener("change", async () => {
  const file = importFile.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!Array.isArray(data.tasks)) throw new Error("invalid format");

    await saveTasks(data.tasks);
    if (Array.isArray(data.habits)) {
      await saveHabits(data.habits);
    }
    if (Array.isArray(data.completedTasks)) {
      await saveHistory(data.completedTasks);
    }
    if (data.theme) {
      await new Promise((resolve) => chrome.storage.local.set({ [THEME_KEY]: data.theme }, resolve));
      applyTheme(data.theme);
    }
    await render();
    await renderHabits();
  } catch (err) {
    alert(t("importInvalid"));
  } finally {
    importFile.value = "";
    settingsMenu.classList.add("hidden");
  }
});

// ===== Habits =====

function todayStr() {
  return dateToStr(new Date());
}

function isHabitDoneToday(habit) {
  return habit.lastCompleted === todayStr();
}

function isHabitScheduledToday(habit) {
  const days = habit.days || [];
  if (days.length === 0 || days.length === 7) return true;
  const todayDow = new Date().getDay(); // 0=CN, 1=T2,...
  return days.includes(todayDow);
}

// Streak is simply the total number of days the habit has been completed.
function computeStreak(habit) {
  return (habit.completedDates || []).length;
}

function getHabitFreqText(habit) {
  if (habit.frequency === "daily" || (habit.days || []).length === 7) {
    return t("everyDay");
  }
  const dayKeys = ["daySun", "dayMon", "dayTue", "dayWed", "dayThu", "dayFri", "daySat"];
  return (habit.days || []).map((d) => t(dayKeys[d])).join(", ");
}

async function renderHabits() {
  const allHabits = await loadHabits();
  const habits = allHabits.filter((habit) => isHabitScheduledToday(habit) && !isHabitDoneToday(habit));

  if (habits.length === 0) {
    habitList.innerHTML = `<div class="empty"></div>`;
    habitDots.innerHTML = "";
    habitTotalPages = 0;
    return;
  }

  const totalPages = Math.ceil(habits.length / HABITS_PER_PAGE);
  habitTotalPages = totalPages;
  if (habitPage >= totalPages) habitPage = totalPages - 1;
  if (habitPage < 0) habitPage = 0;

  const pageHabits = habits.slice(
    habitPage * HABITS_PER_PAGE,
    habitPage * HABITS_PER_PAGE + HABITS_PER_PAGE
  );

  habitList.innerHTML = "";
  for (const habit of pageHabits) {
    const streak = computeStreak(habit);
    const done = isHabitDoneToday(habit);

    const card = document.createElement("div");
    card.className = "habit-card";
    card.dataset.id = habit.id;

    const freqText = getHabitFreqText(habit);

    card.innerHTML = `
      <div class="habit-icon">${escapeHtml(habit.emoji)}</div>
      <div class="habit-title">${escapeHtml(habit.title)}</div>
      <div class="habit-streak ${done ? "active" : ""}">
        ${streak > 0 ? `<i class="fa-solid fa-fire"></i> ${t("streakDays", streak)}` : freqText}
      </div>
      ${!done ? `<div class="habit-done-overlay">${t("markAsDone")}</div>` : ""}
    `;

    card.addEventListener("click", async () => {
      await toggleHabitToday(habit.id, card);
    });

    habitList.appendChild(card);
  }

  habitDots.innerHTML = "";
  if (totalPages > 1) {
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement("span");
      if (i === habitPage) dot.className = "active";
      dot.addEventListener("click", () => {
        habitPage = i;
        renderHabits();
      });
      habitDots.appendChild(dot);
    }
  }
}

async function toggleHabitToday(id, card) {
  const habits = await loadHabits();
  const habit = habits.find((h) => h.id === id);
  if (!habit) return;

  if (isHabitDoneToday(habit)) return;

  habit.lastCompleted = todayStr();
  habit.completedDates = habit.completedDates || [];
  habit.completedDates.push(todayStr());
  habit.streak = computeStreak(habit);

  card.classList.add("completed");
  await saveHabits(habits);

  setTimeout(async () => {
    await renderHabits();
  }, 400);
}

// Recompute streak/lastCompleted from completedDates after a removal
function recomputeHabitFromDates(habit) {
  const dates = [...(habit.completedDates || [])].sort();
  if (dates.length === 0) {
    habit.streak = 0;
    habit.lastCompleted = null;
    return;
  }

  habit.lastCompleted = dates[dates.length - 1];
  habit.streak = dates.length;
}

function resetHabitForm() {
  habitForm.reset();
  habitEditIdInput.value = "";
  const emoji = randomEmoji();
  habitEmojiInput.value = emoji;
  habitEmojiTrigger.textContent = emoji;
  const allPill = habitDays.querySelector(".habit-day-pill[data-all]");
  const singlePills = Array.from(habitDays.querySelectorAll(".habit-day-pill")).filter((p) => p !== allPill);
  allPill.classList.add("active");
  allPill.querySelector("input").checked = true;
  singlePills.forEach((p) => {
    p.classList.remove("active");
    p.querySelector("input").checked = false;
  });
  habitEmojiPopup.classList.add("hidden");
  habitSubmitBtn.classList.remove("hidden");
  habitDetailBack.classList.add("hidden");
  habitDeleteBtn.classList.add("hidden");
}

// Day pills
const habitDayPills = Array.from(habitDays.querySelectorAll(".habit-day-pill"));
const habitAllPill = habitDays.querySelector(".habit-day-pill[data-all]");
const habitSingleDayPills = habitDayPills.filter((pill) => pill !== habitAllPill);

habitDayPills.forEach((pill) => {
  pill.addEventListener("click", (e) => {
    e.preventDefault();
    if (pill === habitAllPill) {
      const allActive = !pill.classList.contains("active");
      pill.classList.toggle("active", allActive);
      pill.querySelector("input").checked = allActive;
      if (allActive) {
        habitSingleDayPills.forEach((p) => {
          p.classList.remove("active");
          p.querySelector("input").checked = false;
        });
      }
    } else {
      habitAllPill.classList.remove("active");
      habitAllPill.querySelector("input").checked = false;
      const active = !pill.classList.contains("active");
      pill.classList.toggle("active", active);
      pill.querySelector("input").checked = active;
    }
  });
});

async function renderHabitModalList() {
  const habits = await loadHabits();

  if (habits.length === 0) {
    habitModalList.innerHTML = `<li class="empty">${t("noHabitsYet")}</li>`;
    return;
  }

  habitModalList.innerHTML = "";
  for (const habit of habits) {
    const streak = computeStreak(habit);
    const freqText = getHabitFreqText(habit);

    const li = document.createElement("li");
    li.className = "habit-modal-item";
    li.dataset.id = habit.id;
    li.innerHTML = `
      <div class="task-icon"><span class="task-emoji">${escapeHtml(habit.emoji)}</span></div>
      <div class="habit-modal-info">
        <div class="habit-modal-title">${escapeHtml(habit.title)}</div>
        <div class="habit-modal-freq">${escapeHtml(freqText)}</div>
      </div>
      <div class="habit-modal-streak">${streak > 0 ? `<i class="fa-solid fa-fire"></i> ${streak}` : ""}</div>
    `;
    li.addEventListener("click", () => openHabitDetail(habit.id));
    habitModalList.appendChild(li);
  }
}

async function openHabitDetail(id) {
  const habits = await loadHabits();
  const habit = habits.find((h) => h.id === id);
  if (!habit) return;

  habitDetail.dataset.id = id;

  const dates = [...(habit.completedDates || [])].sort().reverse();
  if (dates.length === 0) {
    habitDetailList.innerHTML = `<li class="empty">${t("noDaysMarked")}</li>`;
  } else {
    habitDetailList.innerHTML = "";
    for (const date of dates) {
      const dateStr = new Date(date).toLocaleDateString(localeTag(), {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const li = document.createElement("li");
      li.className = "habit-detail-item";
      li.innerHTML = `
        <span>${escapeHtml(dateStr)}</span>
        <button type="button" class="habit-detail-remove" title="${t("deleteTitle")}"><i class="fa-solid fa-xmark"></i></button>
      `;
      li.querySelector(".habit-detail-remove").addEventListener("click", async () => {
        await removeHabitDate(id, date);
        await openHabitDetail(id);
        await renderHabitModalList();
      });
      habitDetailList.appendChild(li);
    }
  }

  // Populate form for editing
  habitEditIdInput.value = habit.id;
  habitEmojiInput.value = habit.emoji;
  habitEmojiTrigger.textContent = habit.emoji;
  habitTitleInput.value = habit.title;
  const savedDays = habit.days && habit.days.length > 0 ? habit.days : [0, 1, 2, 3, 4, 5, 6];
  const isAll = savedDays.length === 7;
  habitAllPill.classList.toggle("active", isAll);
  habitAllPill.querySelector("input").checked = isAll;
  habitSingleDayPills.forEach((pill) => {
    const input = pill.querySelector("input");
    const active = !isAll && savedDays.includes(Number(input.value));
    pill.classList.toggle("active", active);
    input.checked = active;
  });
  habitSubmitBtn.classList.add("hidden");
  habitDetailBack.classList.remove("hidden");
  habitDeleteBtn.classList.remove("hidden");

  habitModalList.classList.add("hidden");
  habitDetail.classList.remove("hidden");
}

async function removeHabitDate(id, date) {
  const habits = await loadHabits();
  const habit = habits.find((h) => h.id === id);
  if (!habit) return;

  habit.completedDates = (habit.completedDates || []).filter((d) => d !== date);
  recomputeHabitFromDates(habit);
  await saveHabits(habits);
}

habitDetailAddBtn.addEventListener("click", async () => {
  const id = habitDetail.dataset.id;
  if (!id) return;
  const dateVal = habitDetailAddDate.value;
  if (!dateVal) return;

  const habits = await loadHabits();
  const habit = habits.find((h) => h.id === id);
  if (!habit) return;

  habit.completedDates = habit.completedDates || [];
  if (!habit.completedDates.includes(dateVal)) {
    habit.completedDates.push(dateVal);
    recomputeHabitFromDates(habit);
    await saveHabits(habits);
  }

  habitDetailAddDate.value = "";
  await openHabitDetail(id);
  await renderHabitModalList();
});

habitDeleteBtn.addEventListener("click", async () => {
  const id = habitEditIdInput.value;
  if (!id) return;

  const habits = await loadHabits();
  const updated = habits.filter((h) => h.id !== id);
  await saveHabits(updated);

  habitEditIdInput.value = "";
  resetHabitForm();
  habitDetail.classList.add("hidden");
  habitModalList.classList.remove("hidden");
  await renderHabitModalList();
  await renderHabits();
});

function getHabitFormDays() {
  if (habitAllPill.classList.contains("active")) return [0, 1, 2, 3, 4, 5, 6];
  return habitSingleDayPills
    .filter((pill) => pill.querySelector("input").checked)
    .map((pill) => Number(pill.querySelector("input").value));
}

async function saveEditedHabit() {
  const editId = habitEditIdInput.value;
  if (!editId) return;

  const title = habitTitleInput.value.trim();
  if (!title) return;

  const days = getHabitFormDays();

  const habits = await loadHabits();
  const habit = habits.find((h) => h.id === editId);
  if (habit) {
    habit.emoji = habitEmojiInput.value.trim();
    habit.title = title;
    habit.frequency = "custom";
    habit.days = days;
  }
  await saveHabits(habits);
}

async function closeHabitDetail() {
  await saveEditedHabit();
  resetHabitForm();
  habitDetail.classList.add("hidden");
  habitModalList.classList.remove("hidden");
  await renderHabitModalList();
  await renderHabits();
}

habitDetailBack.addEventListener("click", async () => {
  await closeHabitDetail();
});

habitForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = habitTitleInput.value.trim();
  if (!title) return;

  const days = getHabitFormDays();

  const habits = await loadHabits();
  habits.push({
    id: crypto.randomUUID(),
    emoji: habitEmojiInput.value.trim(),
    title,
    frequency: "custom",
    days,
    streak: 0,
    lastCompleted: null,
    completedDates: [],
  });
  await saveHabits(habits);
  resetHabitForm();
  await renderHabitModalList();
  await renderHabits();
});

// Habit emoji picker
habitEmojiTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  const willShow = habitEmojiPopup.classList.contains("hidden");
  habitEmojiPopup.classList.toggle("hidden");
  if (willShow) positionEmojiPopup(habitEmojiTrigger, habitEmojiPopup);
});

habitEmojiPickerEl.addEventListener("emoji-click", (e) => {
  const emoji = e.detail.unicode;
  habitEmojiInput.value = emoji;
  habitEmojiTrigger.textContent = emoji;
  habitEmojiPopup.classList.add("hidden");
});

document.addEventListener("click", (e) => {
  if (!habitEmojiPopup.contains(e.target) && e.target !== habitEmojiTrigger) {
    habitEmojiPopup.classList.add("hidden");
  }
});

// Open/close habit modal
habitCreateBtn.addEventListener("click", async () => {
  if (!habitDetail.classList.contains("hidden")) {
    await closeHabitDetail();
  } else {
    resetHabitForm();
  }
  await renderHabitModalList();
  habitModalOverlay.classList.remove("hidden");
});

habitModalOverlay.addEventListener("click", async (e) => {
  if (e.target === habitModalOverlay) {
    if (!habitDetail.classList.contains("hidden")) {
      await closeHabitDetail();
    }
    habitModalOverlay.classList.add("hidden");
    await renderHabits();
  }
});

// Scroll wheel to change task page
taskList.addEventListener("wheel", (e) => {
  if (taskTotalPages <= 1) return;
  const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  if (delta === 0) return;
  e.preventDefault();

  if (delta > 0 && taskPage < taskTotalPages - 1) {
    taskPage++;
    render();
  } else if (delta < 0 && taskPage > 0) {
    taskPage--;
    render();
  }
}, { passive: false });

// Scroll wheel to change habit page
habitList.addEventListener("wheel", (e) => {
  if (habitTotalPages <= 1) return;
  const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  if (delta === 0) return;
  e.preventDefault();

  if (delta > 0 && habitPage < habitTotalPages - 1) {
    habitPage++;
    renderHabits();
  } else if (delta < 0 && habitPage > 0) {
    habitPage--;
    renderHabits();
  }
}, { passive: false });

async function init() {
  await loadLanguage();
  updateLanguageToggleLabel();
  resetForm();
  resetHabitForm();
  loadTheme();
  await render();
  await renderHabits();
  await updateFocusButtonState();
}

init();

setInterval(() => {
  render();
  renderHabits();
}, 60 * 1000);
setInterval(updateFocusButtonState, 1000);
