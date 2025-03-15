import axios from 'axios';

/**
 * Gets group's owner
 * @param {number | string} id - The group ID
 * @returns {Promise<object>} Group's owner
 * @example
 * ```typescript
 * // Example usage:
 * const owner = await GetGroupOwner(1);
 * // Example response:
 * owner: {
    hasVerifiedBadge: false,
    userId: 1179762,
    username: 'RobloTim',
    displayName: 'RobloTim'
  }
 * ```
 */

export default async(id: number | string): Promise<object> => {
    const response = await axios.get(`https://groups.roblox.com/v1/groups/${id}`);
    return response.data.owner as object;
}