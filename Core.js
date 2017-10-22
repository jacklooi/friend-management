var validator = require('validator');
var database = require('./database.js');

// 1. Create friend connection
var friendConnect = function(req, callback) {
    var friends = req.body.friends;
    var result = validateFriends(friends);

    if (result.success == true) {
        database.connectFriendDB(req, function(err, res) {
            if (err) throw err;
            return callback(null, prettifyJSON({ success: res }));
        });
    }
    else
        return callback(null, prettifyJSON(result));
};

// 2. Retrieve the friends list for an email address
var friendList = function (req, callback) {
    var email = req.body.email;
    var result = validateEmail(email);

    if (result.success == true) {
        database.getFriendsListDB(req, function(err, res) {
            if (err) throw err;
            return callback(null, prettifyJSON({ success: true, friends: res, count: res.length }));
        });
    }
    else
        return callback(null, prettifyJSON(result));
};

// 3. Retrieve common friends list between two email address
var friendCommon = function (req, callback) {
    var friends = req.body.friends;
    var result = validateFriends(friends);

    if (result.success == true) {
        database.getCommonFriendDB(req, function(err, res) {
            if (err) throw err;
            return callback(null, prettifyJSON({ success: true, friends: res, count: res.length }));
        });
    }
    else
        return callback(null, prettifyJSON(result));
};

// 4. Subscribe to updates from an email address
var subscribe = function (req, callback) {
    var emailReq = req.body.requestor;
    var emailTar = req.body.target;
    var result = validateReqTar(emailReq, emailTar);

    if (result.success == true) {
        database.subscribeUserDB(req, function(err, res) {
            if (err) throw err;
            return callback(null, prettifyJSON({ success: res }));
        });
    }
    else
        return callback(null, prettifyJSON(result));
};

// 5. Block updates from an email address
var blockUpdate = function (req, callback) {
    var emailReq = req.body.requestor;
    var emailTar = req.body.target;
    var result = validateReqTar(emailReq, emailTar);

    if (result.success == true) {
        database.blockUserDB(req, function(err, res) {
            if (err) throw err;
            return callback(null, prettifyJSON({ success: res }));
        });
    }
    else
        return callback(null, prettifyJSON(result));
};

// 6. Retrieve all email addresses that can receive updates from an email address
var recipientList = function (req, callback) {
    var sender = req.body.sender;
    var textVal = req.body.text;
    var result = validateEmail(sender);

    if (result.success == true) {
        database.getRecipientsDB(req, function(err, res) {
            if (err) throw err;
            return callback(null, prettifyJSON({ success: true, recipients: res, count: res.length }));
        });
    }
    else
        return callback(null, prettifyJSON(result));
};

var validateFriends = function (friends) {
    // Check if email given more than 2 or less than 2
    if(friends.length > 2)
        return { success: false, reason: "do not more than 2 emails" };
    if(friends.length <= 1)
        return { success: false, reason: "require 2 emails to become friend" };

    // Check if value are empty or null
    if(!friends[0])
        return { success: false, reason: "email 1 cannot be null or empty" };
    if(!friends[1])
        return { success: false, reason: "email 2 cannot be null or empty" };

    // Check if duplicate email
    if(validator.equals(friends[0], friends[1]))
        return { success: false, reason: "email 1 and email 2 are same" };

    // Check if email are valid
    if (!validator.isEmail(friends[0]))
        return { success: false, reason: "incorrect email 1 format" };
    if (!validator.isEmail(friends[1]))
        return { success: false, reason: "incorrect email 2 format" };

    return { success: true };
};

var validateEmail = function (email) {
    if (!email)
        return { success: false, reason: "email cannot be null or empty" };
    if (!validator.isEmail(email))
        return { success: false, reason: "incorrect email format" };

    return { success: true };
};

var checkIfEmailInString = function (text) { 
    var regex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    return text.match(regex);
}

var validateReqTar = function (emailReq, emailTar) {
    // Check if value are empty or null
    if(!emailReq)
        return { success: false, reason: "requestor email cannot be null or empty" };
    if(!emailTar)
        return { success: false, reason: "target email cannot be null or empty" };

    // Check if duplicate email
    if(validator.equals(emailReq, emailTar))
        return { success: false, reason: "requestor email and target email cannot be same" };

    // Check if email are valid
    if (!validator.isEmail(emailReq))
        return { success: false, reason: "incorrect requestor email format" };
    if (!validator.isEmail(emailTar))
        return { success: false, reason: "incorrect target email format" };

    return { success: true };
};

var prettifyJSON = function (jsonData) {
    return JSON.stringify(jsonData, null, 4);
}

exports.friendConnect = friendConnect;
exports.friendList = friendList;
exports.friendCommon = friendCommon;
exports.subscribe = subscribe;
exports.blockUpdate = blockUpdate;
exports.recipientList = recipientList;
