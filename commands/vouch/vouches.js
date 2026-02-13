const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");
const fs = require("fs");
const path = require("path");

// ==========================
// CONFIG
const ALLOWED_USERS = [
  "879100606135033896",
  "1402724870160257130"
];

// DATABASE PATH (CORRECTO)
const dataPath = path.join(process.cwd(), "database", "vouches.json");

// ==========================
module.exports = {
  data: new SlashCommandBuilder()
    .setName("vouches")
    .setDescription("View vouches of a user")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("User")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");

    // ONLY ALLOWED USERS
    if (!ALLOWED_USERS.includes(user.id)) {
      return interaction.reply({
        content: "❌ You cannot view vouches for this user.",
        ephemeral: true
      });
    }

    // FILE EXISTS?
    if (!fs.existsSync(dataPath)) {
      return interaction.reply({
        content: "❌ No vouch data found.",
        ephemeral: true
      });
    }

    const vouches = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    // FILTER ARRAY
    const userVouches = vouches.filter(v => v.to === user.id);

if (userVouches.length === 0) {
  return interaction.reply({
    content: `ℹ️ <@${user.id}> does not have any vouches yet.`,
    ephemeral: true
  });
}

    const total = userVouches.length;
    const avg = (
      userVouches.reduce((sum, v) => sum + v.rating, 0) / total
    ).toFixed(2);

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle(`Vouches for ${user.username}`)
      .addFields(
        { name: "Total Vouches", value: `${total}`, inline: true },
        { name: "Average Rating", value: `${avg} ⭐`, inline: true }
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
