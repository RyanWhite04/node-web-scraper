var fs = require('fs');
var books = require('./books');

var faculties = books.reduce(function(faculties, book) {
    var publisher = book.publisher;
    var faculty = book.faculty;
    if (faculties[faculty] !== undefined) faculties[faculty].push(book);
    else faculties[faculty] = [];
    return faculties;
}, {});

var farray = [];

for (var faculty in faculties) {
    farray.push({
        'faculty': faculty,
        'books': faculties[faculty]
    });
}

var pubsByFaculty = farray.map(function(faculty) {
    var publishers = faculty.books.reduce(function(publishers, book) {
        var publisher = book.publisher;
        var faculty = book.faculty;
        if (publishers[publisher] !== undefined) publishers[publisher]++;
        else publishers[publisher] = 0;
        return publishers;
    }, {});

    var parray = [];

    for (var publisher in publishers) {
        if (publisher !== "") {
            parray.push({
                'faculty': faculty.faculty,
                'publisher': publisher,
                'number': publishers[publisher]
            });
        }
    }

    parray.sort(compare);

    return parray.slice(0, 10);

    function compare(a, b) {
        if (a.number < b.number) return 1;
        if (a.number > b.number) return -1;
        return 0;
    }

});

fs.writeFile('orderedBooks.json', JSON.stringify(pubsByFaculty, null, 4), function() {
    console.log(pubsByFaculty.length);
});
