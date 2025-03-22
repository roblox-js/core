import axios from 'axios';
import { LimitOptions } from './UserSearch';

/* Gets user's badges from id */
/** @returns {string} */

export default async (id: Number | string, limit: LimitOptions = LimitOptions.Ten) => {
  const res = await axios
    .get(`https://badges.roblox.com/v1/users/${id}/badges?limit=${LimitOptions}&sortOrder=Asc`)

    return res.data.data
}