import axios from 'axios';

/**
 * Gets place's description
 * @param {number | string} id - The place ID
 * @returns {Promise<string>} Place's description
 * @example
 * ```typescript
 * // Example usage:
 * const description = await GetPlaceDescription(277751860);
 * // Example response:
 * "Welcome to Epic Minigames, the game where you can enjoy a collection of 130 unique and exciting minigames! 🕹️\n\nLevel up and earn coins by winning, and spend your coins on gear, pets, effects, and other fun stuff for your character. 🌟\n\nAs well as the main minigame mode, there's also Epic Party 🎲, a board game where you can compete against a group of friends or strangers to see who can gather the most crystals! 💎\n\nJoin Typical Games for in-game rewards:\nhttps://www.roblox.com/communities/2649054/Typical-Games"
 * ```
 */

export default async (id: number | string): Promise<string> => {
    const response = await axios.get(`https://www.roblox.com/places/api-get-details?assetId=${id}`);
    return response.data.Description as string
};
