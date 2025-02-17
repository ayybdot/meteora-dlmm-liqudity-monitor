import "dotenv/config"
import TelegramBot from "node-telegram-bot-api"
import { inspectSignature } from "./services/monitor.js"

const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.on('message',async (msg) => {
    const chatId = msg.chat.id;
    console.log(msg.text);

    let result = false;
    try{
        result = await inspectSignature(msg.text);
    }catch(err){
        console.log(err);
    }

    if (result) {
        bot.sendMessage(chatId, 'true');
    } else {
        bot.sendMessage(chatId, 'false');
    }
});

