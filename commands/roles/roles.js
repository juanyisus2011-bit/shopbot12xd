const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = {
  name: "roles",

  async execute(message) {
    const roles = message.guild.roles.cache
      .filter(r => r.id !== message.guild.id) // remove @everyone
      .sort((a, b) => b.position - a.position)
      .map(role => role);

    if (!roles.length) {
      return message.channel.send("❌ This server has no roles.");
    }

    const rolesPerPage = 10;
    const totalPages = Math.ceil(roles.length / rolesPerPage);
    let page = 0;

    const generateEmbed = (page) => {
      const start = page * rolesPerPage;
      const end = start + rolesPerPage;
      const currentRoles = roles.slice(start, end);

      return new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("📜 Server Roles")
        .setDescription(
          currentRoles
            .map(
              (role, index) =>
                `**${start + index + 1}.** ${role} (ID: ${role.id})`
            )
            .join("\n")
        )
        .setFooter({
          text: `Page ${page + 1}/${totalPages} (${roles.length} roles total)`
        });
    };

    const row = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),

        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Next")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === totalPages - 1),

        new ButtonBuilder()
          .setCustomId("close")
          .setLabel("Close")
          .setStyle(ButtonStyle.Danger)
      );

    const msg = await message.channel.send({
      embeds: [generateEmbed(page)],
      components: [row()]
    });

    const collector = msg.createMessageComponentCollector({
      time: 60000
    });

    collector.on("collect", async (interaction) => {
      // ✅ Not restricted to command author
      if (interaction.customId === "prev") page--;
      if (interaction.customId === "next") page++;

      if (interaction.customId === "close") {
        collector.stop();
        return interaction.message.delete().catch(() => {});
      }

      await interaction.update({
        embeds: [generateEmbed(page)],
        components: [row()]
      });
    });

    collector.on("end", () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  }
};
