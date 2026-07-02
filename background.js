const FOCUS_KEY = "focusSession";
const RULE_ID_BASE = 1000;

function domainToRuleFilter(domain) {
  return `||${domain}^`;
}

async function applyFocusRules(domains) {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map((r) => r.id);

  const addRules = domains.map((domain, i) => ({
    id: RULE_ID_BASE + i,
    priority: 1,
    action: {
      type: "redirect",
      redirect: { extensionPath: "/blocked.html" },
    },
    condition: {
      requestDomains: [domain],
      resourceTypes: ["main_frame"],
    },
  }));

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules,
  });
}

async function clearFocusRules() {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map((r) => r.id);
  if (removeRuleIds.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds });
  }
}

async function startFocus(domains, endTime) {
  await chrome.storage.local.set({
    [FOCUS_KEY]: { domains, endTime, active: true },
  });
  await applyFocusRules(domains);
  chrome.alarms.create("focus-end", { when: endTime });
}

async function addFocusDomains(newDomains) {
  const result = await chrome.storage.local.get([FOCUS_KEY]);
  const session = result[FOCUS_KEY];
  if (!session || !session.active || Date.now() >= session.endTime) {
    throw new Error("no active focus session");
  }

  const domains = Array.from(new Set([...session.domains, ...newDomains]));
  await chrome.storage.local.set({
    [FOCUS_KEY]: { ...session, domains },
  });
  await applyFocusRules(domains);
}

async function endFocus() {
  await chrome.storage.local.set({
    [FOCUS_KEY]: { domains: [], endTime: 0, active: false },
  });
  await clearFocusRules();
  chrome.alarms.clear("focus-end");
}

chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get([FOCUS_KEY]);
  const session = result[FOCUS_KEY];
  if (session && session.active) {
    if (Date.now() >= session.endTime) {
      await endFocus();
    } else {
      await applyFocusRules(session.domains);
      chrome.alarms.create("focus-end", { when: session.endTime });
    }
  }
});

chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.local.get([FOCUS_KEY]);
  const session = result[FOCUS_KEY];
  if (session && session.active) {
    if (Date.now() >= session.endTime) {
      await endFocus();
    } else {
      await applyFocusRules(session.domains);
      chrome.alarms.create("focus-end", { when: session.endTime });
    }
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "focus-end") {
    await endFocus();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_FOCUS") {
    startFocus(message.domains, message.endTime)
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }
  if (message.type === "ADD_FOCUS_DOMAINS") {
    addFocusDomains(message.domains)
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }
});
