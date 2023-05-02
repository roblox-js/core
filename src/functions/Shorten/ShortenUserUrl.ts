// https://devforum.roblox.com/t/unofficial-shortblox-url-shorters-for-social-media/779370

export default async (id?: Number, username?: String) => {
  if (!id || !username) throw new Error('Please provide either an id or an username');

  if (id) {
    return `rblx.name/${id}`
  } else if (username) {
    return `rblx.username/${username}`
  }
};
