const gplay = require('google-play-scraper');
const apple = require('app-store-scraper');
const fs = require('fs').promises;
const fetch = require('node-fetch');
const path = require('path');

const CONFIG = require('./config.json');

const csv = require('@fast-csv/parse');

const locales = [
	{
		"name": "Sweden-Swedish",
		"gplay_lang": "sv",
		"gplay_country": "sv",
		"apple_lang": "sv",
		"apple_country": "se"
	},
	{
		"name": "UK-English",
		"gplay_lang": "en_GB",
		"gplay_country": "UK",
		"apple_lang": "en-gb",
		"apple_country": "gb"
	}
];

async function scrape_app (store, app_details) {
	store.app(app_details)
	.then((response) => {
		//console.log(app_details.name);
		var foldername = CONFIG.root_folder.
			concat(app_details.name).
			concat('(').
			concat(app_details.country).
			concat('.').
			concat(app_details.lang).
			concat(')/').
			concat(new Date().toISOString());
		fs.mkdir(foldername, { recursive: true })
		.then ( () => {
			fs.writeFile(foldername.concat('/data.json'), JSON.stringify(response, null, 2));
		})
		.then ( () => {
			let screenshotnum = 0;
			for (screenshot of response.screenshots) {
				screenshotnum = screenshotnum + 1;
				let filename = foldername.concat('/screenshot').concat(screenshotnum).concat('.png');
				fetch(screenshot).
					then( res => res.arrayBuffer()).
					then( b => fs.writeFile(filename, Buffer.from(b)));
			}
		});
		console.log('Success:', app_details.name, app_details.lang, app_details.country);
	})
	.catch(error => {
		console.error('Error:', app_details.name, app_details.lang, app_details.country, error.message);
	});
}

function process_row (row) {
	// Loop through the languages
	// Do both app stores
	console.log("Reading CSV:", row['App Name']);
	for (locale of locales) {
		if (row[locale.name] === "Yes") {
			if (row['Google ID'] === "") {
				console.log("Skipping:",
					row['App Name'].concat(' Android'),
					locale['gplay_lang'],
					locale['gplay_country']
				);
			} else {
				scrape_app(gplay, {
					"name": row['App Name'].concat(" Android"),
					"appId": row['Google ID'],
					"lang": locale['gplay_lang'], 
					"country": locale['gplay_country']
				});
			}

			if (row['Apple ID'] === "") {
				console.log("Skipping:",
					row['App Name'].concat(' iOS'),
					locale['apple_lang'],
					locale['apple_country']
				);
			} else {
				scrape_app(apple, {
					"name": row['App Name'].concat(" iOS"),
					"id": row['Apple ID'],
					"lang": locale['apple_lang'], 
					"country": locale['apple_country']
				});
			}

		}
	}
	
}

csv.parseFile(path.join(__dirname,'/appdatabase.csv'), { headers: true})
	.on('error', error => console.error(error))
	//.on('data', row => console.log(`ROW=${JSON.stringify(row)}`))
	//.on('data', row => console.log(row['Category']))
	.on('data', row => process_row(row))
	.on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
