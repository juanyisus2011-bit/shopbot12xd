const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "c",
  aliases: ["purge", "clear"],

  async execute(message, args) {
    if (message.author.bot) return;

    // 🔒 Permission check
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      const embed = new EmbedBuilder()
        .setColor(0xed4245)
        .setTitle("⚠️ Missing Permissions")
        .setDescription(
          "You do not have sufficient permissions to use this command.\n\n" +
          "**Required Permission:**\n" +
          "`Manage Messages`"
        );

      return message.channel.send({ embeds: [embed] });
    }

    const amount = parseInt(args[0]);

    if (!amount || amount < 1 || amount > 100) {
      const embed = new EmbedBuilder()
        .setColor(0xf1c40f)
        .setTitle("⚠️ Invalid Amount")
        .setDescription("Please provide a number between **1 and 100**.");

      return message.channel.send({ embeds: [embed] });
    }

    // ⛔ Delete command message first
    await message.delete().catch(() => {});

    // 🧹 Delete messages
    const deleted = await message.channel.bulkDelete(amount, true);

    // 🟢 Confirmation embed (1 second)
    const confirmEmbed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🧹 Purge Completed")
      .setDescription(
        `Successfully deleted **${deleted.size} messages** in ${message.channel}.`
      )
      .setFooter({ text: `Today at ${new Date().toLocaleTimeString()}` });

    const confirmMsg = await message.channel.send({ embeds: [confirmEmbed] });

    setTimeout(() => {
      confirmMsg.delete().catch(() => {});
    }, 1000);

    // 📜 LOGS
    const logChannel = message.guild.channels.cache.get("1470808028772176039");
    if (!logChannel) return;

    let logText = "";
    let index = 1;

    deleted.forEach(msg => {
      const type =
        msg.embeds.length > 0 || msg.attachments.size > 0
          ? "embed/file"
          : "text";

      const content = msg.content
        ? msg.content.slice(0, 80)
        : "(no content)";

      logText +=
        `${index}. [${type}]\n` +
        `[${msg.author?.username || "unknown"}] ${content}\n\n`;

      index++;
    });

    const MAX_CHARS = 900;
    const safeLog =
      logText.length > MAX_CHARS
        ? logText.slice(0, MAX_CHARS) + "\n... (truncated)"
        : logText;

    const logEmbed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle(`🧹 Purge Executed (${deleted.size} messages)`)
      .addFields(
        {
          name: " Executed By",
          value: `${message.author} (${message.author.id})`
        },
        {
          name: " Channel",
          value: `${message.channel}`
        },
        {
          name: " Deleted Messages",
          value: "```" + safeLog + "```"
        }
      )
      .setFooter({ text: `Today at ${new Date().toLocaleTimeString()}` });

    logChannel.send({ embeds: [logEmbed] });
  }
  
};
