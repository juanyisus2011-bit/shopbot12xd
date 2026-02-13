const fs = require("fs");
const axios = require("axios");

const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const STAFF_ROLE = "1470634691504640094";
const CATEGORY_ID = "1470635127959982161";
const LOG_CHANNEL_ID = "1470635210193244253";
const DM_USER_ID = "1402724870160257130";

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {

    // =============================
    // SLASH COMMANDS
    // =============================
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.slashCommands.get(interaction.commandName);
      if (!command) return;

      try {
        if (command.executeSlash) {
          await command.executeSlash(interaction, interaction.client);
        } else {
          await command.execute(interaction);
        }
      } catch (error) {
        console.error(error);

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: "❌ Error executing the command.",
            flags: 64
          });
        } else {
          await interaction.reply({
            content: "❌ Error executing the command.",
            flags: 64
          });
        }
      }
      return;
    }

    // =============================
    // BUTTONS
    // =============================
    if (interaction.isButton()) {

// ===============================
// KISS BACK
// ===============================
if (interaction.customId.startsWith("kiss_back_")) {

  const [, , authorId, targetId] = interaction.customId.split("_");

  if (interaction.user.id !== targetId)
    return interaction.reply({
      content: "You are not the one who was kissed.",
      flags: 64
    });

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

  const res = await axios.get("https://api.waifu.pics/sfw/kiss");
  const gif = res.data.url;

  const data = loadData();
  const key = createKey(authorId, targetId);

  if (!data[key]) data[key] = 0;
  data[key]++;

  saveData(data);

  const total = data[key];

  const embed = new EmbedBuilder()
    .setColor("#FF69B4")
    .setDescription(
      `${interaction.user} kissed back <@${authorId}> 💞\n\n` +
      `💞 They have kissed **${total} times**`
    )
    .setImage(gif);

  await interaction.message.edit({ components: [] });
  await interaction.reply({ embeds: [embed] });

  return;
}

// ===============================
// REJECT
// ===============================
if (interaction.customId.startsWith("kiss_reject_")) {

  const [, , authorId, targetId] = interaction.customId.split("_");

  if (interaction.user.id !== targetId)
    return interaction.reply({
      content: "You are not the one who was kissed.",
      flags: 64
    });

  const axios = require("axios");
  const res = await axios.get("https://api.waifu.pics/sfw/slap");
  const gif = res.data.url;

  const embed = new EmbedBuilder()
    .setColor("#FF0000")
    .setDescription(
      `${interaction.user} rejected the kiss from <@${authorId}> 💔`
    )
    .setImage(gif);

  await interaction.message.edit({ components: [] });
  await interaction.reply({ embeds: [embed] });

  return;
}

      // =============================
      // OPEN TICKET
      // =============================
      if (interaction.customId === "open_ticket") {

        const displayName =
          interaction.member?.nickname || interaction.user.username;

        const channelName = `ticket-${displayName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")}`;

        const channels = await interaction.guild.channels.fetch();
        const existingTicket = channels.find(c =>
          c.name.startsWith(channelName)
        );

        if (existingTicket) {
          return interaction.reply({
            content: `❌ You already have an open ticket: ${existingTicket}`,
            flags: 64
          });
        }

        const modal = new ModalBuilder()
          .setCustomId("ticket_form")
          .setTitle("Purchase Form")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("product")
                .setLabel("What do you want to buy?")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("payment")
                .setLabel("Payment method")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            )
          );

        return interaction.showModal(modal);
      }

      // =============================
      // CLOSE TICKET
      // =============================
      if (interaction.customId === "close_ticket") {

        const channel = interaction.channel;

        try {
          await interaction.reply({
            content: "🔒 Ticket closed. Creating transcript...",
            flags: 64
          });
        } catch {}

        const messages = await channel.messages.fetch({ limit: 100 });
        const sortedMessages = messages.sort(
          (a, b) => a.createdTimestamp - b.createdTimestamp
        );

        let transcript = `--- Ticket transcript: ${channel.name} ---\n\n`;
        sortedMessages.forEach(msg => {
          transcript += `[${msg.author.tag}] ${msg.content}\n`;
        });

        const fileName = `./transcript-${channel.name}.txt`;
        fs.writeFileSync(fileName, transcript);

        const logChannel =
          interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

        if (logChannel) {
          await logChannel.send({
            content: `📄 Ticket transcript: ${channel.name}`,
            files: [fileName]
          });
        }

        const user = await interaction.client.users.fetch(DM_USER_ID);
        if (user) {
          await user.send({
            content: `📄 Ticket transcript: ${channel.name}`,
            files: [fileName]
          }).catch(() => {});
        }

        setTimeout(() => {
          channel.delete().catch(() => {});
          fs.unlinkSync(fileName);
        }, 2000);

        return;
      }
    }

    // =============================
    // MODAL SUBMIT
    // =============================
    if (interaction.isModalSubmit() && interaction.customId === "ticket_form") {

      const product = interaction.fields.getTextInputValue("product");
      const payment = interaction.fields.getTextInputValue("payment");

      const displayName =
        interaction.member?.nickname || interaction.user.username;

      const channelName = `ticket-${displayName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")}`;

      const channels = await interaction.guild.channels.fetch();
      const existingTicket = channels.find(c =>
        c.name.startsWith(channelName)
      );

      if (existingTicket) {
        return interaction.reply({
          content: `❌ You already have an open ticket: ${existingTicket}`,
          flags: 64
        });
      }

      const channel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: CATEGORY_ID,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages
            ]
          },
          {
            id: STAFF_ROLE,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages
            ]
          }
        ]
      });

      const embed = new EmbedBuilder()
        .setTitle("🎟️ Ticket Created")
        .setDescription(
          `👤 User: ${displayName}\n` +
          `📦 Product: ${product}\n` +
          `💳 Payment: ${payment}`
        )
        .setColor(0x2ecc71);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("Close Ticket")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        content: `<@&${STAFF_ROLE}>`,
        embeds: [embed],
        components: [row]
      });

      return interaction.reply({
        content: `✅ Ticket successfully created: ${channel}`,
        flags: 64
      });
    }
   }
};
