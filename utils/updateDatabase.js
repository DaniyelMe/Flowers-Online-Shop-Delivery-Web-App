const axios = require('axios');
const re = /<img src="(images\/.*\.jpg)" alt="(\w+)" width="\d+" height="\d+">/g;
const fs = require('fs');

function regexGlobalMathces(regex, string) {
	if(regex.constructor !== RegExp) throw Error('First argument must be a valid RegExp');
	if(typeof string !== 'string') throw Error('Second argument must be a String');

	let matches = [];
	let currentMatch;
	while((currentMatch = regex.exec(string)) ) matches.push({name: currentMatch[2], image: 'http://www.namesofflowers.net/' + currentMatch[1]});

	return matches;
}

async function getFlowers() {
	const page = await axios.get('http://www.namesofflowers.net/names-of-all-flowers.html');

	let matches = regexGlobalMathces(re, page.data)

	fs.writeFile("Database/flowers.json", JSON.stringify(matches), 'utf8', function(err) {
	    if(err) {
	        return console.log(err);
	    }

	    console.log("The file was saved!");
	});

}

getFlowers();
