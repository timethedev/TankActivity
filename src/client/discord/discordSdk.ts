import { DiscordSDKMock, DiscordSDK } from '@discord/embedded-app-sdk';
const discordSdk = new DiscordSDKMock(import.meta.env.VITE_DISCORD_CLIENT_ID, "1928", "38393");

let auth: any;

async function setupDiscordSdk() {
    // Wait for READY payload from the discord client
    await discordSdk.ready();
    console.log("Discord SDK is ready");

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

    if (auth.user.username == "mock_user_username") {
        auth.user.id = Date.now()
    }

    return {
        discordSdk, 
        auth
    }
}

async function invite() {
    await discordSdk.commands.openInviteDialog()
}

function getAuth(){
    return auth;
}

export {
    setupDiscordSdk,
    invite,
    getAuth
}