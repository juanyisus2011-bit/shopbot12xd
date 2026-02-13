const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "nuke",

  async execute(message) {
    // 🔒 Admin only
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const embed = new EmbedBuilder()
        .setColor(0xed4245) // red
        .setTitle("⚠️ Missing Permissions")
        .setDescription(
          "You do not have sufficient permissions to use this command.\n\n" +
          "**Required Permission:**\n" +
          "`Administrator`"
        );

      return message.channel.send({ embeds: [embed] });
    }

    const channel = message.channel;
    const position = channel.position;
    const parent = channel.parent;

    // Clone channel
    const newChannel = await channel.clone({
      name: channel.name,
      reason: `Nuke executed by ${message.author.tag}`
    });

    // Restore position & category
    await newChannel.setPosition(position);
    if (parent) await newChannel.setParent(parent.id);

    // Delete old channel
    await channel.delete();

    // Confirmation message
    const successEmbed = new EmbedBuilder()
      .setColor(0x57f287) // green
      .setTitle("💣 Channel Nuked")
      .setDescription("This channel has been successfully nuked.");

    newChannel.send({ embeds: [successEmbed] });
  }
};
