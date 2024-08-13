const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const cors = require('cors');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const app = express();
app.use(cors());

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const getBadges = (user) => {
  const badges = [];
  if (user.flags) {
    if (user.flags.has('Staff')) badges.push('Discord Staff');
    if (user.flags.has('Partner')) badges.push('Partnered Server Owner');
    if (user.flags.has('Hypesquad')) badges.push('HypeSquad Events');
    if (user.flags.has('BugHunterLevel1')) badges.push('Bug Hunter Level 1');
    if (user.flags.has('BugHunterLevel2')) badges.push('Bug Hunter Level 2');
    if (user.flags.has('HypeSquadOnlineHouse1')) badges.push('HypeSquad Bravery');
    if (user.flags.has('HypeSquadOnlineHouse2')) badges.push('HypeSquad Brilliance');
    if (user.flags.has('HypeSquadOnlineHouse3')) badges.push('HypeSquad Balance');
    if (user.flags.has('PremiumEarlySupporter')) badges.push('Early Supporter');
    if (user.flags.has('VerifiedDeveloper')) badges.push('Verified Bot Developer');
    if (user.flags.has('CertifiedModerator')) badges.push('Certified Moderator');
    if (user.flags.has('ActiveDeveloper')) badges.push('Active Developer');
  }
  return badges;
};

app.get('/users/:userId', async (req, res) => {
  try {
    const user = await client.users.fetch(req.params.userId, { force: true });
    const guilds = client.guilds.cache.filter(guild => guild.members.cache.has(user.id));
    const member = guilds.first()?.members.cache.get(user.id);

    let activities = [];
    let spotify = null;

    if (member && member.presence) {
      activities = member.presence.activities.map(activity => ({
        name: activity.name,
        type: activity.type,
        details: activity.details,
        state: activity.state,
        assets: activity.assets
      }));

      const spotifyActivity = member.presence.activities.find(act => act.type === 'LISTENING' && act.name === 'Spotify');
      if (spotifyActivity) {
        spotify = {
          song: spotifyActivity.details,
          artist: spotifyActivity.state,
          album: spotifyActivity.assets?.largeText
        };
      }
    }

    const badges = getBadges(user);

    const userData = {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatarURL({ dynamic: true, size: 4096 }),
      banner: user.bannerURL({ dynamic: true, size: 4096 }),
      bot: user.bot,
      createdAt: user.createdAt,
      status: member?.presence?.status || 'offline',
      activities: activities,
      spotify: spotify,
      aboutMe: user.bio || "No bio available",
      badges: badges,
      nickname: member?.nickname || user.username,
      realName: user.globalName || "Not set",
      pronouns: user.pronouns || "Not specified"
    };

    res.json(userData);
  } catch (error) {
    console.error('Error:', error);
    res.status(404).json({ error: 'User not found or error occurred' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

client.login('MTI3MjcxNDIwMDY1Mjg0MTAwMQ.GaOotF.cr7O2YTnTAS3I4qp_nJw2YsBWdNeTmPAy1D4gQ');