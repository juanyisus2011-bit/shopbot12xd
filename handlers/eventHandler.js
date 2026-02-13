const fs = require("fs");

module.exports = (client) => {
  const events = fs.readdirSync("./events").filter(e => e.endsWith(".js"));

  for (const file of events) {
    const event = require(`../events/${file}`);
    client.on(event.name, (...args) => event.execute(client, ...args));
  }

  console.log("✅ Events loaded");
};
