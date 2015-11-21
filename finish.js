var fs = require('fs');
var request = require('request');
var mkdirp = require('mkdirp');
var cheerio = require('cheerio');

var books = require('./books');



var newBooks = books.map(function(book, i) {
    var isbn = book.isbn[0];
    var path = 'html/' + isbn + '.html';
    var html = fs.readFileSync(path);
    var $ = cheerio.load(html);
    book.publisher = $('[itemprop="publisher"]').text();
    console.log(i, book.publisher);
    return book;
});

fs.writeFile('newBook.json', JSON.stringify(newBooks, null, 4), function(err) {
    if (err) throw err;
    console.log(newBooks.length);
});
