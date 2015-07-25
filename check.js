var units = require('./units');

var hasLinks = units.filter(function(unit) {
    return unit.link !== undefined;
});

var hasLinksAndIsbns = hasLinks.filter(function(unit) {
    return unit.isbns.length > 0;
});

var numberIsbns = hasLinksAndIsbns.reduce(function(total, unit) {
    return total + unit.isbns.length;
}, 0);

console.log(numberIsbns);
