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

const SUPPORT_CHANNEL_ID = "1469858941239427083";
const VOUCH_CHANNEL_ID = "1469860089614565599";

const SCAM_WORDS = ["scam", "scammer", "estafa", "estafador"];

// DATABASE PATH
const dataPath = path.join(process.cwd(), "database", "vouches.json");

// ==========================
module.exports = {
  data: new SlashCommandBuilder()
    .setName("vouch")
    .setDescription("Submit a vouch")
    .addUserOption(option =>
      option.setName("user").setDescription("User").setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("rating")
        .setDescription("1 to 5")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(5)
    )
    .addStringOption(option =>
      option.setName("message").setDescription("Message").setRequired(true)
    ),

  async execute(interaction) {

    // CHANNEL CHECK
    if (interaction.channelId !== VOUCH_CHANNEL_ID) {
      return interaction.reply({
        content: `❌ The /vouch command can only be used in <#${VOUCH_CHANNEL_ID}>.`,
        ephemeral: true
      });
    }

    const target = interaction.options.getUser("user");
    const rating = interaction.options.getInteger("rating");
    const message = interaction.options.getString("message");

    if (!ALLOWED_USERS.includes(target.id)) {
      return interaction.reply({
        content: "❌ You cannot vouch this user.",
        ephemeral: true
      });
    }

    if (interaction.user.id === target.id) {
      return interaction.reply({
        content: "❌ You cannot vouch yourself.",
        ephemeral: true
      });
    }

    // SCAM CHECK
    const lower = message.toLowerCase();
    if (SCAM_WORDS.some(w => lower.includes(w))) {
      return interaction.reply({
        content:
          `⚠️ **Scam Report Detected**\n\n` +
          `<@${interaction.user.id}>, if you had a problem with the seller, ` +
          `please open a ticket in <#${SUPPORT_CHANNEL_ID}>.`
      });
    }

    // LOAD DATABASE (ARRAY)
    let vouches = [];

    if (!fs.existsSync(path.dirname(dataPath))) {
      fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    }

    if (fs.existsSync(dataPath)) {
      vouches = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    }

    // SAVE VOUCH
    vouches.push({
      from: interaction.user.id,
      to: target.id,
      rating,
      message,
      timestamp: Date.now()
    });

    fs.writeFileSync(dataPath, JSON.stringify(vouches, null, 2));

    const stars = "⭐".repeat(rating);

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle("Vouch Submitted...")
      .setDescription(stars)
      .addFields(
        { name: "Message", value: message },
        { name: "User", value: `<@${target.id}>`, inline: true },
        {
          name: "Date",
          value: new Date().toLocaleString("es-ES"),
          inline: true
        }
      )
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: "Thanks for vouching!" })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};
