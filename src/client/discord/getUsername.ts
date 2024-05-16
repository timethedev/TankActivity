export default function getUsername(member: any) {
    return member?.nick || member.global_name || member.username
}