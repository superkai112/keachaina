require("dotenv").config();
const path = require("node:path");
const express = require("express");

const app = express();
const botToken = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

if (!botToken || !chatId) {
  throw new Error("BOT_TOKEN and CHAT_ID must be set in the environment.");
}

app.use(express.json({ limit: "20kb" }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/profile.png", (req, res) => {
  res.sendFile(path.join(__dirname, "profile.png"));
});

app.post("/api/order", async (req, res) => {
  const text = req.body && req.body.text;
  if (typeof text !== "string" || !text.trim() || text.length > 3500) {
    return res.status(400).json({ ok: false, error: "invalid_order" });
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
      }
    );
    const data = await response.json();
    if (!response.ok || !data.ok) {
      console.error("Telegram rejected the order.");
      return res.status(502).json({ ok: false });
    }
    return res.json({ ok: true });
  } catch (error) {
    console.error("Failed to deliver the order to Telegram.");
    return res.status(502).json({ ok: false });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, "127.0.0.1", () => {
  console.log(`Open http://localhost:${port}`);
});
