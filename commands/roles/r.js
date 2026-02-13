const {
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

module.exports = {
  name: "r",

  async execute(message, args) {
    // 🔐 Permission check
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "⚠️ **You do not have sufficient permissions to use this command.**\n\n" +
              "**Required permission:** `Manage Roles`"
            )
        ],
        allowedMentions: { repliedUser: false }
      });
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.channel.send("⚠️ Mention a user.");
    }

    const query = args.slice(1).join(" ").toLowerCase();
    if (!query) {
      return message.channel.send("⚠️ Type the role name.");
    }

    // 🔒 Target user hierarchy
    if (member.roles.highest.position >= message.member.roles.highest.position) {
      return message.channel.send(
        "❌ You cannot manage roles of someone with equal or higher rank than you."
      );
    }

    // 🔒 Bot hierarchy
    if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
      return message.channel.send("❌ I cannot modify this user.");
    }

    const roles = message.guild.roles.cache;

    // 🔍 Find matching roles
    const matches = roles.filter(r =>
      r.name.toLowerCase().includes(query)
    );

    if (matches.size === 0) {
      return message.channel.send("❌ No roles found with that name.");
    }

    // 🔄 Filter roles user CAN give
    const validRoles = matches.filter(
      r => r.position < message.member.roles.highest.position
    );

    if (validRoles.size === 0) {
      return message.channel.send(
        "❌ You cannot give this role because it is equal or higher than your highest role."
      );
    }

    // 🟢 Single role
    if (validRoles.size === 1) {
      return toggleRole(message, member, validRoles.first());
    }

    // 🟡 Multiple roles → select menu
    const menu = new StringSelectMenuBuilder()
      .setCustomId("select-role")
      .setPlaceholder("Select the correct role")
      .addOptions(
        validRoles.map(r => ({
          label: r.name,
          value: r.id
        })).slice(0, 25)
      );

    const row = new ActionRowBuilder().addComponents(menu);

    const msg = await message.channel.send({
      content: "🔎 Multiple roles found. Select one:",
      components: [row]
    });

    const collector = msg.createMessageComponentCollector({ time: 15000 });

    collector.on("collect", async interaction => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({
          content: "❌ This is not your command.",
          ephemeral: true
        });
      }

      const role = message.guild.roles.cache.get(interaction.values[0]);

      // Re-check hierarchy
      if (role.position >= message.member.roles.highest.position) {
        return interaction.reply({
          content: "❌ You cannot give this role because it is equal or higher than your highest role.",
          ephemeral: true
        });
      }

      await toggleRole(message, member, role);
      await interaction.update({ components: [] });
    });
  }
};

// 🔁 HELPER FUNCTION
async function toggleRole(message, member, role) {
  if (member.roles.cache.has(role.id)) {
    await member.roles.remove(role);
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setDescription(`❌ Removed role **${role.name}** from ${member}`)
      ],
      allowedMentions: { repliedUser: false }
    });
  } else {
    await member.roles.add(role);
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setDescription(`✅ Added role **${role.name}** to ${member}`)
      ],
      allowedMentions: { repliedUser: false }
    });
  }
}
