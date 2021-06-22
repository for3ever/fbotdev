module.exports = {
    name: "reload",
    category: "moderation",
    description: "reload the command",
    run: (client, message, args) => {
        if(message.author.id !== "ownerID") return message.channel.send("Owner only command");

        try {
            delete require.cache[require.resolve(`./${args[0]}.js`)];
        } catch (e) {
            console.error(e);
            return message.channel.send(`Unable to reload ${args[0]}`);
        }

        message.channel.send(`reloaded ${args[0]}`);
    }
}