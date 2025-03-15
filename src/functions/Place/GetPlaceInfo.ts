import axios from 'axios';

/**
 * Gets place's info
 * @param {number | string} id - The place ID
 * @returns {Promise<Object>} Place's info
 * @example
 * ```typescript
 * // Example usage:
 * const info = await GetPlaceInfo(277751860);
 * // Example response:
 * {
  "AssetId": 277751860,
  "Name": "Epic Minigames ✨",
  "Description": "Welcome to Epic Minigames, the game where you can enjoy a collection of 130 unique and exciting minigames! 🕹️\n\nLevel up and earn coins by winning, and spend your coins on gear, pets, effects, and other fun stuff for your character. 🌟\n\nAs well as the main minigame mode, there's also Epic Party 🎲, a board game where you can compete against a group of friends or strangers to see who can gather the most crystals! 💎\n\nJoin Typical Games for in-game rewards:\nhttps://www.roblox.com/communities/2649054/Typical-Games",
  "Created": "07/29/2015",
  "Updated": "03/05/2025",
  "FavoritedCount": 7331714,
  "Url": "https://www.roblox.com/games/277751860/Epic-Minigames",
  "ReportAbuseAbsoluteUrl": "https://www.roblox.com/abusereport/asset?id=277751860&RedirectUrl=%2fgames%2f277751860%2fEpic-Minigames",
  "IsFavoritedByUser": false,
  "IsFavoritesUnavailable": false,
  "UserCanManagePlace": false,
  "VisitedCount": 2173370085,
  "MaxPlayers": 12,
  "Builder": "@TypicalType",
  "BuilderId": 7568292,
  "BuilderAbsoluteUrl": "https://www.roblox.com/users/7568292/profile/",
  "IsPlayable": true,
  "ReasonProhibited": "None",
  "ReasonProhibitedMessage": "None",
  "IsCopyingAllowed": false,
  "PlayButtonType": "FancyButtons",
  "AssetGenre": "All",
  "AssetGenreViewModel": {
    "DisplayName": "All",
    "Id": 1
  },
  "OnlineCount": 3580,
  "UniverseId": 110181652,
  "UniverseRootPlaceId": 277751860,
  "TotalUpVotes": 2005490,
  "TotalDownVotes": 223919,
  "UserVote": null,
  "OverridesDefaultAvatar": false,
  "UsePortraitMode": false,
  "Price": 0,
  "VoiceEnabled": true,
  "CameraEnabled": true
}
 * ```
 */

export default async (id: number | string): Promise<Object> => {
  const response = await axios.get(`https://www.roblox.com/places/api-get-details?assetId=${id}`);
  return response.data as object;
};
