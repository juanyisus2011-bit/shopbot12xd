const { Collection, EmbedBuilder } = require("discord.js");

const snipes = new Collection();

module.exports = {
  name: "messageDelete",

  async execute(message) {
    if (!message.guild) return;
    if (!message.author || message.author.bot) return;

    if (!snipes.has(message.channel.id)) snipes.set(message.channel.id, []);
    const channelSnipes = snipes.get(message.channel.id);

    channelSnipes.unshift({
      content: message.content || "[No content / Attachment]",
      author: message.author.tag,
      authorId: message.author.id,
      deletedAt: new Date(),
      createdAt: message.createdAt,
      deleter: null
    });

    if (channelSnipes.length > 10) channelSnipes.pop();
    snipes.set(message.channel.id, channelSnipes);

    const channel = message.client.channels.cache.get("1470808028772176039");
    if (channel) {
      const content = message.content?.slice(0, 1024) || "No content";
      const embed = new EmbedBuilder()
        .setColor(0xe67e22)
        .setTitle("🗑️ Message Deleted")
        .addFields(
          { name: "Author", value: `${message.author.tag} (${message.author.id})` },
          { name: "Channel", value: `<#${message.channel.id}>` },
          { name: "Content", value: content }
        )
        .setTimestamp();

      channel.send({ embeds: [embed] });
    }
  },

   snipesCollection: snipes
};

