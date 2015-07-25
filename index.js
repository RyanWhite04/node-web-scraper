var fs = require('fs');
var request = require('request');
var mkdirp = require('mkdirp');
var cheerio = require('cheerio');

href = 'http://readinglists.ucl.ac.uk/index.html?browse';
// href = 'http://readinglists.ucl.ac.uk/faculties/art.html';
// href = 'http://readinglists.ucl.ac.uk/departments/basco_art.html';
// href = 'http://readinglists.ucl.ac.uk/modules/basc1001.html';

getHTML(href);

// first checks if html file is saved locally
// if not saved, it will request it
// once requested it will run scrape on the html
function getHTML(href) {

    var file = 'html/' + href.split('.html')[0].split('http://readinglists.ucl.ac.uk/')[1] + '.html';

    if (file === 'html/modules/gene_msc.html') {
        console.log('this file is holding out');
        return;
    }

    fs.readFile(file, 'utf8', function (err, html) {
        console.log('file: ' + file);
        if (err) {
            console.log('err: ' + err);
            if (err.errno === -2) {
                console.log('404');

                // The file isn't saved locally so have to requet it

                request(href, function(err, response, html) {
                    if (err) console.log('err: ' + err);
                    saveHTML(href, html);
                    scrape(href, html);
                });
            }
        }
        else {
            console.log('file found');
            scrape(href, html);
        }
    });

}

// check the html to see if it is a unit or a list of units
// if it is a list of units, run getList on the
function scrape(href, html) {

    var $ = cheerio.load(html);
    var nodes = $('tr[data-node-uri]>td>a.nodeName');

    // it is a list of other files
    if ($('tr[data-node-uri]>td>a.nodeName').length) getList(href, $);

    // it is a unit listing books with have attached isbns
    else getUnit(href, $);
}

// href is the href of the html sent, obviously
// $ is the cheerio object holding all the html
// aim here is to get a list of all the html files listed on the page to get next
// and also to save this list as a json file for later use
function getList(href, $) {
    var json = [];
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
    saveJSON(href, json);
}


function getUnit(href, $) {
    var link = $('tr>td>a[href][title]').attr('href');
    if (link) {
        request(link, function(error, response, html){
            var json = [];
            var $ = cheerio.load(html);
            $('span.isbns.invisible').each(function() {
                json.push($(this).text());
            });
            saveJSON(href, json);
        });
    }
    else {
        console.log('unit has no link, as if it doesn"t exist, spooky...');
    }
}

function saveHTML(href, html) {
    console.log('saveHTML', 'href: ' + href);
    var file = href.split('.html')[0].split('http://readinglists.ucl.ac.uk/')[1];
    var dirp = file.split('/');
    var last = dirp.pop();
    dirp.join('/');
    mkdirp('html/' + dirp, function() {
        console.log('dirp: ' + dirp, 'href: ' + href);
        fs.writeFile('html/' + file + '.html', html, function(err){
            if (err) console.log(err);
        });
    });
}

function saveJSON(href, json) {
    console.log('saveJSON', 'href: ' + href);
    var file = href.split('.html')[0].split('http://readinglists.ucl.ac.uk/')[1];
    var dirp = file.split('/');
    var last = dirp.pop();
    dirp.join('/');
    mkdirp('json/' + dirp, function() {
        console.log('dirp: ' + dirp, 'href: ' + href);
        fs.writeFile('json/' + file + '.json', JSON.stringify(json, null, 4), function(err){
            if (err) console.log(err);
        });
    });
}
