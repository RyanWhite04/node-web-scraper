var fs = require('fs');
var request = require('request');
var mkdirp = require('mkdirp');
var cheerio = require('cheerio');
// href = 'http://readinglists.ucl.ac.uk/index.html?browse';
// href = 'http://readinglists.ucl.ac.uk/faculties/art.html';
// href = 'http://readinglists.ucl.ac.uk/departments/basco_art.html';
// href = 'http://readinglists.ucl.ac.uk/modules/basc1001.html';
// mkdirp('ucl', getFaculties);
// var faculties = require('./faculties.json');
// faculties.map(getDepartments);
// Number of faculties: 9
// Number of departments: 63
// Number of units: 1706
// var departments = require('./departments.json');
// departments.map(getUnits);

function getFaculties() {
    request('http://readinglists.ucl.ac.uk/index.html?browse', function(err, response, html) {
        if (err) console.log('err: ' + err);
        var $ = cheerio.load(html);
        $('tr[data-node-uri]>td>a.nodeName').each(function() {
            var href = $(this).attr('href');
            var name = $(this).attr('title');
            var faculty = {
                'href': href,
                'name': name
            };
            fs.appendFile('faculties.json', JSON.stringify(faculty, null, 4) + ',\n', function(err) {
                if (err) throw err;
                console.log('Saved: ' + faculty.name);
            });
            // getDepartments(faculty);
        });
    });
}
function getDepartments(faculty) {
    console.log('Faculty: ' + faculty.name);
    request(faculty.href, function(err, response, html) {
        if (err) console.log('err: ' + err);
        var $ = cheerio.load(html);
        $('tr[data-node-uri]>td>a.nodeName').each(function() {
            var href = $(this).attr('href');
            var name = $(this).attr('title');
            var department = {
                'href': href,
                'name': name,
                'faculty': faculty
            };
            fs.appendFile('departments.json', JSON.stringify(department, null, 4) + ',\n', function(err) {
                if (err) throw err;
                console.log('Saved: ' + department.name);
            });
            // getUnits(department);
        });
    });
}
function getUnits(department) {
    console.log('Department: ' + department.name);
    request(department.href, function(err, response, html) {
        if (err) console.log('err: ' + err);
        var $ = cheerio.load(html);
        $('tr[data-node-uri]>td>a.nodeName').each(function() {
            var href = $(this).attr('href');
            var name = $(this).attr('title');
            var unit = {
                'href': href,
                'name': name,
                'department': department
            };
            fs.appendFile('modules.json', JSON.stringify({
                'href': href,
                'name': name,
                'department': department.name,
                'faculty': department.faculty.name
            }, null, 4) + ',\n', function(err) {
                if (err) throw err;
                console.log('Saved: ' + unit.name);
            });
            // getUnitJson(unit);
        });
    });
}
function getUnitLink(units, unitNumber) {
    var unit = units[unitNumber];
    if (unitNumber < units.length) {
        console.log('Unit: ' + unit.name, unitNumber);
        request(unit.href, function(err, response, html) {
            if (err) console.log('err: ' + err);
            var $ = cheerio.load(html);
            unit.link = $('tr>td>a[href][title]').attr('href');
            fs.appendFile('units.json', JSON.stringify(unit, null, 4) + ',\n', function() {
                getUnitLink(units, unitNumber + 1);
            });
        });
    }
    else {
        console.log('finished');
    }
}

// getUnitIsbn(units, 0);
// getUnitIsbn(units, 214); // 213: ARCL3036: Indigenous Archaeology
// getUnitIsbn(units, 218); // 216: ARCL3046: Lithic Technology

function getUnitIsbn(units, unitNumber) {
    var unit = units[unitNumber];
    if (unitNumber < units.length) {
        console.log(unitNumber, 'Unit: ' + unit.name);
        if (unit.link) {
            request(unit.link, function(err, response, html) {
                if (err) console.log('err: ' + err);
                var $ = cheerio.load(html);
                unit.isbns = [];
                $('span.isbns.invisible').each(function() {
                    unit.isbns.push($(this).text());
                });
                fs.appendFile('units.json', JSON.stringify(unit, null, 4) + ',\n', function() {
                    getUnitIsbn(units, unitNumber + 1);
                });
            });
        }
        else {
            fs.appendFile('units.json', JSON.stringify(unit, null, 4) + ',\n', function() {
                getUnitIsbn(units, unitNumber + 1);
            });
        }
    }
    else {
        console.log('finished');
    }
}

/*
fs.appendFile('units.json', JSON.stringify(unit, null, 4) + ',\n', function(err) {
    if (err) console.log('Unit: ' + unit.name, err);
    console.log('Saved: ' + unit.link);
});
*/

function getUnitJson(unit) {
    console.log('Unit: ' + unit.name);
    request(unit.href, function(err, response, html) {
        if (err) console.log('err: ' + err);
        var $ = cheerio.load(html);
        var link = $('tr>td>a[href][title]').attr('href');
        if (link) {
            request(link, function(error, response, html){
                unit.isbns = [];
                var $ = cheerio.load(html);
                $('span.isbns.invisible').each(function() {
                    unit.isbns.push($(this).text());
                });
            });
        }
        else console.log('Broke: ' + unit.name);
    });
}
