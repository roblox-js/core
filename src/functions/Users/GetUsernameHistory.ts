import axios from 'axios';

/* Gets user's username history */
/** @returns {Array} */

export default async (id: Number) => {
  const res = await axios
    .get(`users.roblox.com/v1/users/${id}/username-history`)

    return res.data
}