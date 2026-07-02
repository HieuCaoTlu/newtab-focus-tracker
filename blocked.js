const FOCUS_KEY = "focusSession";
const countdownEl = document.getElementById("countdown");

function formatDuration(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const parts = [m, s].map((n) => String(n).padStart(2, "0"));
  if (h > 0) parts.unshift(String(h).padStart(2, "0"));
  return parts.join(":");
}

function tick() {
  chrome.storage.local.get([FOCUS_KEY], (result) => {
    const session = result[FOCUS_KEY];
    if (!session || !session.active) {
      countdownEl.textContent = t("blockedEnded");
      return;
    }
    const remaining = session.endTime - Date.now();
    if (remaining <= 0) {
      countdownEl.textContent = t("blockedEnded");
      return;
    }
    countdownEl.textContent = formatDuration(remaining);
  });
}

loadLanguage().then(tick);
setInterval(tick, 1000);
