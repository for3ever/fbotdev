module.exports = {
    name: "leave",
    description: "leave the voice channel",
    run: (client, message, args) => {
        if(!message.member.voiceChannel) return message.channel.send('not connected to voicechannel');

        if(!message.guild.me.voiceChannel) return message.channel.send('bot not in the voice channel');

        if(message.guild.me.voiceChannelID !== message.member.voiceChannelID) return message.channel.send('not in the same voice channel');

        message.guild.me.voiceChannel.leave();

        message.channel.send('left the channel');
    }
}