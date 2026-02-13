const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../database/vouches.json");

function getVouches() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function saveVouch(vouch) {
  const data = getVouches();
  data.push(vouch);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  getVouches,
  saveVouch
};
