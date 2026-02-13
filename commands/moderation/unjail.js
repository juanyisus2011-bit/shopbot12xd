const { PermissionsBitField, EmbedBuilder } = require("discord.js");

const JAIL_ROLE_ID = "1470798849575485440";
const LOG_USER_ID = "1402724870160257130";

module.exports = {
  name: "unjail",
  async execute(message, args) {

    // ❌ No permission
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#ED4245")
            .setDescription("⚠️ You do not have sufficient permissions to use this command.\n\n**Required permission:** `Manage Roles`")
        ]
      });
    }

    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);

    // ❌ No user provided
    if (!member) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#FAA61A")
            .setDescription("⚠️ You must mention a valid user.")
        ]
      });
    }

    // ❌ Not jailed
    if (!member.roles.cache.has(JAIL_ROLE_ID)) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#FAA61A")
            .setDescription("ℹ️ This user is **not jailed**.")
        ]
      });
    }

    // ✅ Restore previous roles
    const rolesToRestore = member.jailPreviousRoles || [];
    await member.roles.set(rolesToRestore.length ? rolesToRestore : []);

    // 📩 DM to unjailed user
    const userEmbed = new EmbedBuilder()
      .setColor("#57F287")
      .setTitle("🔓 You have been unjailed")
      .setDescription(`You have been released in **${message.guild.name}** 🔥`)
      .addFields(
        { name: "👮 Moderator", value: message.author.tag, inline: true },
        { name: "⏳ Status", value: "Completed", inline: true }
      )
      .setTimestamp();

    member.send({ embeds: [userEmbed] }).catch(() => {});

    // 📩 DM to log user
    const logUser = await message.client.users.fetch(LOG_USER_ID).catch(() => null);
    if (logUser) {
      const logEmbed = new EmbedBuilder()
        .setColor("#57F287")
        .setTitle("🔓 User Unjailed")
        .addFields(
          { name: " User", value: `${member.user.tag} (${member.id})` },
          { name: " Moderator", value: message.author.tag },
          { name: " Server", value: message.guild.name }
        )
        .setTimestamp();

      logUser.send({ embeds: [logEmbed] }).catch(() => {});
    }

    // ✅ Channel confirmation
    message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#57F287")
          .setDescription(`✅ ${member} has been **successfully unjailed**.`)
      ]
    });
  }
};
