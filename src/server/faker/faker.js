var fs = require('fs');
var faker = require('faker');

var header = 'video_id | recent_views | total_views\n';


// var file = fs.createWriteStream('./data.csv');
var file2 = fs.createWriteStream('./data2.csv');

// file.write(header);
file2.write(header);

var video_id;
var recent_views;
var total_views;
var csvData;

// for (var i = 0; i < 5000000; i++) {
// 	video_id = i;
// 	recent_views = faker.random.number(100000).toString();
// 	total_views = faker.random.number(200000000).toString();
// 	csvData = `${video_id}|${recent_views}|${total_views}\n`;

// 	file.write(csvData);


// }

for (var i = 5000001; i < 9999999; i++) {
	video_id = i;
	recent_views = faker.random.number(100000).toString();
	total_views = faker.random.number(200000000).toString();
	csvData = `${video_id}|${recent_views}|${total_views}\n`;

	file2.write(csvData);


}



// file.end(function() {
// 	console.log('finished');
// });

file2.end(function() {
	console.log('finished two files');
});






