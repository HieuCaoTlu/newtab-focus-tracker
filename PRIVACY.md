# Privacy Policy — Newtab Focus Tracker

Last updated: 2026-07-02

## Overview

Newtab Focus Tracker is a Chrome/Edge extension that replaces the new tab page with a personal productivity dashboard: task management, habit tracking, and a Focus mode that blocks distracting websites.

**This extension does not collect, transmit, sell, or share any user data.**

## Data storage

All data you create in this extension — tasks, habits, completed history, theme preference, language preference, and Focus session settings (including the list of domains you choose to block) — is stored **locally on your device** using the browser's built-in `chrome.storage.local` API.

This data:
- Never leaves your device
- Is never sent to any external server
- Is never shared with the developer or any third party
- Is only accessible to this extension, on your own browser profile

## Permissions

| Permission | Purpose |
|---|---|
| `storage` | Save your tasks, habits, and settings locally on your device. |
| `declarativeNetRequest` | Redirect blocked domains to a local page during an active Focus session. |
| `alarms` | Automatically end a Focus session at the time you selected. |
| Host permission (`<all_urls>`) | Required so Focus mode can block any domain you choose to enter — the list is defined by you at runtime and not known in advance. |

None of these permissions are used to collect, read, or transmit your browsing data.

## Remote code

This extension does not load or execute any remote code. All scripts and resources are bundled within the extension package.

## Third-party services

This extension does not use any third-party analytics, advertising, or tracking services.

## Changes to this policy

If this policy changes in the future, the updated version will be published at this same location with a revised "Last updated" date.

## Contact

For questions about this privacy policy, please open an issue on the project's GitHub repository.
