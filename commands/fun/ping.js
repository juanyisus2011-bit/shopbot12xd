const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ping",

  async execute(message, args, client) {
    const wsPing = client.ws.ping;
    const apiPing = Date.now() - message.createdTimestamp;

    let status = "🟢 Excellent";
    if (wsPing > 150) status = "🟡 Normal";
    if (wsPing > 300) status = "🔴 Slow";

    const embed = new EmbedBuilder()
      .setColor("#2ecc71")
      .setTitle("📡 Connection Speed")
      .addFields(
        {
          name: "WebSocket",
          value: `${wsPing}ms`,
          inline: true,
        },
        {
          name: "Message",
          value: `${apiPing}ms`,
          inline: true,
        },
        {
          name: "Status",
          value: status,
          inline: true,
        }
      )
      .setFooter({ text: "Real-time response" })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },
};
