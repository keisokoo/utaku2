console.log("content loaded");
chrome.runtime.sendMessage({ loaded: true });

/**
 * @description
 * Chrome extensions don't support modules in content scripts.
 */
import("./components/App");
