var fs = require('fs');
var request = require('request');
var mkdirp = require('mkdirp');
var cheerio = require('cheerio');

// href = 'http://readinglists.ucl.ac.uk/index.html?browse';
href = 'http://readinglists.ucl.ac.uk/faculties/art.html';
// href = 'http://readinglists.ucl.ac.uk/departments/basco_art.html';
// href = 'http://readinglists.ucl.ac.uk/modules/basc1001.html';

getHTML(href);

function getHTML(href, callback) {

    var file = 'html/' + href.split('.html')[0].split('http://readinglists.ucl.ac.uk/')[1] + '.html';
    fs.readFile(file, 'utf8', function (err, html) {
        console.log('file: ' + file);
        if (err) {
            console.log('err: ' + err);
            if (err.errno === -2) {
                console.log('404');
                request(href, function(err, response, html) {
                    if (err) console.log('err: ' + err);
                    saveHTML(href, html, function() {
                        console.log('html file saved');
                        scrape(html);
                    });
                });
            }
        }
        else {
            console.log('file found');
            scrape(html);
        }
    });

}

function scrape(html) {
    var $ = cheerio.load(html);
    var nodes = $('tr[data-node-uri]>td>a.nodeName');
    var file = href.split('.html')[0].split('http://readinglists.ucl.ac.uk/')[1];
    var dirp = file.split('/');
    var last = dirp.pop();
    dirp.join('/');
    mkdirp('json/' + dirp, function() {
        if ($('tr[data-node-uri]>td>a.nodeName').length) getList(file, $);
        else getUnit(file, $);
    });
    console.log('dirp: ' + dirp, 'href: ' + href);
}

function getList(file, $) {
    var json = [];
    console.log('file: ' + file);
    $('tr[data-node-uri]>td>a.nodeName').each(function() {
        var href = $(this).attr('href');
        var name = $(this).attr('title');
        var file = 'json/' + href.split('.html')[0].split('http://readinglists.ucl.ac.uk/')[1] + '.json';
        json.push({
            'href': href,
            'name': name,
            'file': file
        });
        getHTML(href);
    });
    fs.writeFile('json/' + file + '.json', JSON.stringify(json, null, 4), function(err){
        if (err) console.log(err);
        // console.log('File successfully written');
    });
}

function getUnit(file, $) {
    var link = $('tr>td>a[href][title]').attr('href');
    console.log('file: ' + file);
    console.log('link: ' + link);
    if (link) {
        request(link, function(error, response, html){
            var json = [];
            var $ = cheerio.load(html);
            $('span.isbns.invisible').each(function() {
                json.push($(this).text());
            });
            fs.writeFile('./json/' + file + '.json', JSON.stringify(json, null, 4), function(err){
                if (err) console.log(err);
                // console.log('File successfully written');
            });
        });
    }
}

function saveHTML(href, html, callback) {
    console.log('saveHTML', 'href: ' + href);
    var file = href.split('.html')[0].split('http://readinglists.ucl.ac.uk/')[1];
    var dirp = file.split('/');
    var last = dirp.pop();
    dirp.join('/');
    mkdirp('html/' + dirp, function() {
        console.log('dirp: ' + dirp, 'href: ' + href);
        fs.writeFile('html/' + file + '.html', html, function(err){
            if (err) console.log(err);
            callback();
            // console.log('File successfully written');
        });
    });
}

function saveJSON(href, json, callback) {
    var file = href.split('.html')[0].split('http://readinglists.ucl.ac.uk/')[1];
    var dirp = file.split('/');
    var last = dirp.pop();
    dirp.join('/');
    mkdirp('json/' + dirp, function() {
        console.log('dirp: ' + dirp, 'href: ' + href);
        fs.writeFile('json/' + path + '.json', JSON.stringify(json, null, 4), function(err){
            if (err) console.log(err);
            callback();
            // console.log('File successfully written');
        });
    });
}


// fs.readFile('not.there', function(err, data) {
//     if (err) throw err;
//     console.log(data);
// });
