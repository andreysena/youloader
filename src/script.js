require('dotenv').config();
const axios = require('axios');
const shell = require('shelljs');
const config = require('../config/index');

shell.config.execPath = String(shell.which('node'));
const {
	url, authority, content_type, accept, cookie
} = config;

// const divDownloadedMusic = document.getElementById('container-downloaded-music');
// const textDowloadedMusic = document.getElementById('text-downloaded-music');
const inputText =  document.getElementById('text');
const btnAdd = document.getElementById('btn-add');
const textNumberMusicsInQueue = document.getElementById('number-musics-in-queue');
const textCurrentDownloadingMusic = document.getElementById('text-current-downloading-music');
const btnStartDl = document.getElementById('btn-start-dl');
let links = [];

btnAdd.addEventListener('click', () => {
    if (inputText.value !== "") {
        links.push(inputText.value);
		textNumberMusicsInQueue.innerText = links.length;
        console.log(links);
    }
});

btnStartDl.addEventListener('click', () => {
	if (links.length !== 0) {
		start();
	}
});

async function start() {
	console.log("Número de músicas a serem baixadas: ", links.length);
	links = removeBlankLinks(links);
    await DownloadMusics(links);
	console.log("AS MÚSICAS FORAM BAIXADAS!");
	restartValues();
}

// async function setDownloadedMusicBox(musicName) {
//  	textDowloadedMusic.innerText = `${musicName} baixada com sucesso!`;

//  	divDownloadedMusic.classList.add('fade');
// 	setTimeout(() => {
// 		divDownloadedMusic.classList.remove('fade');
// 	}, 2000);	
// }

function restartValues() {
	links = [];
	textNumberMusicsInQueue.innerText = 0;
	textCurrentDownloadingMusic.innerText = "";
}

function removeBlankLinks(links) {
	let filteredLinks = links.filter((link, i) => {
		if (link !== "")
			return link; 
	});

	return filteredLinks;
}

function parseVideoLinkToBase64(link) {
	let buff = new Buffer.from(link);
	let video_url = buff.toString('base64');

	return video_url;
}

async function getMusicName(video_id) {
	let title;
	await axios({
		url: `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${video_id}&key=${process.env.GOOGLE_KEY}`,
		headers: {
			'Accept': 'application/json'
		},
		method: 'GET'
	}).then(data => {
		title = data.data.items[0].snippet.title;
	}).catch(error => {
		console.log("Deu error: " + error);
	});

	while (title && title.indexOf('/') !== -1){
		title = title.replace('/', '|');
	}

	return title;
}

function getVideoId(link) {
	if (link.substring(0, 8) === "https://") {
		return link.substring(32, 43);
	} else {
		return link.substring(24, 35);
	}
}

function getVideoUrl(link) {
	if (link.substring(0, 8) === "https://") {
		return link.substring(8, 43);
	} else {
		return link.substring(0, 35);
	}
}

async function DownloadMusics(musicsLinks) {
	textCurrentDownloadingMusic.innerText = "Baixando músicas...";

	for (let i = 0; i < musicsLinks.length; i++) {
		if (musicsLinks[i]) {
			let video_id = getVideoId(musicsLinks[i]);
			let video_url = parseVideoLinkToBase64(getVideoUrl(musicsLinks[i]));

			let music_name = await getMusicName(video_id);
			console.log("Baixando: " + music_name);

			let response = shell.exec(`curl '${url}' -H '${authority}' -H '${content_type}' -H '${accept}' -H '${cookie}' --data-raw 'video_id=${video_id}&remove_silence=true&normalize=true&discover_metadata=true&video_url=${video_url}&format=mp3&title=&artist=&start_time=false&end_time=false&thingy=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbF9mb3JfYXBpX2FjY2VzcyI6ImpvaG5AbmFkZXIubXgifQ.YPt3Eb3xKekv2L3KObNqMF25vc2uVCC-aDPIN2vktmA&audio_quality=128k' -s --max-time 150 --output "../musics/${music_name}.mp3"`);
			if (response.code !== 0) {
				i--;
				shell.exec(`rm -rf '../musics/${music_name}.mp3'`);
			}
			// setDownloadedMusicBox(music_name);
		}
	}
}

