// Display modifier text with appropriate sign
Handlebars.registerHelper('modifier', function (val) {
    return val >= 0 ? `+${val}` : `${val}`;
});