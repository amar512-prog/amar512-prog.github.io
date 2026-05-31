const express = require("express");
const {
  findDevice,
  getKnownPageTitle,
  getPageMessages,
  insertMessage,
  touchDevice,
} = require("./database");
const { enforcePostRateLimit } = require("./rate-limit");
const {
  assertDeviceId,
  normalizeDisplayName,
  normalizeMessage,
  normalizePageKey,
  normalizePageTitle,
} = require("./validation");

const PORT = Number(process.env.PORT || 8788);
const app = express();

app.set("trust proxy", 1);
app.use(express.json({ limit: "8kb" }));

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (origin === "https://amar512-prog.github.io") {
    return true;
  }

  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}

app.use((req, res, next) => {
  const { origin } = req.headers;

  if (origin && !isAllowedOrigin(origin)) {
    return res.status(403).json({
      error: "This origin is not allowed to use the chat API.",
    });
  }

  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  return next();
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
  });
});

app.get("/api/chat/pages/:pageKey/messages", (req, res) => {
  try {
    const pageKey = normalizePageKey(req.params.pageKey);
    const deviceId = assertDeviceId(req.query.deviceId);
    const viewerProfile = findDevice(deviceId);

    if (viewerProfile) {
      touchDevice(deviceId);
    }

    return res.json({
      pageKey,
      pageTitle: getKnownPageTitle(pageKey),
      viewerProfile: {
        deviceId,
        displayName: viewerProfile?.display_name || null,
      },
      messages: getPageMessages(pageKey),
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
});

app.post("/api/chat/pages/:pageKey/messages", (req, res) => {
  try {
    const pageKey = normalizePageKey(req.params.pageKey);
    const deviceId = assertDeviceId(req.body.deviceId);
    const pageTitle = normalizePageTitle(req.body.pageTitle);
    const displayName = normalizeDisplayName(req.body.displayName);
    const message = normalizeMessage(req.body.message);
    const ipAddress = req.ip || "unknown";

    enforcePostRateLimit({
      ipAddress,
      deviceId,
    });

    const existingDevice = findDevice(deviceId);
    const savedDevice = touchDevice(
      deviceId,
      displayName || existingDevice?.display_name || null
    );
    const savedMessage = insertMessage({
      pageKey,
      pageTitle,
      deviceId,
      displayNameSnapshot: savedDevice?.display_name || null,
      body: message,
    });

    return res.status(201).json({
      pageKey,
      pageTitle,
      viewerProfile: {
        deviceId,
        displayName: savedDevice?.display_name || null,
      },
      message: savedMessage,
    });
  } catch (error) {
    const statusCode = error.message.includes("limit")
      ? 429
      : error.message.includes("wait a few seconds")
        ? 429
        : 400;

    return res.status(statusCode).json({
      error: error.message,
    });
  }
});

app.use((_req, res) => {
  res.status(404).json({
    error: "Not found.",
  });
});

app.listen(PORT, () => {
  console.log(`Chat API listening on port ${PORT}`);
});
