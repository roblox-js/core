import axios from 'axios';

/* Gets results from user search */
/** @returns {Array} */

export default async (query: String, limit?: Number) => {
  const res = await axios
    .get('https://users.roblox.com/v1/users/search', {
      params: {
        keyword: query,
        limit: limit || 10
      },
    })

    return res.data.data
}