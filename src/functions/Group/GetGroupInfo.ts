import axios from 'axios';

/**
 * Gets group's info
 * @param {number | string} id - The group ID
 * @returns {Promise<Object>} Group's info
 * @example
 * ```typescript
 * // Example usage:
 * const info = await GetGroupInfo(1);
 * // Example response:
 * {
  id: 1,
  name: 'RobloHunks',
  description: '',
  owner: {
    hasVerifiedBadge: false,
    userId: 1179762,
    username: 'RobloTim',
    displayName: 'RobloTim'
  },
  shout: null,
  memberCount: 220333,
  isBuildersClubOnly: false,
  publicEntryAllowed: true,
  hasVerifiedBadge: false
}
 * ```
 */

export default async (id: number | string): Promise<Object> => {
  const response = await axios.get(`https://groups.roblox.com/v1/groups/${id}`);
  return response.data as object;
};
