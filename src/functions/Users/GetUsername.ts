import axios from 'axios';

/* Gets user's username from id */

export default async (id: Number) => {
  const res = await axios
    .get('https://friends.roblox.com/v1/metadata', {
      params: {
        targetUserId: id,
      },
    })

    return res.data.userName
}