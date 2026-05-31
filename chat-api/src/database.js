const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const databasePath =
  process.env.DATABASE_PATH ||
  path.join(__dirname, "..", "data", "chat.sqlite");

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS devices (
    device_id TEXT PRIMARY KEY,
    display_name TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_key TEXT NOT NULL,
    page_title TEXT NOT NULL,
    device_id TEXT NOT NULL,
    display_name_snapshot TEXT,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (device_id) REFERENCES devices(device_id)
  );

  CREATE INDEX IF NOT EXISTS idx_messages_page_key_created_at
  ON messages (page_key, created_at DESC);
`);

const findDeviceStatement = db.prepare(`
  SELECT device_id, display_name, created_at, updated_at, last_seen_at
  FROM devices
  WHERE device_id = ?
`);

const upsertDeviceStatement = db.prepare(`
  INSERT INTO devices (
    device_id,
    display_name,
    created_at,
    updated_at,
    last_seen_at
  ) VALUES (
    @device_id,
    @display_name,
    @created_at,
    @updated_at,
    @last_seen_at
  )
  ON CONFLICT(device_id) DO UPDATE SET
    display_name = CASE
      WHEN excluded.display_name IS NOT NULL THEN excluded.display_name
      ELSE devices.display_name
    END,
    updated_at = excluded.updated_at,
    last_seen_at = excluded.last_seen_at
`);

const insertMessageStatement = db.prepare(`
  INSERT INTO messages (
    page_key,
    page_title,
    device_id,
    display_name_snapshot,
    body,
    created_at
  ) VALUES (
    @page_key,
    @page_title,
    @device_id,
    @display_name_snapshot,
    @body,
    @created_at
  )
`);

const getPageMessagesStatement = db.prepare(`
  SELECT id, page_key, page_title, device_id, display_name_snapshot, body, created_at
  FROM (
    SELECT *
    FROM messages
    WHERE page_key = ?
    ORDER BY created_at DESC, id DESC
    LIMIT 50
  )
  ORDER BY created_at ASC, id ASC
`);

const getPageTitleStatement = db.prepare(`
  SELECT page_title
  FROM messages
  WHERE page_key = ?
  ORDER BY created_at DESC, id DESC
  LIMIT 1
`);

function findDevice(deviceId) {
  return findDeviceStatement.get(deviceId) || null;
}

function touchDevice(deviceId, displayName = null) {
  const now = new Date().toISOString();

  upsertDeviceStatement.run({
    device_id: deviceId,
    display_name: displayName,
    created_at: now,
    updated_at: now,
    last_seen_at: now,
  });

  return findDevice(deviceId);
}

function insertMessage({
  pageKey,
  pageTitle,
  deviceId,
  displayNameSnapshot,
  body,
}) {
  const createdAt = new Date().toISOString();
  const result = insertMessageStatement.run({
    page_key: pageKey,
    page_title: pageTitle,
    device_id: deviceId,
    display_name_snapshot: displayNameSnapshot,
    body,
    created_at: createdAt,
  });

  return {
    id: result.lastInsertRowid,
    pageKey,
    pageTitle,
    deviceId,
    displayName: displayNameSnapshot,
    body,
    createdAt,
  };
}

function getPageMessages(pageKey) {
  return getPageMessagesStatement.all(pageKey).map((row) => ({
    id: row.id,
    pageKey: row.page_key,
    pageTitle: row.page_title,
    deviceId: row.device_id,
    displayName: row.display_name_snapshot,
    body: row.body,
    createdAt: row.created_at,
  }));
}

function getKnownPageTitle(pageKey) {
  return getPageTitleStatement.get(pageKey)?.page_title || null;
}

module.exports = {
  db,
  findDevice,
  getKnownPageTitle,
  getPageMessages,
  insertMessage,
  touchDevice,
};
