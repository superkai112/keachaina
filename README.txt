KEOCHAINA bilingual Cambodian countryside shop

Run locally:
- Run `npm start`, then open http://localhost:3000.
- If port 3000 is already in use, start with `$env:PORT=3001; npm.cmd start` in PowerShell.
- Keep your Telegram `BOT_TOKEN` and `CHAT_ID` in the local `.env` file. Do not share or commit this file.
- Start the bot conversation first, or add the bot to the group, so Telegram allows it to send messages.
- Use the EN / ខ្មែរ button in the top navigation to switch languages.
- Navigation, product cards, categories, cart labels and checkout messages switch between English and Khmer.

Before launch:
- All products and prices are sample content. Replace them with your real inventory and confirmed prices.
- Checkout sends order details to your configured Telegram chat. Orders are not saved to a database.
- Add your real phone / Telegram contact and delivery information.
- The local server listens on 127.0.0.1:3000; configure an appropriate secure hosting setup before making it publicly available.
