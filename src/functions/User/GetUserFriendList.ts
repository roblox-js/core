import axios from 'axios';
import { getCsrfToken, refreshCsrfToken, getAuthenticatedUserId } from '../../utils/AuthHelper'; // Adjust the path if needed

/**
 * Gets specified user's friends list
 * @param {string | number} user - User's id
 * @returns {Promise<Object>} Friend List
 * @example
 * console.log(await GetUserFriendList(80254))
 * 
 * // [
   //  {
   //    "id": 1617749303,
   //    "name": "bk52540",
   //    "displayName": "BKmusic"
   //  },
   //  {
   //    "id": 1434611,
   //    "name": "wow7",
   //    "displayName": "wow7"
   //  },
   //  ...
   // ]
 */

export default async function (user: string | number): Promise<Object> {
  const res = await axios.get(`https://friends.roblox.com/v1/users/${user}/friends`);

  const friends = res.data.data;
  return friends;
}
