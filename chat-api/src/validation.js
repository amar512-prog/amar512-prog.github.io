const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PAGE_KEY_PATTERN = /^[a-zA-Z0-9/_-]+\.html$/;

function normalizeTrimmedString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function isUuid(value) {
  return UUID_PATTERN.test(value);
}

function assertDeviceId(value) {
  const deviceId = normalizeTrimmedString(value);

  if (!isUuid(deviceId)) {
    throw new Error("A valid device ID is required.");
  }

  return deviceId;
}

function normalizeDisplayName(value) {
  const displayName = normalizeTrimmedString(value);

  if (!displayName) {
    return null;
  }

  if (displayName.length > 40) {
    throw new Error("Name or GitHub handle must be 40 characters or fewer.");
  }

  return displayName;
}

function normalizeMessage(value) {
  const message = normalizeTrimmedString(value);

  if (!message) {
    throw new Error("Message cannot be empty.");
  }

  if (message.length > 500) {
    throw new Error("Message must be 500 characters or fewer.");
  }

  return message;
}

function normalizePageKey(value) {
  const pageKey = normalizeTrimmedString(value).replace(/^\/+/, "");

  if (!pageKey) {
    throw new Error("Page key is required.");
  }

  if (!PAGE_KEY_PATTERN.test(pageKey) || pageKey.includes("..")) {
    throw new Error("Page key is not valid.");
  }

  return pageKey;
}

function normalizePageTitle(value) {
  const pageTitle = normalizeTrimmedString(value);

  if (!pageTitle) {
    throw new Error("Page title is required.");
  }

  if (pageTitle.length > 160) {
    throw new Error("Page title must be 160 characters or fewer.");
  }

  return pageTitle;
}

module.exports = {
  assertDeviceId,
  normalizeDisplayName,
  normalizeMessage,
  normalizePageKey,
  normalizePageTitle,
};
