import axios from 'axios';
import { getCsrfToken, refreshCsrfToken } from '../../utils/AuthHelper'; // Adjust the path if needed

/**
 * 🔑 **Authentication is required**
 *
 * Blocks the specified user
 * @param {string | number} userId - The ID of the user
 * @returns {Promise<Boolean>} If operation was a success/failure
 */

export default async (userId: string | number): Promise<Boolean> => {
  const { csrfToken, cookieString } = await getCsrfToken();

  async function main(token: string) {
    const response = await axios.post(
      `https://apis.roblox.com/user-blocking-api/v1/users/${userId}/block-user`,
      {},
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
      return false
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
        return false
      }
    }
    return false
  }
};
