var fs = require('fs');
var books = require('./books');

var departments = books.reduce(function(departments, book) {
    var publisher = book.publisher;
    var department = book.department;
    if (departments[department] !== undefined) departments[department].push(book);
    else departments[department] = [];
    return departments;
}, {});


for (var departmentName in departments) {
    var department = departments[departmentName];

    var publishers = department.reduce(function(publishers, book) {
        var publisher = book.publisher;
        var department = book.department;
        if (publishers[publisher] !== undefined) publishers[publisher]++;
        else publishers[publisher] = 0;
        return publishers;
    }, {});

    // var parray = [];
    var pobject = {};

    for (var publisher in publishers) {
        if (publisher !== "" && publishers[publisher] > 0) {

            /*
            parray.push({
                // 'department': department.department,
                'publisher': publisher,
                'number': publishers[publisher]
            });
            */
            pobject[publisher] = publishers[publisher];

        }
    }

    /*
    parray.sort(function (a, b) {
        if (a.number < b.number) return 1;
        if (a.number > b.number) return -1;
        return 0;
    });
    */

    // departments[departmentName] = parray;
    departments[departmentName] = pobject;
}

fs.writeFile('publishersByDepartment.json', JSON.stringify(departments, null, 4), function() {
    console.log(departments.length);
});
