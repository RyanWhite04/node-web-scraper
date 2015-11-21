var fs = require('fs');
var data = require('./publishersByDepartment.json');

var flat = [];

Object.keys(data).map(function(departmentName) {
    var total = Object.keys(data[departmentName]).reduce(function(total, publisherName) {
        return total + data[departmentName][publisherName];
    }, 0);
    Object.keys(data[departmentName]).map(function(publisherName) {
        console.log(departmentName, publisherName);
        var books = data[departmentName][publisherName];
        flat.push({
            'department': departmentName,
            'publisher': publisherName,
            'books': books,
            'percent': 100*books/total
        });
    })
})

fs.writeFile('flattenedPublishers.json', JSON.stringify(flat, null, 4), function(err) {
    if (err) throw err;
    console.log(flat.length);
});
