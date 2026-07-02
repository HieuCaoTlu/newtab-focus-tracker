const LANG_KEY = "language";
const DEFAULT_LANG = "en";

const TRANSLATIONS = {
  en: {
    tasksTitle: "Tasks",
    focusBtn: "Focus",
    focusTitle: "Focus",
    focusActiveTitle: "Focused",
    historyToggleTitle: "Completed history",
    settingsTitle: "Settings",
    themeToggle: "Toggle theme",
    themeLight: "Light",
    themeDark: "Dark",
    languageToggle: "Language",
    exportBtn: "Export data",
    importBtn: "Import data",
    taskTitlePlaceholder: "Task name",
    addBtn: "Add",
    completeTitle: "Complete",
    deleteTitle: "Delete",
    habitsTitle: "Habits",
    createHabitTitle: "Create new habit",
    backTitle: "Back",
    habitTitlePlaceholder: "Habit name",
    dayAll: "All",
    dayMon: "Monday",
    dayTue: "Tuesday",
    dayWed: "Wednesday",
    dayThu: "Thursday",
    dayFri: "Friday",
    daySat: "Saturday",
    daySun: "Sunday",
    addDayTitle: "Add day",
    completedTitle: "Completed",
    focusDomainsLabel: "Domains to block (one per line)",
    focusDurationLabel: "Focus duration",
    duration25: "25 min",
    duration45: "45 min",
    duration60: "1 hour",
    duration120: "2 hours",
    focusCustomPlaceholder: "Or enter custom minutes",
    focusStartBtn: "Start Focus",
    focusActiveHint: "The following domains are blocked until time runs out:",
    focusAddDomainPlaceholder: "Add a domain, e.g. reddit.com",
    addTitle: "Add",
    todayText: "Today",
    oneDayLeft: "1 day left",
    daysLeft: (n) => `${n} days left`,
    overdueDays: (n) => `Overdue by ${n} days`,
    noCompletedTasks: "No completed tasks yet",
    completedOn: (date) => `Completed: ${date}`,
    noHabitsYet: "No habits yet",
    noDaysMarked: "No days marked yet",
    everyDay: "Every day",
    streakDays: (n) => `${n} days`,
    markAsDone: "Mark as done",
    importInvalid: "Could not import data: invalid file.",
    focusActiveButtonTitle: "Focus mode is active",
    blockedTitle: "Focus Mode Active",
    blockedHeading: "You're in Focus Mode",
    blockedText: "This site is blocked so you can stay focused.",
    blockedEnded: "Session ended",
  },
  vi: {
    tasksTitle: "Công việc",
    focusBtn: "Tập trung",
    focusTitle: "Tập trung",
    focusActiveTitle: "Đang tập trung",
    historyToggleTitle: "Lịch sử hoàn thành",
    settingsTitle: "Cài đặt",
    themeToggle: "Đổi giao diện",
    themeLight: "Sáng",
    themeDark: "Tối",
    languageToggle: "Ngôn ngữ",
    exportBtn: "Xuất dữ liệu",
    importBtn: "Nhập dữ liệu",
    taskTitlePlaceholder: "Tên công việc",
    addBtn: "Thêm",
    completeTitle: "Hoàn thành",
    deleteTitle: "Xóa",
    habitsTitle: "Thói quen",
    createHabitTitle: "Tạo thói quen mới",
    backTitle: "Quay lại",
    habitTitlePlaceholder: "Tên thói quen",
    dayAll: "Tất cả",
    dayMon: "T2",
    dayTue: "T3",
    dayWed: "T4",
    dayThu: "T5",
    dayFri: "T6",
    daySat: "T7",
    daySun: "CN",
    addDayTitle: "Thêm ngày",
    completedTitle: "Đã hoàn thành",
    focusDomainsLabel: "Tên miền muốn chặn (mỗi dòng một tên miền)",
    focusDurationLabel: "Thời gian tập trung",
    duration25: "25 phút",
    duration45: "45 phút",
    duration60: "1 giờ",
    duration120: "2 giờ",
    focusCustomPlaceholder: "Hoặc nhập số phút tùy chỉnh",
    focusStartBtn: "Bắt đầu Focus",
    focusActiveHint: "Các tên miền sau đang bị chặn cho đến khi hết giờ:",
    focusAddDomainPlaceholder: "Thêm tên miền, VD: reddit.com",
    addTitle: "Thêm",
    todayText: "Hôm nay",
    oneDayLeft: "Còn 1 ngày",
    daysLeft: (n) => `Còn ${n} ngày`,
    overdueDays: (n) => `Quá hạn ${n} ngày`,
    noCompletedTasks: "Chưa có công việc đã hoàn thành",
    completedOn: (date) => `Hoàn thành: ${date}`,
    noHabitsYet: "Chưa có thói quen nào",
    noDaysMarked: "Chưa có ngày nào được đánh dấu",
    everyDay: "Mọi ngày",
    streakDays: (n) => `${n} ngày`,
    markAsDone: "Đánh dấu xong",
    importInvalid: "Không thể nhập dữ liệu: file không hợp lệ.",
    focusActiveButtonTitle: "Đang trong chế độ Focus",
    blockedTitle: "Đang trong chế độ Tập trung",
    blockedHeading: "Bạn đang trong chế độ tập trung",
    blockedText: "Trang này đã bị chặn để bạn hoàn toàn tập trung.",
    blockedEnded: "Đã kết thúc",
  },
};

let currentLang = DEFAULT_LANG;

function t(key, ...args) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS[DEFAULT_LANG];
  const entry = dict[key] ?? TRANSLATIONS[DEFAULT_LANG][key];
  return typeof entry === "function" ? entry(...args) : entry;
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
}

async function loadLanguage() {
  const result = await new Promise((resolve) => chrome.storage.local.get([LANG_KEY], resolve));
  currentLang = result[LANG_KEY] === "vi" ? "vi" : DEFAULT_LANG;
  applyTranslations();
}

async function setLanguage(lang) {
  currentLang = lang === "vi" ? "vi" : "en";
  await new Promise((resolve) => chrome.storage.local.set({ [LANG_KEY]: currentLang }, resolve));
  applyTranslations();
}

function getLanguage() {
  return currentLang;
}
