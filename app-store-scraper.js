const gplay = require('google-play-scraper');
const apple = require('app-store-scraper');
const fs = require('fs').promises;
const fetch = require('node-fetch');

const CONFIG = require('./config.json');

async function scrape_app (store, app_details) {
	store.app(app_details).
		then((response) => {
			var foldername = CONFIG.root_folder.
				concat(app_details.name).
				concat('/').
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
		});
}

for (app of CONFIG.gplay_apps) {
	scrape_app(gplay, {name: app.name, appId: app.text_id, lang: 'sv', country: 'sv'});
}

for (app of CONFIG.apple_apps) {
	scrape_app(apple, {name: app.name, id: app.numerical_id, lang: 'sv', country: 'se'});
}
