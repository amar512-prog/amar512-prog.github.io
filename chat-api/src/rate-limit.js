const BURST_WINDOW_MS = 8_000;
const ROLLING_WINDOW_MS = 60_000;
const ROLLING_LIMIT = 5;
const ipBuckets = new Map();
const deviceBuckets = new Map();

function prune(timestamps, now) {
  return timestamps.filter((timestamp) => now - timestamp < ROLLING_WINDOW_MS);
}

function updateBucket(map, key, now) {
  const previous = map.get(key) || [];
  const next = prune(previous, now);
  map.set(key, next);
  return next;
}

function checkBurstLimit(timestamps, now) {
  const lastTimestamp = timestamps[timestamps.length - 1];

  if (lastTimestamp && now - lastTimestamp < BURST_WINDOW_MS) {
    throw new Error("Please wait a few seconds before posting again.");
  }
}

function checkRollingLimit(timestamps) {
  if (timestamps.length >= ROLLING_LIMIT) {
    throw new Error("You have reached the posting limit for the last minute.");
  }
}

function recordPost(map, key, now) {
  const timestamps = updateBucket(map, key, now);
  checkBurstLimit(timestamps, now);
  checkRollingLimit(timestamps);
  timestamps.push(now);
}

function enforcePostRateLimit({ ipAddress, deviceId, now = Date.now() }) {
  recordPost(ipBuckets, ipAddress, now);
  recordPost(deviceBuckets, deviceId, now);
}

module.exports = {
  enforcePostRateLimit,
};
