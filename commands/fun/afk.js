const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "afk",
  description: "Sets your AFK status with a message.",

  async execute(message, args, client) {
    if (!message.guild) return;

    const afkMessage = args.join(" ") || "AFK";

    // Bot permission
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
      return message.channel.send("❌ I don't have permission to change your nickname.");
    }

    const member = await message.guild.members.fetch(message.author.id).catch(() => null);
    if (!member) return;

    const isOwner = message.guild.ownerId === member.id;

    // Save AFK
    if (!client.afkData) client.afkData = new Map();
    client.afkData.set(member.id, {
      afk: true,
      start: new Date(),
      oldNickname: member.nickname || member.user.username,
      message: afkMessage
    });

    // Change nickname only if NOT the owner
    if (!isOwner) {
      let newNickname = `[AFK] ${member.displayName}`;
      if (newNickname.length > 32) newNickname = newNickname.slice(0, 32);
      await member.setNickname(newNickname).catch(() => null);
    } else {
      // If owner, send DM explaining nickname can't be changed
      const dmEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setDescription(
          `⚠️ Your nickname cannot be changed because you are the server owner.\nYour AFK status: **${afkMessage}**`
        );
      await message.author.send({ embeds: [dmEmbed] }).catch(() => {
        message.channel.send("⚠️ I couldn't send you a DM, please check your privacy settings.");
      });
    }

    // Confirmation embed in channel
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(`✅ <@${member.id}> is now AFK: ${afkMessage}`);

    message.channel.send({ embeds: [embed] });
  }
};
