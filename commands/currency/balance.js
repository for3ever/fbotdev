module.exports = {
    name: "balance",
    category: "currency",
    description: "",
    usage: "[id | mention]",
    run: (client, message, args) => {
        const target = message.mentions.users.first() || message.author;
        return message.channel.send(`${target.tag} has ${currency.getBalance(target.id)}`);
    }
}