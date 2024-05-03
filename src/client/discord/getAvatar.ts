export default function getAvatar(member) {
    return member.avatar ? `https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.webp?size=512` : "https://cdn.discordapp.com/embed/avatars/0.png"
}