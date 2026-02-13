const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const axios = require("axios");
const fs = require("fs");

const filePath = "./kissCounts.json";

function loadData() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "{}");
  }
  return JSON.parse(fs.readFileSync(filePath));
}

function saveData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function createKey(id1, id2) {
  return [id1, id2].sort().join("-");
}

async function sendKiss(user1, user2, replyFunction) {

  if (user1.id === user2.id)
    return replyFunction("You can't kiss yourself 😭");

  const res = await axios.get("https://api.waifu.pics/sfw/kiss");
  const gif = res.data.url;

  const data = loadData();
  const key = createKey(user1.id, user2.id);

  if (!data[key]) data[key] = 0;
  data[key]++;

  saveData(data);

  const total = data[key];

  const embed = new EmbedBuilder()
    .setColor("#FF69B4")
    .setDescription(
      `${user1} gives a sweet kiss to ${user2} 💋\n\n` +
      `💞 They have kissed **${total} times**`
    )
    .setImage(gif);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`kiss_back_${user1.id}_${user2.id}`)
      .setLabel("💞 Kiss Back")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`kiss_reject_${user1.id}_${user2.id}`)
      .setLabel("❌ Reject")
      .setStyle(ButtonStyle.Danger)
  );

  await replyFunction({ embeds: [embed], components: [row] });
}

module.exports = {

  // 🔹 PREFIX
  name: "kiss",
  aliases: [],

  async execute(message, args) {
    const target =
      message.mentions.users.first() ||
      message.guild.members.cache.get(args[0])?.user;

    if (!target)
      return message.reply("You must mention someone to kiss.");

    await sendKiss(message.author, target, (data) =>
      message.reply(data)
    );
  },

  // 🔹 SLASH
  data: new SlashCommandBuilder()
    .setName("kiss")
    .setDescription("Kiss someone 💋")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("User to kiss")
        .setRequired(true)
    ),

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");

    await sendKiss(interaction.user, target, (data) =>
      interaction.reply(data)
    );
  }
};
