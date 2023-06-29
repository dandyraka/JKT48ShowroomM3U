import fs from "fs";
import fetch from "node-fetch";

let m3u_content = "#EXTM3U\n";

function getStreamUrl(roomid) {
    const url = `https://www.showroom-live.com/api/live/streaming_url?abr_available=1&room_id=${roomid}`;
    return fetch(url)
        .then(response => response.json())
        .then(json => json.streaming_url_list[0].url)
        .catch(error => {
            return `Fetch Error: ${error}`;
        });
}

async function getLive() {
    const url = 'https://www.showroom-live.com/api/live/onlives';
    try {
        const response = await fetch(url);
        const json = await response.json();
        const data = json.onlives;

        const OnlivesIdol = data.find(onlvs => onlvs.genre_id === 102);
        const livesOnlivesIdol = OnlivesIdol ? OnlivesIdol.lives : [];
        const OnlivesMusic = data.find(onlvs => onlvs.genre_id === 101);
        const livesOnlivesMusic = OnlivesMusic ? OnlivesMusic.lives : [];
        const allLives = livesOnlivesIdol.concat(livesOnlivesMusic);
        const filterAll = allLives.filter(live => live.room_url_key.includes('room'));

        for (const data of filterAll) {
            const username = data.main_name || 'No Name';
            const image = data.image_square;
            const roomId = data.room_id;
            const streamUrl = await getStreamUrl(roomId);
            m3u_content += `#EXTINF:-1 tvg-id="Showroom" tvg-name="Showroom ${username}" tvg-logo="${image}" group-title="Showroom",Showroom ${username}\n${streamUrl}\n`;
            //console.log(`#EXTINF:-1 tvg-id="Showroom" tvg-name="Showroom ${username}" tvg-logo="${image}" group-title="Showroom",Showroom ${username}`);
            //console.log(streamUrl);
        }
    } catch (error) {
        console.log(`Fetch Error: ${error}`);
    }
}


await getLive();

fs.writeFileSync(
    `JKT48Showroom.m3u`,
    m3u_content
);