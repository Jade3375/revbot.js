//test client will be removed in the future
//"yarn testClient" to run the test client
import { client, Message } from "./index";

const localClient = new client({});
localClient.on("ready", () => {
  console.log("Client is ready!");
});

localClient.on("message", (message: Message) => {
  if (message.content === "ping") {
    message.reply("pong");
    message.reply(`\`${message.author}\``);
  }
  if (message.content.startsWith("eval")) {
    console.log(message.content.split(" ").slice(1).join(" "));
    eval(message.content.split(" ").slice(1).join(" "));
    message.channel.messages.fetch({ limit: 20 }).then((messages) => {
      message.channel.messages.bulkDelete(messages);
    });
  }
});

localClient.login("");
