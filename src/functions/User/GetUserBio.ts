import axios from 'axios';

/* Gets user's bio from id */
/** @returns {string} */

export default async (id: Number | string) => {
  const res = await axios
    .get('https://users.roblox.com/v1/users/' + id)

    return res.data.description
}