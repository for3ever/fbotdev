module.exports = {
    name: "queue",
    description: "view the queue",
    aliases: "q",
    run: async (client, message, args, option) => {
        let fetched = option.active.get(messag.guild.id);

        if(!fetched) return message.channel.send('no music playing');

        let queue = fetched.queue;
        let np = queue[0];

        let resp = `__**Now Playing**__\n**${np.songTitle}** requested by: **${np.requester}**\n\n**Queue**\n`;

        for(var i = 1; i<queue.length; i++) {
            resp += `${i}. **${queue[i].songTitle}** -- requested by: ${queue[i].requester}\n`
        }

        message.channel.send(resp);

    }
}