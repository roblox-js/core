import axios from 'axios';

/**
 * Gets group's shout
 * @param {number | string} id - The group ID
 * @returns {Promise<string>} Group's shout
 * @example
 * ```typescript
 * // Example usage:
 * const shout = await GetGroupShout(1);
 * // Example response:
 * // "This is a shout"
 * ```
 */

export default async(id: number | string): Promise<string> => {
    const response = await axios.get(`https://groups.roblox.com/v1/groups/${id}`);
    return response.data.shout as string;
}