import axios from 'axios';

/**
 * Gets group's name
 * @param {number | string} id - The group ID
 * @returns {Promise<string>} Group's name
 * @example
 * ```typescript
 * // Example usage:
 * const name = await GetGroupName(1);
 * // Example response:
 * // "Roblohunks"
 * ```
 */

export default async(id: number | string): Promise<string> => {
    const response = await axios.get(`https://groups.roblox.com/v1/groups/${id}`);
    return response.data.name as string;
}