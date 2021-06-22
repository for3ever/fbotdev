const { OPEN_SHAREDCACHE } = require('sqlite3');
const ytdl = require('ytdl-core');

module.exports = {
    name: "play",
    description: "plays a song",
    run: async (client, message, args, option) => {
        if(!message.member.voiceChannel) return message.channel.send("Connect to the voice channel first");

        if(message.guild.me.voiceChannel) return message.channel.send('bot already connected to the guild');

        if(!args[0]) return message.channel.send('error no input');

        let validate = await ytdl.validateURL(args[0]);

        if(!validate) {
            let commandFile = require(`./search.js`);
            commandFile.run(client, message, args, option);
        }

        let info = await ytdl.getInfo(args[0]);

        let data = optiona.active.get(message.guild.id) || {};

        if(!data.connection) data.connection = await message.member.voiceChannel.join();
        if(!data.queue) data.queue = [];
        data.guildID = message.guild.id;

        data.queue.push({
            songTitle: info.title,
            requester: message.author.tag,
            url: args[0],
            channel: message.channel.id
        });

        if(!data.dispatcher) play(client, option, data);
        else {
            message.channel.send(`Added ${info.title} requested by ${message.author.id} to queue`);
        }

        option.active.set(message.guild.id, data);
    }
}

async function play(client, option, data) {
    client.channels.get(data.queue[0].channel).send(`Now Playing ${data.queue[0]} requested by %${data.queue[0].requester}`);

    data.dispatcher = await data.connection.play(ytdl(data.queue[0].url, { filter: 'audioonly' }));
    data.dispatcher.guildID = data.guildID;
    
    data.dispatcher.once('finish', function() {
        finish(client, option, this);
    });
}

function finish (client, option, dispatcher) {
    let fetched = option.active.get(dispatcher.guildID);

    fetched.queue.shift();

    if(fetched.queue.length > 0) {
        option.active.set(dispatcher.guildID, fetched);

        play(client, option, fetched);
    } else {
        option.active.delete(dispatcher.guildID);

        let vc = client.guilds.get(dispatcher.guildID).me.voiceChannel;

        if(vc) vc.leave();
    }
}