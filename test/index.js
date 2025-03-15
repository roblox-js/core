const roflare = require('../lib/index.js');

(async () => {
    console.log(await roflare.GetGroupInfo(12345))
})()