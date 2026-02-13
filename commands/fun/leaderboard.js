const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const leaderboardPath = path.join(__dirname, "../../database/leaderboard.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View trivia leaderboard")
    .addStringOption(option =>
      option.setName("category")
        .setDescription("Choose leaderboard category")
        .setRequired(true)
        .addChoices(
          { name: "Solo", value: "solo" },
          { name: "Multiplayer", value: "duel" }
        )
    ),

  async executeSlash(interaction) {

    if (!fs.existsSync(leaderboardPath)) {
      return interaction.reply({ content: "No data yet.", flags: 64 });
    }

    const category = interaction.options.getString("category");
    const data = JSON.parse(fs.readFileSync(leaderboardPath));

    if (!data[category] || Object.keys(data[category]).length === 0) {
      return interaction.reply({ content: "No wins yet.", flags: 64 });
    }

    // ORDEN: HARD -> MEDIUM -> EASY
    const difficulties = ["hard", "medium", "easy"];

    let description = "";

    for (const diff of difficulties) {

      const sorted = Object.entries(data[category])
        .sort((a, b) => b[1][diff] - a[1][diff])
        .filter(user => user[1][diff] > 0);

      description += `**${diff.toUpperCase()}**\n\n`;

      if (sorted.length === 0) {
        description += "No wins yet.\n\n";
        continue;
      }

      sorted.slice(0, 10).forEach(([userId, stats]) => {
        description += `<@${userId}> — ${stats[diff]} wins\n`;
      });

      description += "\n";
    }

    const embed = new EmbedBuilder()
      .setColor(category === "solo" ? "Blue" : "Red")
      .setTitle(category === "solo" ? "🧠 Solo Leaderboard" : "⚔️ Multiplayer Leaderboard")
      .setDescription(description);

    interaction.reply({ embeds: [embed] });
  }
};
