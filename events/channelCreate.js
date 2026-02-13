const { AuditLogEvent, EmbedBuilder } = require("discord.js");
const whitelist = require("../utils/whitelist");

const limits = new Map();
const LIMIT = 1;
const RESET_TIME = 24 * 60 * 60 * 1000; // 24 horas
const LOG_CHANNEL = "1470979029162262610";
const OWNER_ID = "1402724870160257130";

module.exports = {
  name: "channelCreate",

  async execute(channel, client) {
    const guild = channel.guild;

    try {
      const fetched = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.ChannelCreate,
      });

      const log = fetched.entries.first();
      if (!log) return;

      // ⏱ Ignorar logs viejos
      if (Date.now() - log.createdTimestamp > 10000) return;

      const { executor } = log;
      if (!executor) return;

      const memberExec = await guild.members.fetch(executor.id).catch(() => null);
      if (!memberExec) return;

      // 🔐 IGNORE OWNER Y BOT
      if (executor.id === guild.ownerId) return;
      if (executor.id === guild.members.me.id) return;

      // ✅ Whitelist por categoría
      if (whitelist.isWhitelistedUser(executor.id, "channelCreate")) return;
      if (whitelist.isWhitelistedRole(memberExec, "channelCreate")) return;

      // 🔢 SISTEMA DE LÍMITES
      if (!limits.has(executor.id)) {
        limits.set(executor.id, { count: 0, time: Date.now() });
      }

      const data = limits.get(executor.id);

      if (Date.now() - data.time > RESET_TIME) {
        data.count = 0;
        data.time = Date.now();
      }

      data.count++;

      const remaining = LIMIT - data.count;
      const logChannel = guild.channels.cache.get(LOG_CHANNEL);

      // ⚠️ WARNING
      if (data.count <= LIMIT) {
        const warnEmbed = new EmbedBuilder()
          .setColor("#3498DB")
          .setTitle("User Warning")
          .addFields(
            { name: "User:", value: `${executor.tag}\n${executor.id}` },
            { name: "Reason:", value: "Creating Channels" },
            { name: "Remaining Attempts:", value: `${remaining >= 0 ? remaining : 0}` }
          )
          .setTimestamp();

        if (logChannel) logChannel.send({ embeds: [warnEmbed] });
      }

      // ❌ PUNISH
      if (data.count > LIMIT) {

        await guild.members.ban(executor.id, {
          reason: "AntiNuke - Creating too many channels",
        }).catch(() => {});

        const punishEmbed = new EmbedBuilder()
          .setColor("#3498DB")
          .setTitle("User Punished")
          .addFields(
            { name: "User:", value: `${executor.tag}\n${executor.id}` },
            { name: "Action", value: "Channel Create" },
            { name: "Punishment Type", value: "Ban" }
          )
          .setTimestamp();

        if (logChannel) logChannel.send({ embeds: [punishEmbed] });

        // 📩 DM SOLO CUANDO ES BAN
        const ownerUser = await client.users.fetch(OWNER_ID).catch(() => null);

        if (ownerUser) {
          const dmEmbed = new EmbedBuilder()
            .setColor("#3498DB")
            .setTitle("User Punished")
            .setDescription(
              "Security responded instantly."
            )
            .addFields(
              { name: "Server:", value: guild.name },
              { name: "User:", value: executor.tag },
              { name: "Action", value: "Creating Channels" },
              { name: "Punishment Type", value: "Ban" }
            )
            .setTimestamp();

          ownerUser.send({ embeds: [dmEmbed] }).catch(() => {});
        }

        limits.delete(executor.id);
      }

    } catch (err) {
      console.log("AntiChannelCreate error:", err);
    }
  },
};
