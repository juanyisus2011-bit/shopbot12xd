const tracker = new Map();

function getKey(userId, action) {
  return `${userId}_${action}`;
}

function checkLimit(userId, action, config) {
  const key = getKey(userId, action);
  const now = Date.now();

  if (!tracker.has(key)) {
    tracker.set(key, { count: 0, start: now });
  }

  const data = tracker.get(key);

  if (now - data.start > config.reset) {
    data.count = 0;
    data.start = now;
  }

  data.count++;

  const remaining = config.limit - data.count;

  return {
    exceeded: data.count > config.limit,
    remaining: remaining < 0 ? 0 : remaining
  };
}

module.exports = { checkLimit };
