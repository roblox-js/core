import axios from 'axios';
import { getCsrfToken, refreshCsrfToken, getAuthenticatedUserId } from '../../utils/AuthHelper'; // Adjust the path if needed

/**
 * 🔑 **Authentication is required**
 *
 * Attempts to post a group shout.
 * @param {string | number} groupId - The ID of the group
 * @param {string} message - Shout to post.
 * @returns {Promise<Boolean>} If operation was a success/failure
 */

export default async (groupId: string | number, message: string): Promise<Boolean> => {
  const { csrfToken, cookieString } = await getCsrfToken();
  const userId = await getAuthenticatedUserId();
  async function main(token: string) {
    const response = await axios.patch(
      `https://groups.roblox.com/v1/groups/${groupId}/status`,
      {
        message
      },
      {
        headers: {
          Cookie: cookieString,
          'x-csrf-token': token,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      },
    );
    return response;
  }
  try {
    const response = await main(csrfToken);

    if (response.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error: any) {
    if (error.response?.status === 403) {
      await refreshCsrfToken();
      const { csrfToken, cookieString } = await getCsrfToken();
      try {
        const retryResponse = await main(csrfToken);
        if (retryResponse.status === 200 && retryResponse.data?.success) {
          return true;
        }
      } catch (retryError: any) {
        return false;
      }
    }
    return false;
  }
};
