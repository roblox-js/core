import axios from 'axios';

/**
 * Gets place's builder/owner
 * @param {number | string} id - The place ID
 * @returns {Promise<object>} Place's builder
 * @example
 * ```typescript
 * // Example usage:
 * const builder = await GetPlaceBuilder(277751860);
 * // Example response:
 * {
    Builder: 'TypicalType',
    BuilderId: 7568292,
    BuilderAbsoluteUrl: 'https://www.roblox.com/users/7568292/profile/'
  };
 * ```
 */

export default async (id: number | string): Promise<object> => {
  const response = await axios.get(`https://groups.roblox.com/v1/groups/${id}`);
  return {
    Builder: response.data.Builder,
    BuilderId: response.data.BuilderId,
    BuilderAbsoluteUrl: response.data.BuilderAbsoluteUrl,
  };
};
