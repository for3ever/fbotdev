const { Client, Collection, User, MessageEmbed, DiscordAPIError } = require('discord.js');
const { config } = require('dotenv');
const fs = require('fs');
const Users = require('./models/Users');

const client = new Client({
    disableMentions: 'everyone'
});

client.commands = new Collection();
client.aliases = new Collection();

const active = new Map();

client.categories = fs.readdirSync("./commands/");

const db = require('quick.db');

config({
    path: __dirname + "/.env"
});

["command"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

Reflect.defineProperty(currency, 'add', {
	value: async function add(id, amount) {
		const user = currency.get(id);
		if (user) {
			user.balance += Number(amount);
			return user.save();
		}
		const newUser = await Users.create({ user_id: id, balance: amount });
		currency.set(id, newUser);
		return newUser;
	},
});

Reflect.defineProperty(currency, 'getBalance', {
	value: function getBalance(id) {
		const user = currency.get(id);
		return user ? user.balance : 0;
	},
});

client.on('ready', async () => {
    console.log('r');

    client.user.setPresence({
        status: 'idle',
        game: {
            name: '',
            type: ''
        }
    });

    const storedBalances = await Users.findAll();
    storedBalances.forEach(b => currency.set(b.user_id, b));
});

client.on('message', async message => {
    const prefix = 'f!';
    if(message.author.bot) return;
    if(!message.guild) return;
    if(!message.content.startsWith(prefix)) return;
    if(!message.member) message.member = await message.guild.fetchMember(message);

    if(message.channel.type !== 'text') {
        let active = await db.fetch(`support_${message.guild.id}`);

        let guild = client.guilds.get('guildID');

        let channel, found = true;

        try {
            if(active) client.channels.get(active.channelID).guild;
        } catch (e) {
            found = false;
        }

        if(!active || !found) {
            active = {};

            channel = await guild.channels.create(`${message.author.username}-${message.author.discriminator}`, {
                parent: 'categoryID',
                topic: `f!complete to close ticket | support for ${message.author.tag} | ID: ${message.author.id}`
            });

            let author = message.author;

            const newChannel = new MessageEmbed()
                .setColor(0x36393e)
                .setAuthor(author.tag, author.displayAvatarURL())
                .setFooter('support ticket created')
                .addField('user', author)
                .addField('id', author.id)
            
            await channel.send(newChannel);

            const newTicket = new MessageEmbed()
                .setColor(0x36393e)
                .setAuthor(`hello ${author.tag}`, author.displayAvatarURL())
                .setFooter('support ticket created')
            
            await author.send(newTicket);

            active.channelID = channel.id;
            active.targetID = author.id;
        }

        channel = client.channels.get(acitve.channelID);

        const dm = new MessageEmbed()
            .setColor(0x36393e)
            .setAuthor(`Thank you ${message.author.tag}`, message.author.displayAvatarURL())
            .setFooter(`message sent, staff in contact soon`)
        
        await message.author.send(dm);

        const embed = new MessageEmbed()
            .setColor(0x36393e)
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setDescription(message.content)
            .setFooter(`message recieved -- ${message.author.tag}`)
        
        await channel.send(embed);

        db.set(`support_${message.author.id}`, active);
        db.set(`supportChannel_${channel.id}`, message.author.id);
        return;
    }

    let support = await db.fetch(`supportChannel_${message.channel.id}`);

    if(support) {
        support = await db.fetch(`support_${support}`);

        let supportUser = client.users.get(support.targetID);
        if(!supportUser) return message.channel.delete();

        if(message.content.toLowerCase() === 'f!complete') {
            const complete = new MessageEmbed()
                .setColor(0x36393e)
                .setAuthor(`Hey ${supportUser.tag}`, supportUser.displayAvatarURL())
                .setFooter('ticket closed')
                .setDescription('ticket marked as complete')
            
            supportUser.send(complete);

            message.channel.delete();

            return db.delete(`support_${support.targetID}`);
        }
        
        const embed = new MessageEmbed()
            .setColor(0x36393e)
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setFooter(`message received`)
            .setDescription(message.content)

        client.users.get(support.targetID).send(embed);

        message.delete({ timeout: 1000 });

        embed.setFooter(`message sent -- ${supportUser.tag}`).setDescription(message.content);

        return message.channel.send(embed);
    }
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if (cmd.length === 0) return;

    let command = client.commands.get(cmd);
    if(!command) command = client.commands.get(client.aliases.get(cmd));
    let option = {
        active = active,
    };
    if(command)
        command.run(client, message, args, option);
});

client.login(process.env.TOKEN);