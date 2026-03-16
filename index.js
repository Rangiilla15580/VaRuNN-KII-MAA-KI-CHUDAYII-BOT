const login = require("ws3-fca");
const fs = require("fs");
const express = require("express");

// ✅ Load AppState
let appState;
try {
  appState = JSON.parse(fs.readFileSync("appstate.json", "utf-8"));
} catch (err) {
  console.error("❌ Error reading appstate.json:", err);
  process.exit(1);
}

// ✅ Group Info
const GROUP_THREAD_ID = "24924652145239";
const LOCKED_GROUP_NAME = "🤪VaRUNN Ki Amma Chudi hui Randi";

// ✅ Locked Nicknames (userID : nickname)
const LOCKED_NICKNAMES = {
  "1000123456789": "Ayush 👑",
  "1000987654321": "King 🔥"
};

// ✅ Express Server to keep bot alive
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("🤖 Group Locker Bot is alive!"));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

// ✅ Function to lock group name
function startGroupNameLocker(api) {
  const lockLoop = () => {
    api.getThreadInfo(GROUP_THREAD_ID, (err, info) => {
      if (err) {
        console.error("❌ Error fetching group info:", err);
      } else {
        if (info.name !== LOCKED_GROUP_NAME) {
          console.warn(`⚠️ Group name changed to "${info.name}" → resetting...`);
          api.setTitle(LOCKED_GROUP_NAME, GROUP_THREAD_ID, (err) => {
            if (err) console.error("❌ Failed to reset group name:", err);
            else console.log("🔒 Group name reset successfully.");
          });
        } else {
          console.log("✅ Group name is correct.");
        }
      }

      setTimeout(lockLoop, 5000);
    });
  };
  lockLoop();
}

// ✅ Function to lock nicknames
function startNicknameLocker(api) {
  const nickLoop = () => {
    api.getThreadInfo(GROUP_THREAD_ID, (err, info) => {
      if (err) {
        console.error("❌ Error fetching nicknames:", err);
      } else {
        for (let uid in LOCKED_NICKNAMES) {
          const expected = LOCKED_NICKNAMES[uid];
          const member = info.nicknames[uid];

          if (member !== expected) {
            console.warn(`⚠️ Nickname of ${uid} changed to "${member}" → resetting...`);
            api.changeNickname(expected, GROUP_THREAD_ID, uid, (err) => {
              if (err) console.error(`❌ Failed to reset nickname for ${uid}:`, err);
              else console.log(`🔒 Nickname of ${uid} reset to "${expected}".`);
            });
          }
        }
      }
      setTimeout(nickLoop, 5000); // repeat every 5s
    });
  };
  nickLoop();
}

// 🟢 Facebook Login
login({ appState }, (err, api) => {
  if (err) {
    console.error("❌ Login Failed:", err);
    return;
  }

  console.log("✅ Logged in successfully. Group locker activated.");
  startGroupNameLocker(api);
  startNicknameLocker(api);
});
