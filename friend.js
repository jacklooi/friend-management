var express = require('express');
var router = express.Router();
var core = require('./Core.js');

// Log time when use this router
router.use(function timeLog (req, res, next) {
	console.log('Time: ', Date.now());
	next();
});

router.get('/', function (req,res) {
	res.send('Welcome to Friend Management API <br/>' +
		'For API document, please visit: http://friendmanagement.azurewebsites.net/docs');
});

// POST /friend
router.post('/friend', function (req,res) {
	core.friendConnect(req, function(err, respond) {
		if (err) return next(err);
		return res.send(respond);
	});
});

// POST /friend/list
router.post('/friend/list', function (req,res) {
	core.friendList(req, function(err, respond) {
		if (err) return next(err);
		return res.send(respond);
	});
});

// POST /friend/common
router.post('/friend/common', function (req,res) {
	core.friendCommon(req, function(err, respond) {
		if (err) return next(err);
		return res.send(respond);
	});
});

// POST /subscribe
router.post('/subscribe', function (req,res) {
	core.subscribe(req, function(err, respond) {
		if (err) return next(err);
		return res.send(respond);
	});
});

// POST /block
router.post('/block', function (req,res) {
	core.blockUpdate(req, function(err, respond) {
		if (err) return next(err);
		return res.send(respond);
	});
});

// POST /recipient
router.post('/recipient', function (req,res) {
	core.recipientList(req, function(err, respond) {
		if (err) return next(err);
		return res.send(respond);
	});
});

module.exports = router;