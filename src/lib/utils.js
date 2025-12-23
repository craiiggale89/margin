/**
 * Deeply serializes a Prisma object, converting Date objects to ISO strings.
 * This is required for passing Prisma data from Server Components to Client Components.
 */
export function serializePrisma(data) {
    if (data === null || data === undefined) return data

    if (Array.isArray(data)) {
        return data.map(serializePrisma)
    }

    if (data instanceof Date) {
        return data.toISOString()
    }

    if (typeof data === 'object') {
        const result = {}
        for (const key in data) {
            result[key] = serializePrisma(data[key])
        }
        return result
    }

    return data
}

/**
 * Formats a date string or object into a readable date and time.
 * Example: "Oct 24, 14:30"
 */
export function formatDateTime(date) {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })
}
