import axios from 'axios';

/* Gets user's current status */
/** @returns {string} */

export default async (id: Number) => {
  const res = await axios
    .get(`https://api.roblox.com/users/${id}`)

    if (res.data.IsOnline === true) return 'online';
	if (res.data.IsOnline === false) return 'offline';
}