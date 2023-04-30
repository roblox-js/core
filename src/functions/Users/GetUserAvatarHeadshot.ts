import axios from 'axios';

/* Gets image of user's current avatar headshot */

export default async (id: Number, circular: Boolean) => {
  const res = await axios
    .get('https://thumbnails.roblox.com/v1/users/avatar-headshot', {
      params: {
        userIds: id,
        size: '720x720',
        format: 'Png',
        isCircular: circular || false,
      },
    })

    return res.data.data[0].imageUrl
}