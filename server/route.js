module.exports = function(app, logger){
app.get('/abc', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});
};