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
					//let datatxt = response.title.concat(response.
					fs.writeFile(foldername.concat('/data.json'), JSON.stringify(response, null, 2));
				}).
				then ( () => {
					//xx
					let screenshotnum = 0;
					for (screenshot of response.screenshots) {
						screenshotnum = screenshotnum + 1;
						// 1. make a filename for the screenshot, maybe just number them
						let filename = foldername.concat('/screenshot').concat(screenshotnum).concat('.png');
						fetch(screenshot).
							then( res => res.arrayBuffer()).
							then( b => fs.writeFile(filename, Buffer.from(b)));
					}
				});
		});
}

/*let gplay_apps = [
	{name: 'Tibber Android', text_id: 'com.tibber.android'},
	{name: 'Greenely Android', text_id: 'greenely.greenely'},
	{name: 'Svea Solar (IKEA) Android', text_id: 'com.sveasolar.app.prod'}
];
let apple_apps = [
	{name: 'Tibber iOS', numerical_id: '1127805969'},
	{name: 'Greenely iOS', numerical_id: '980936827'},
	{name: 'Svea Solar (IKEA) iOS', numerical_id: '1540236481'}
];*/


for (app of CONFIG.gplay_apps) {
	scrape_app(gplay, {name: app.name, appId: app.text_id, lang: 'sv', country: 'sv'});
}

for (app of CONFIG.apple_apps) {
	scrape_app(apple, {name: app.name, id: app.numerical_id, lang: 'sv', country: 'se'});
}
