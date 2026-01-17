export function extractVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
}

export function parseTimestampToSeconds(timeStr: string): number {
    const parts = timeStr.split(':').map(Number)
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2]
    }
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1]
    }
    return 0
}
