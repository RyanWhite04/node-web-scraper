var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var mkdirp = require('mkdirp');

href = 'http://readinglists.ucl.ac.uk/index.html?browse';
// href = 'http://readinglists.ucl.ac.uk/faculties/art.html';
// href = 'http://readinglists.ucl.ac.uk/departments/basco_art.html';
// href = 'http://readinglists.ucl.ac.uk/modules/basc1001.html';

mkdirp('json', function() {
    scrape(href);
});

function scrape(href) {
    request(href, function(error, response, html){
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
    });
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
        scrape(href);
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
