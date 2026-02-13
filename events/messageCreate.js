// events/messageCreate.js
const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");
const whitelist = require("../utils/whitelist");

const DISCORD_INVITE_REGEX = /(discord\.gg\/|discord\.com\/invite\/)/i;

// 📁 SECURITY FILE
const securityPath = path.join(__dirname, "../database/security.json");

// Cargar datos
let securityData = { inviteWarnings: {} };

if (fs.existsSync(securityPath)) {
  const raw = fs.readFileSync(securityPath);
  securityData = JSON.parse(raw);
}

// Guardar datos
function saveSecurity() {
  fs.writeFileSync(securityPath, JSON.stringify(securityData, null, 2));
}

module.exports = {
  name: "messageCreate",

  async execute(message, client) {
    if (message.author.bot) return;

    // =========================
    // 🔗 ANTI DISCORD INVITE
    // =========================

    if (message.guild && DISCORD_INVITE_REGEX.test(message.content)) {

      const member = message.member;
      if (!member) return;

      if (member.id === message.guild.ownerId) return;
      if (member.id === message.guild.members.me.id) return;

      if (whitelist.isWhitelistedUser?.(member.id, "invite")) return;
      if (whitelist.isWhitelistedRole?.(member, "invite")) return;

      await message.delete().catch(() => {});

      const logChannel = message.guild.channels.cache.get("1470979029162262610");

      const warnings = securityData.inviteWarnings[member.id] || 0;
      const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);

      // 🚨 SECOND STRIKE = BAN
      if (warnings >= 1) {

        await member.ban({
          reason: "Security: Repeated Discord Invite"
        }).catch(() => {});

        delete securityData.inviteWarnings[member.id];
        saveSecurity();

        const banEmbed = new EmbedBuilder()
          .setColor("#3498DB")
          .setTitle("User Punished")
          .addFields(
            { name: "User", value: `${member.user.tag}\n${member.id}` },
            { name: "Reason", value: "Repeated Discord Invite" },
            { name: "Punishment Type", value: "Ban" }
          )
          .setTimestamp();

        if (logChannel) logChannel.send({ embeds: [banEmbed] });

        return;
      }

      // ⚠ FIRST STRIKE
      securityData.inviteWarnings[member.id] = warnings + 1;
      saveSecurity();

      const warnEmbed = new EmbedBuilder()
        .setColor("#3498DB")
        .setTitle("Security Warning")
        .setDescription(
          `${member}, you are not allowed to send Discord server links.\n\nReason: Sending Discord Invite\n\nNext invite = BAN`
        )
        .setTimestamp();

      await message.channel.send({ embeds: [warnEmbed] });

      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor("#3498DB")
          .setTitle("User Warning")
          .addFields(
            { name: "User", value: `${member.user.tag}\n${member.id}` },
            { name: "Reason", value: "Sending Discord Invite" },
            { name: "Admin", value: isAdmin ? "Yes" : "No" },
            { name: "Strikes", value: `${securityData.inviteWarnings[member.id]}/2` }
          )
          .setTimestamp();

        logChannel.send({ embeds: [logEmbed] });
      }

      // 🔇 AUTO TIMEOUT 10 MIN (NO ADMIN)
      if (!isAdmin) {
        await member.timeout(
          10 * 60 * 1000,
          "Security: Sending Discord Invite"
        ).catch(() => {});
      }

      return;
    }

    // =========================
    // 💤 AFK SYSTEM
    // =========================

    if (!client.afkData) client.afkData = new Map();

    const afkInfo = client.afkData.get(message.author.id);

    if (afkInfo) {

      const now = new Date();
      const diff = Math.floor((now - afkInfo.start) / 1000);

      let timeString =
        diff < 60
          ? `${diff} seconds`
          : diff < 3600
          ? `${Math.floor(diff / 60)} minutes and ${diff % 60} seconds`
          : `${Math.floor(diff / 3600)} hours and ${Math.floor(
              (diff % 3600) / 60
            )} minutes`;

      if (
        message.guild.members.me.permissions.has(
          PermissionsBitField.Flags.ManageNicknames
        )
      ) {
        await message.member
          .setNickname(afkInfo.oldNickname)
          .catch(() => {});
      }

      const embedBack = new EmbedBuilder()
        .setColor("#3498DB")
        .setDescription(
          `Welcome back, <@${message.author.id}>! You were AFK for ${timeString}.`
        );

      await message.channel.send({ embeds: [embedBack] });

      client.afkData.delete(message.author.id);
    }

    if (message.mentions.members.size > 0) {
      message.mentions.members.forEach(member => {
        if (client.afkData.has(member.id)) {
          const info = client.afkData.get(member.id);
          const afkEmbed = new EmbedBuilder()
            .setColor("#3498DB")
            .setDescription(`<@${member.id}> is AFK: ${info.message}`);
          message.channel.send({ embeds: [afkEmbed] });
        }
      });
    }

    // =========================
    // 🧮 CALCULATOR
    // =========================

    const content = message.content.replace(/\s+/g, "");
    const match = content.match(/^(-?\d+)([+\-*/])(-?\d+)$/);

    if (match) {
      const num1 = Number(match[1]);
      const operator = match[2];
      const num2 = Number(match[3]);

      let result;

      switch (operator) {
        case "+": result = num1 + num2; break;
        case "-": result = num1 - num2; break;
        case "*": result = num1 * num2; break;
        case "/":
          if (num2 === 0)
            return message.channel.send("Division by zero is not allowed.");
          result = num1 / num2;
          break;
        default: return;
      }

      const embed = new EmbedBuilder()
        .setColor("#3498DB")
        .setTitle("Calculation")
        .setDescription(`${num1}${operator}${num2} = \`${result}\``);

      return message.channel.send({ embeds: [embed] });
    }

    // =========================
    // PREFIX COMMANDS
    // =========================

    if (!message.content.startsWith(client.prefix)) return;

    const args = message.content
      .slice(client.prefix.length)
      .trim()
      .split(/ +/);

    const cmdName = args.shift().toLowerCase();

    const command =
      client.commands.get(cmdName) ||
      client.commands.find(
        cmd => cmd.aliases && cmd.aliases.includes(cmdName)
      );

    if (!command) {
      return message.channel.send(`Command "${cmdName}" not found.`);
    }

    try {
      await command.execute(message, args, client);
    } catch (error) {
      console.error("Error executing command:", error);
      message.channel.send("An error occurred while executing the command.");
    }
  }
};
