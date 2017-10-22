const MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://mongodbtestings:M7WFgRKYfIczfLg1cSfBuOMYPezi6tZ2zThsbZTtU8oQKY03xogZm5Pu3cfmR7cH3UoxJjKKYuykRJ1Wnj2gcA==@mongodbtestings.documents.azure.com:10255/?ssl=true';

var insertDocument = function(db, callback) {
	db.collection('friends').insertOne( {
	        "id": "andy@example.com",
	        "friends": [
	            "john@example.com"
	        ],
	        "subscribe": [
	            "lisa@example.com"
	        ],
	        "follower": [
	        	"tim@example.com"
	        ],
	        "block": [
	            "james@example.com"
	        ]
	    }, function(err, result) {
	    assert.equal(err, null);
	    console.log("Inserted a document into the families collection.");
	    callback();
	});
};

// Create or Update document for friend connection
var connectFriend = function(db, req, callback) {
	var requestA = req.body.friends[0];
	var requestB = req.body.friends[1];

	addFriend(db, requestA, requestB, function(err, success1) {
		if (err) console.log(err);

		if (success1 == true) {
			addFriend(db, requestB, requestA, function(err, success2) {
				if (err) console.log(err);

				if (success2 == true) {
					return callback(null, success2);
				}
			});
		}
	});
};

// Function: To insert or update the friend list
var addFriend = function(db, requestor, target, callback) {
	isBlocked(db, requestor, target, function(err, count) {
		if (err) console.log(err);
		if (count == 0){ // Check if user begin blocked, if not the proceed connect friend
			db.collection('friends').update(
				{ "id": requestor },
				{
					$addToSet: { "friends" : target }
				},
				{ upsert: true }, function(err, results) {
					if (err) console.log(err);
			    	return callback(null, true);
			});
		}
		else
			return callback(null, false);
	});
};

// Get a list of friends
var getFriendsList = function(db, email, callback) {
	var cursor = db.collection('friends').find({
		"id": email
	});
	cursor.each(function(err, doc) {
	    assert.equal(err, null);
	    if (doc != null) {
			return callback(null, doc);
	    }
	});
};

// Get a list of common friends
var getCommonFriend = function(db, req, callback) {
	var requestA = req.body.friends[0];
	var requestB = req.body.friends[1];
	
	getFriendsList(db, requestA, function(err, docA) {
		if (err) console.log(err);
		var friendListA = docA.friends;

		getFriendsList(db, requestB, function(err, docB) {
			if (err) console.log(err);
			var friendListB = docB.friends;
			
			var commonFriend = [];
			friendListA.forEach(function(entryA) {
				friendListB.forEach(function(entryB) {
					if(entryA == entryB)
						commonFriend.push(entryA);
				});
			});
			return callback(null, commonFriend);
		});
	});
};

// Subscribe to a user for update
var subscribeUser = function(db, req, callback) {
	var requestor = req.body.requestor;
	var target = req.body.target;

	db.collection('friends').update(
		{ "id": requestor },
		{
			$addToSet: { "subscribe" : target }
		},
		{ upsert: true }, function(err, results) {
			if (err) console.log(err);
	});
	db.collection('friends').update(
		{ "id": target },
		{
			$addToSet: { "follower" : requestor }
		},
		{ upsert: true }, function(err, results) {
			if (err) console.log(err);
	    	return callback(null, true);
	});
};

// Block user from update
var blockUser = function(db, req, callback) {
	var requestor = req.body.requestor;
	var target = req.body.target;

	db.collection('friends').update(
		{ "id": requestor },
		{
			$addToSet: { "block" : target }
		},
		{ upsert: true }, function(err, results) {
	    	return callback(null, true);
	});
};

// Get a list of recipients
var getRecipients = function(db, req, callback) {
	var sender = req.body.sender;
    var textVal = req.body.text;
	
	getFriendsList(db, sender, function(err, lists) {
		if (err) console.log(err);
		var friendList = [];
		if("friends" in lists)
			friendList = lists.friends;
		var followerList = []; 
		if("follower" in lists)
			followerList = lists.follower;

		var recipientList = [];
		friendList.forEach(function(friend) {
			if(!recipientList.includes(friend))
				recipientList.push(friend);
		});
		followerList.forEach(function(follower) {
			if(!recipientList.includes(follower))
				recipientList.push(follower);
		});

		for (var i = recipientList.length - 1; i >= 0; i--) {
			isBlocked(db, sender, recipientList[i], i, function(err, count, index) {
				if (err) console.log(err);
				if (count > 0) {
					recipientList.splice(index, 1);
				}
			});
		}
		
		setTimeout( function () {
			// Get list of email in text and form into recipient list
		    var emails = checkIfEmailInString(textVal);
		    emails.forEach(function(email) {
		        recipientList.push(email);
		    });

			return callback(null, recipientList)
		}, 4000);
	});
};

// Function: To identify whether got blocked by user
var isBlocked = function(db, requestor, target, callback) {
	db.collection('friends').find({
		"id": target,
		"block": { $in: [ requestor ] }
	}).count(function(err, count) {
		return callback(null, count);
	});
};

var isBlocked = function(db, requestor, target, index, callback) {
	db.collection('friends').find({
		"id": target,
		"block": { $in: [ requestor ] }
	}).count(function(err, count) {
		return callback(null, count, index);
	});
};

var checkIfEmailInString = function (text) { 
    var regex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    return text.match(regex);
}

 module.exports = {
	connectFriendDB : function(req, callback) {
		MongoClient.connect(url, function(err, db) {
            if (err) console.log(err);
            connectFriend(db, req, function(err, doc) {
				if (err) console.log(err);
				db.close();
				return callback(null, doc);
			});	
		});
	},
	getFriendsListDB : function(req, callback) {
		var emailID = req.body.email;
		MongoClient.connect(url, function(err, db) {
			if (err) console.log(err);
			getFriendsList(db, emailID, function(err, doc) {
				if (err) console.log(err);
				db.close();
				return callback(null, doc.friends);
			});
		});
	},
	getCommonFriendDB : function(req, callback) {
		var emailID = req.body.email;
		MongoClient.connect(url, function(err, db) {
			if (err) console.log(err);
			getCommonFriend(db, req, function(err, doc) {
				if (err) console.log(err);
				db.close();
				return callback(null, doc);
			});
		});
	},
	subscribeUserDB : function(req, callback) {
		MongoClient.connect(url, function(err, db) {
            if (err) console.log(err);
            subscribeUser(db, req, function(err, doc) {
				if (err) console.log(err);
				db.close();
				return callback(null, doc);
			});	
		});
	},
	blockUserDB : function(req, callback) {
		MongoClient.connect(url, function(err, db) {
            if (err) console.log(err);
            blockUser(db, req, function(err, doc) {
				if (err) console.log(err);
				db.close();
				return callback(null, doc);
			});	
		});
	},
	getRecipientsDB : function(req, callback) {
		MongoClient.connect(url, function(err, db) {
            if (err) console.log(err);
            getRecipients(db, req, function(err, doc) {
				if (err) console.log(err);
				db.close();
				return callback(null, doc);
			});	
		});
	}
}