const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "messageUpdate",

  async execute(oldMessage, newMessage) {
    if (!oldMessage.guild) return;
    if (!oldMessage.author || oldMessage.author.bot) return;
    if (oldMessage.content === newMessage.content) return;

    const channel = oldMessage.client.channels.cache.get("1470808028772176039");
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle("04 – ✏️ Message Edited")
      .addFields(
        { name: "Author", value: `${oldMessage.author.tag} (${oldMessage.author.id})` },
        { name: "Channel", value: `<#${oldMessage.channel.id}>` },
        { name: "Before", value: oldMessage.content || "*Empty*" },
        { name: "After", value: newMessage.content || "*Empty*" }
      )
      .setTimestamp();

    channel.send({ embeds: [embed] });
  }
};
 