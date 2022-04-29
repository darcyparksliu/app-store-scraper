const gplay = require('google-play-scraper');
const apple = require('app-store-scraper');
const fs = require('fs').promises;
const fetch = require('node-fetch');

const CONFIG = require('./config.json');
const APPCONFIG = require('./apps.json');

async function scrape_app (store, app_details) {
	store.app(app_details).
		then((response) => {
			console.log(app_details.name);
			var foldername = CONFIG.root_folder.
				concat(app_details.name).
				concat('(').
				concat(app_details.country).
				concat('.').
				concat(app_details.lang).
				concat(')/').
				concat(new Date().toISOString());
			fs.mkdir(foldername, { recursive: true }).
				then ( () => {
					fs.writeFile(foldername.concat('/data.json'), JSON.stringify(response, null, 2));
				}).
				then ( () => {
					let screenshotnum = 0;
					for (screenshot of response.screenshots) {
						screenshotnum = screenshotnum + 1;
						let filename = foldername.concat('/screenshot').concat(screenshotnum).concat('.png');
						fetch(screenshot).
							then( res => res.arrayBuffer()).
							then( b => fs.writeFile(filename, Buffer.from(b)));
					}
				});
		}).
		catch(error => {
			console.log('Error:', app_details.name);
			console.log(error);
		});
}

for (app of APPCONFIG.gplay_apps) {
	for (locale of app.locales) {
		scrape_app(gplay, {name: app.name, appId: app.text_id, lang: locale.lang, country: locale.country});
	}
}

for (app of APPCONFIG.apple_apps) {
	for (locale of app.locales) {
		scrape_app(apple, {name: app.name, id: app.numerical_id, lang: locale.lang, country: locale.country});
	}
}
