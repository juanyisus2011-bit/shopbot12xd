const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder
} = require("discord.js");

const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");

function createLoveBar(percent) {
  const total = 20;
  const filled = Math.round((percent / 100) * total);
  return "█".repeat(filled) + "░".repeat(total - filled);
}

function loveMessage(percent) {
  if (percent < 30) return "I think they would be better with someone else.";
  if (percent < 60) return "It might work... maybe.";
  if (percent < 85) return "They look cute together.";
  return "Soulmates 💍";
}

async function generateImage(user1, user2, percent) {

  // 🎨 Obtener imagen random de beso
  const response = await axios.get("https://api.waifu.pics/sfw/kiss");
  const bgImage = await loadImage(response.data.url);

  const canvas = createCanvas(800, 400);
  const ctx = canvas.getContext("2d");

  // Dibujar fondo
  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

  // Overlay oscuro
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Porcentaje grande
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 80px Sans";
  ctx.textAlign = "center";
  ctx.fillText(`${percent}%`, canvas.width / 2, 200);

  // Cargar avatares
  const avatar1 = await loadImage(
    user1.displayAvatarURL({ extension: "png", size: 256 })
  );

  const avatar2 = await loadImage(
    user2.displayAvatarURL({ extension: "png", size: 256 })
  );

  // Avatar 1
  ctx.save();
  ctx.beginPath();
  ctx.arc(200, 200, 100, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar1, 100, 100, 200, 200);
  ctx.restore();

  // Avatar 2
  ctx.save();
  ctx.beginPath();
  ctx.arc(600, 200, 100, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar2, 500, 100, 200, 200);
  ctx.restore();

  return canvas.toBuffer();
}

async function run(user1, user2, reply) {

  const percent = Math.floor(Math.random() * 101);

  const shipName =
    user1.username.slice(0, Math.floor(user1.username.length / 2)) +
    user2.username.slice(Math.floor(user2.username.length / 2));

  const bar = createLoveBar(percent);

  const buffer = await generateImage(user1, user2, percent);
  const attachment = new AttachmentBuilder(buffer, { name: "ship.png" });

  const embed = new EmbedBuilder()
    .setColor("#ff4d6d")
    .setTitle("💘 Love Calculator")
    .setDescription(
      `❤️ The ship name is **${shipName}**\n` +
      `❤️ Compatibility is **${percent}%**\n\n` +
      `\`${bar}\`\n\n` +
      `> ${loveMessage(percent)}`
    )
    .setImage("attachment://ship.png");

  await reply({ embeds: [embed], files: [attachment] });
}

module.exports = {

  // PREFIX
  name: "ship",
  aliases: [],

  async execute(message, args) {

    const user1 = message.mentions.users.first();
    const user2 = message.mentions.users.last();

    if (!user1 || !user2)
      return message.reply("You must mention two users.");

    await run(user1, user2, (data) =>
      message.reply(data)
    );
  },

  // SLASH
  data: new SlashCommandBuilder()
    .setName("ship")
    .setDescription("Calculate love between two users 💘")
    .addUserOption(option =>
      option.setName("user1")
        .setDescription("First user")
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName("user2")
        .setDescription("Second user")
        .setRequired(true)
    ),

  async executeSlash(interaction) {

    const user1 = interaction.options.getUser("user1");
    const user2 = interaction.options.getUser("user2");

    await run(user1, user2, (data) =>
      interaction.reply(data)
    );
  }
};
