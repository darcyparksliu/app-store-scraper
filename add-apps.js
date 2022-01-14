var APPCONFIG = require('./apps.json');
const NEWAPPS = require('./new-apps.json');

// note!!!
// I have not tested importing from new-apps.json.
// As of 14 Jan 2022


// append each app_info to the right array in APPCONFIG
// write the new variable to disk


for (app of NEWAPPS.new_android_apps) {
	let app_info = {
		name: app.name.concat(" Android"),
                text_id: app.id,
		locales: [
		{
			lang: "sv",
			country: "sv"
		},
	]
        };
	//console.log("Adding", app_info.name, app_info.text_id);
	APPCONFIG.gplay_apps.push(app_info);
}

for (app of NEWAPPS.new_ios_apps) {
	let app_info = {
		name: app.name.concat(" iOS"),
                numerical_id: app.id,
		locales: [
		{
			lang: "sv",
			country: "se"
		},
	]
        };
	//console.log("Adding", app_info.name, app_info.numerical_id);
	APPCONFIG.apple_apps.push(app_info);
}

console.log(JSON.stringify(APPCONFIG, null, 2));
