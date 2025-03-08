import axios from 'axios';

/* Gets results from user search */
/**
 * @enum {number} LimitOptions
 * @value Ten - 10 results
 * @value TwentyFive - 25 results
 * @value Fifty - 50 results
 * @value OneHundred - 100 results
 * @returns {JSON}
*/

export enum LimitOptions {
  Ten = 10,
  TwentyFive = 25,
  Fifty = 50,
  OneHundred = 100,
}

export default async (query: String, limit: LimitOptions = LimitOptions.Ten) => {
  const res = await axios
    .get('https://users.roblox.com/v1/users/search', {
      params: {
        keyword: query,
        limit: limit || LimitOptions.Ten
      },
    })

    return res.data.data
}