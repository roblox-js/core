import axios from 'axios';
import { getCsrfToken, refreshCsrfToken } from '../../utils/AuthHelper'; // Adjust the path if needed

/**
 * Sends a friend request to the specified user
 * 🔑 Authentication is required
 * @param {string | number} userId - The ID of the user
 * @returns {Promise<Object>}
 */

export default async (userId: string | number) => {
  const requestUrl = `https://friends.roblox.com/v1/users/${userId}/request-friendship`;

  // Get the CSRF token and cookie string from the utility module
  const { csrfToken, cookieString } = await getCsrfToken();

  try {
    const response = await axios.post(
      requestUrl,
      {},
      {
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Content-Type': 'application/json',
          Cookie: cookieString,
        },
        withCredentials: true,
      }
    );

    return {
      status: 'Success',
      data: response.data,
    };
  } catch (error: any) {
    if (error.response && error.response.data?.errors?.[0]?.message === 'XSRF token invalid') {
      // Refresh the token and retry the request
      const newCsrfToken = await refreshCsrfToken();
      const retryResponse = await axios.post(
        requestUrl,
        {},
        {
          headers: {
            'X-CSRF-TOKEN': newCsrfToken,
            'Content-Type': 'application/json',
            Cookie: cookieString,
          },
          withCredentials: true,
        }
      );

      return {
        status: 'Success',
        data: retryResponse.data,
      };
    }

    if (error.response) {
      return {
        status: 'Error',
        details: error.response.data,
        statusCode: error.response.status,
      };
    } else {
      return {
        status: 'Error',
        details: error.message,
      };
    }
  }
};