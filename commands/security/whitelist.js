const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const whitelist = require("../../utils/whitelist");

const SECURITY_OWNER_ID = "1402724870160257130";

const categories = [
  { name: "All (Full Protection)", value: "all" },
  { name: "Ban", value: "ban" },
  { name: "Kick", value: "kick" },
  { name: "Channel Delete", value: "channelDelete" },
  { name: "Channel Create", value: "channelCreate" },
  { name: "Role Delete", value: "roleDelete" },
  { name: "Bot Add", value: "botAdd" },
  { name: "Invite Links", value: "invite" }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist")
    .setDescription("Manage security whitelist")

    // ADD USER
    .addSubcommand(sub =>
      sub
        .setName("add_user")
        .setDescription("Add user to whitelist")
        .addUserOption(option =>
          option.setName("user").setDescription("User").setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("category")
            .setDescription("Protection category")
            .setRequired(true)
            .addChoices(...categories)
        )
    )

    // REMOVE USER
    .addSubcommand(sub =>
      sub
        .setName("remove_user")
        .setDescription("Remove user from whitelist")
        .addUserOption(option =>
          option.setName("user").setDescription("User").setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("category")
            .setDescription("Category to remove")
            .setRequired(true)
            .addChoices(...categories)
        )
    )

    // VIEW
    .addSubcommand(sub =>
      sub.setName("view")
        .setDescription("View whitelist")
    )

    // ADD ROLE
    .addSubcommand(sub =>
      sub
        .setName("add_role")
        .setDescription("Add role to whitelist")
        .addRoleOption(option =>
          option.setName("role").setDescription("Role").setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("category")
            .setDescription("Protection category")
            .setRequired(true)
            .addChoices(...categories)
        )
    )

    // REMOVE ROLE
    .addSubcommand(sub =>
      sub
        .setName("remove_role")
        .setDescription("Remove role from whitelist")
        .addRoleOption(option =>
          option.setName("role").setDescription("Role").setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("category")
            .setDescription("Category to remove")
            .setRequired(true)
            .addChoices(...categories)
        )
    ),

  async execute(interaction) {

    if (interaction.user.id !== SECURITY_OWNER_ID) {
      return interaction.reply({
        content: "❌ You are not allowed to use this command.",
        ephemeral: true
      });
    }

    const sub = interaction.options.getSubcommand();

    // ======================
    // ADD USER
    // ======================
    if (sub === "add_user") {
      const user = interaction.options.getUser("user");
      const category = interaction.options.getString("category");

      whitelist.addUser(user.id, category);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#3498DB")
            .setDescription(`✅ ${user.tag} added to **${category}** whitelist.`)
        ]
      });
    }

    // ======================
    // REMOVE USER
    // ======================
    if (sub === "remove_user") {
      const user = interaction.options.getUser("user");
      const category = interaction.options.getString("category");

      whitelist.removeUser(user.id, category);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#3498DB")
            .setDescription(`❌ ${user.tag} removed from **${category}** whitelist.`)
        ]
      });
    }

    // ======================
    // ADD ROLE
    // ======================
    if (sub === "add_role") {
      const role = interaction.options.getRole("role");
      const category = interaction.options.getString("category");

      whitelist.addRole(role.id, category);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#3498DB")
            .setDescription(`✅ Role ${role.name} added to **${category}** whitelist.`)
        ]
      });
    }

    // ======================
    // REMOVE ROLE
    // ======================
    if (sub === "remove_role") {
      const role = interaction.options.getRole("role");
      const category = interaction.options.getString("category");

      whitelist.removeRole(role.id, category);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#3498DB")
            .setDescription(`❌ Role ${role.name} removed from **${category}** whitelist.`)
        ]
      });
    }

    // ======================
    // VIEW
    // ======================
    if (sub === "view") {

      let userList = "";
      for (const [id, categories] of whitelist.users) {
        userList += `<@${id}> → ${[...categories].join(", ")}\n`;
      }

      let roleList = "";
      for (const [id, categories] of whitelist.roles) {
        roleList += `<@&${id}> → ${[...categories].join(", ")}\n`;
      }

      if (!userList) userList = "None";
      if (!roleList) roleList = "None";

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#3498DB")
            .setTitle("Whitelist Overview")
            .addFields(
              { name: "Users", value: userList },
              { name: "Roles", value: roleList }
            )
        ]
      });
    }
  }
};
