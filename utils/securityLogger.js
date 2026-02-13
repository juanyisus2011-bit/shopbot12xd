const { LOG_CHANNEL_ID } = require("./securityConfig");

module.exports = async function securityLogger(client, embed) {
  const channel = client.channels.cache.get(LOG_CHANNEL_ID);
  if (!channel) return;
  channel.send({ embeds: [embed] }).catch(() => {});
};
