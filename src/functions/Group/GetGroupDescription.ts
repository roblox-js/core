import axios from 'axios';

/**
 * Gets group's description
 * @param {number | string} id - The group ID
 * @returns {Promise<string>} Group's description
 * @example
 * ```typescript
 * // Example usage:
 * const description = await GetGroupDescription(1);
 * // Example response:
 * // "This is a group description"
 * ```
 */

export default async(id: number | string): Promise<string> => {
    const response = await axios.get(`https://groups.roblox.com/v1/groups/${id}`);
    return response.data.description as string;
}