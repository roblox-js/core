import axios from 'axios';
import { getCsrfToken, refreshCsrfToken, getAuthenticatedUserId } from '../../utils/AuthHelper'; // Adjust the path if needed

/**
 * Checks if a user is friends with another user.
 * @param {string | number} user1 - User's id
 * @param {string | number} user2 - User's id
 * @returns {Promise<boolean>}
 */

export default async function (user1: string | number, user2: string | number): Promise<boolean> {
  const res = await axios.get(`https://friends.roblox.com/v1/users/${user1}/friends`);

  const friends = res.data.data;
  let isFriends: boolean = false;

  friends.forEach((friend: any) => {
    if (friend.id === user2) {
      isFriends = true;
    }
  });

  return isFriends;
}
