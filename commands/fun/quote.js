const {
  AttachmentBuilder,
  SlashCommandBuilder
} = require("discord.js");
const Canvas = require("canvas");

const usageMap = new Map();

module.exports = {
  name: "quote",
  description: "Create a cinematic reflective quote banner",

  data: new SlashCommandBuilder()
    .setName("quote")
    .setDescription("Create a cinematic reflective quote banner")
    .addStringOption(option =>
      option
        .setName("text")
        .setDescription("The quote text")
        .setRequired(true)
    ),

  async execute(input, args) {
    let quote;
    let user;

    // Detect slash or prefix
    if (input.isChatInputCommand) {
      quote = input.options.getString("text");
      user = input.user;
      await input.deferReply();
    } else {
      if (!args.length) {
        return input.reply("Please provide a quote.");
      }
      quote = args.join(" ");
      user = input.author;
    }

    // Cooldown system
    const userId = user.id;
    const now = Date.now();
    const cooldownTime = 3 * 60 * 1000; // 3 minutes
    const maxUses = 3;

    if (!usageMap.has(userId)) {
      usageMap.set(userId, { uses: 1, firstUse: now });
    } else {
      const userData = usageMap.get(userId);

      if (now - userData.firstUse < cooldownTime) {
        if (userData.uses >= maxUses) {
          const timeLeft = Math.ceil(
            (cooldownTime - (now - userData.firstUse)) / 1000
          );

          const msg = `You must wait ${timeLeft} seconds before using this command again.`;

          if (input.isChatInputCommand) {
            return input.editReply(msg);
          } else {
            return input.reply(msg);
          }
        }

        userData.uses += 1;
      } else {
        usageMap.set(userId, { uses: 1, firstUse: now });
      }
    }

    try {
      const canvas = Canvas.createCanvas(1000, 500);
      const ctx = canvas.getContext("2d");

      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, 1000, 500);
      gradient.addColorStop(0, "#0f0f0f");
      gradient.addColorStop(1, "#1c1c1c");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle light overlay
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load avatar
      const avatar = await Canvas.loadImage(
        user.displayAvatarURL({ extension: "png", size: 512 })
      );

      // Circular faded avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(800, 250, 150, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      ctx.globalAlpha = 0.25;
      ctx.drawImage(avatar, 650, 100, 300, 300);
      ctx.restore();
      ctx.globalAlpha = 1;

      // Quote text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 48px Sans";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 15;

      wrapText(ctx, `"${quote}"`, 400, 200, 600, 60);

      // Decorative line
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(250, 300, 300, 3);

      // Signature
      ctx.font = "italic 24px Sans";
      ctx.fillStyle = "#bbbbbb";
      ctx.fillText(`— ${user.username}`, 400, 350);

      const attachment = new AttachmentBuilder(canvas.toBuffer(), {
        name: "quote.png",
      });

      if (input.isChatInputCommand) {
        return input.editReply({ files: [attachment] });
      } else {
        return input.reply({ files: [attachment] });
      }

    } catch (error) {
      console.error(error);

      const msg = "An error occurred while generating the image.";

      if (input.isChatInputCommand) {
        return input.editReply(msg);
      } else {
        return input.reply(msg);
      }
    }
  },
};

// Auto text wrapping
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line, x, y);
}
