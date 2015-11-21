var fs = require('fs');

var units = require('./units');

var books = [];

units.map(function(unit) {
    console.log(unit.name);
    if (unit.isbns) {
        unit.isbns.map(function(isbn) {
            books.push({
                'faculty': unit.faculty,
                'department': unit.department,
                'unit': unit.name,
                'isbn': isbn.split(',')
            });
        });
    }
});

fs.writeFile('books.json', JSON.stringify(books, null, 4), function() {
    console.log(books.length);
});
