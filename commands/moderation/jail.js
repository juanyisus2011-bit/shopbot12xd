const { PermissionsBitField, EmbedBuilder } = require("discord.js");

const JAIL_ROLE_ID = "1470798849575485440";
const LOG_USER_ID = "1402724870160257130";

const RED = 0xED4245;

module.exports = {
  name: "jail",
  async execute(message, args) {

    // ❌ No permission
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(RED)
            .setDescription(
              "⚠️ You do not have sufficient permissions to use this command.\n\n" +
              "**Required permission:** `Manage Roles`"
            )
        ]
      });
    }

    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);

    // ❌ No user
    if (!member) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(RED)
            .setDescription("❌ You must mention a valid user.")
        ]
      });
    }

    // ❌ Owner protection
    if (member.id === message.guild.ownerId) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(RED)
            .setDescription("❌ You cannot jail the server owner.")
        ]
      });
    }

    // ❌ Role hierarchy
    if (member.roles.highest.position >= message.member.roles.highest.position) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(RED)
            .setDescription(
              "❌ You cannot jail a member with an equal or higher role than yours."
            )
        ]
      });
    }

    // 🔐 Save current roles
    const previousRoles = member.roles.cache.filter(
      r => r.id !== message.guild.id && r.id !== JAIL_ROLE_ID
    );
    member.jailPreviousRoles = previousRoles.map(r => r.id);

    // 🧱 Assign jail role
    const jailRole = message.guild.roles.cache.get(JAIL_ROLE_ID);
    if (!jailRole) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(RED)
            .setDescription("❌ Jail role not found.")
        ]
      });
    }

    await member.roles.set([jailRole]);

    // 📩 DM to jailed user
    const dmEmbed = new EmbedBuilder()
      .setColor(RED)
      .setTitle("🔒 You have been jailed")
      .setDescription(
        `**Server:** ${message.guild.name}\n` +
        `**Moderator:** ${message.author.tag}\n` +
        `**Duration:** Indefinite\n` +
        `**Reason:** No reason provided\n\n` +
        `If you wish to appeal this punishment, please contact a staff member.`
      )
      .setTimestamp();

    member.send({ embeds: [dmEmbed] }).catch(() => {});

    // 📬 DM log user
    const logUser = await message.client.users.fetch(LOG_USER_ID).catch(() => null);
    if (logUser) {
      const logEmbed = new EmbedBuilder()
        .setColor(RED)
        .setTitle("🚨 User Jailed")
        .addFields(
          { name: " User", value: `${member.user.tag} (${member.id})` },
          { name: " Moderator", value: message.author.tag },
          { name: " Server", value: message.guild.name }
        )
        .setTimestamp();

      logUser.send({ embeds: [logEmbed] }).catch(() => {});
    }

    // ✅ Channel message
    message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(RED)
          .setDescription(
            `🔒 ${member} has been **jailed** by ${message.author}.`
          )
      ]
    });
  }
};
