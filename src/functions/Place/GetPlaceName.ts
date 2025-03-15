import axios from 'axios';

/**
 * Gets place's name
 * @param {number | string} id - The place ID
 * @returns {Promise<string>} Place's name
 * @example
 * ```typescript
 * // Example usage:
 * const name = await GetPlaceName(277751860);
 * // Example response:
 * 'Epic Minigames'
 * ```
 */

export default async (id: number | string): Promise<string> => {
    const response = await axios.get(`https://www.roblox.com/places/api-get-details?assetId=${id}`);
    return response.data.Name as string
};
