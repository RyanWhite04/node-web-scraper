var fs = require('fs');
var request = require('request');
var mkdirp = require('mkdirp');
var cheerio = require('cheerio');
var books = require('./books');
var argv = process.argv;

console.log(argv[2], argv[3]);

continueScrape(books, +argv[2], +argv[3]);

function continueScrape(books, start, end) {
    console.log(start + '/' + end);
    if (start < end) getBookInfo(books[start], start);
    else console.log('finished book: ' + end);
}

function getBookInfo(book, bookNumber) {
    // console.log('Book: ', bookNumber, book.isbn);
    var isbn = book.isbn[0];
    var href = 'http://isbndb.com/search/all?query=' + isbn;
    var path = 'html/' + isbn + '.html';
    fs.readFile(path, 'utf8', function (err, html) {
        if (err) {
            if (err.errno === -2) {
                // console.log('href: ' + href);
                request(href, function(err, response, html) {
                    if (err) console.log('err: ' + err, bookNumber);
                    fs.writeFile(path, html, function(err){
                        if (err) console.log('err: ' + err, 'html/' + isbn + '.html');
                        continueScrape(books, bookNumber + 1, +argv[3]);
                    });
                });
            }
        }
        else continueScrape(books, bookNumber + 1, +argv[3]);
    });
}

/*
var $ = cheerio.load(html);
book.publisher = $('[itemprop="publisher"]').text();
fs.appendFile('finishedBooks.json', JSON.stringify(book, null, 4) + ',\n', function() {
    continueScrape(books, bookNumber + 1);
});
*/
