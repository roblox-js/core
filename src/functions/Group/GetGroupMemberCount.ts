import axios from 'axios';

/**
 * Gets group's member count
 * @param {number | string} id - The group ID
 * @returns {Promise<number>} Group's member count
 * @example
 * ```typescript
 * // Example usage:
 * const name = await GetGroupName(1);
 * // Example response:
 * // "Roblohunks"
 * ```
 */

export default async(id: number | string): Promise<number> => {
    const response = await axios.get(`https://groups.roblox.com/v1/groups/${id}`);
    return response.data.memberCount as number;
}