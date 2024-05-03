import { DiscordSDKMock, DiscordSDK } from '@discord/embedded-app-sdk';
const discordSdk = new DiscordSDKMock(import.meta.env.VITE_DISCORD_CLIENT_ID, "1928", "38393");

async function setupDiscordSdk() {
    // Wait for READY payload from the discord client
    await discordSdk.ready();
    console.log("Discord SDK is ready");

    let auth;

    // Pop open the OAuth permission modal and request for access to scopes listed in scope array below
    const {code} = await discordSdk.commands.authorize({
        client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
        response_type: 'code',
        state: '',
        prompt: 'none',
        scope: ['identify'],
    });

    // Retrieve an access_token from your application's server
    const response = await fetch('/api/token', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        code,
        }),
    });
    const {access_token} = await response.json();

    // Authenticate with Discord client (using the access_token)
    auth = await discordSdk.commands.authenticate({
        access_token,
    });

    if (auth == null) {
        throw new Error("Authenticate command failed");
    }

    return {
        discordSdk, 
        auth
    }
}

async function invite() {
    await discordSdk.commands.openInviteDialog()
}

export {
    setupDiscordSdk,
    invite
}