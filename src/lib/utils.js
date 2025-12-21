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
