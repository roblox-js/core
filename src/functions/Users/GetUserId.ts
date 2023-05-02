import axios from 'axios';

/* Gets user's id from username */

export default async (username: String) => {

  const res = await axios
    .get(`https://www.roblox.com/users/profile?username=${username}`)

    return res.request.res.responseUrl.split("/")[4]
}