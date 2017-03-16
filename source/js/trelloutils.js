
var TRELLO_API_KEY = "TRELLO_API_KEY";

function getMemberList(callbackFn) {
	if(!Trello.authorized()) {
		authorizeTrelloApi(function() { getMemberListAuthorized(callbackFn); });
	} else {
		getMemberListAuthorized(callbackFn);
	}
}

function getMemberListAuthorized(callbackFn) {
	var boards = Trello.get('/member/me/boards', function(data) {
		var curBoard = {};
		var curUrl = window.location.href;
		for(var i = 0; i < data.length; i++) {
			if(curUrl.startsWith(data[i].shortUrl) || curUrl.startsWith(data[i].url)) {
				curBoard = data[i];
				break;
			}
		}

		// Have current board, can get list of all members for that board
		Trello.get('/boards/' + curBoard.id + '/members', callbackFn, trelloApiCallOnFailure);

	}, trelloApiCallOnFailure);
}



function authorizeTrelloApi(callbackFn) {
	// First check if there is a key in local chrome storage
	storage.get(TRELLO_API_KEY, function(data) { getTrelloApiKeyCallback(data, callbackFn); } );
}


function getTrelloApiKeyCallback(data, callbackFn) {
	
	var trelloApiKey = "";
	if(!$.isEmptyObject(data) && TRELLO_API_KEY in data) {
		trelloApiKey = data[TRELLO_API_KEY];
	} else {
		// TODO: Prompt the user for an api key
		trelloApiKey = "TRELLO_API_KEY"; /* !!! DO NOT COMMIT WITH KEY !!! */
		storage.set({TRELLO_API_KEY: trelloApiKey});
	}

	// Have the key now, authenticate current user
	authorizeTrelloApiKey(trelloApiKey, callbackFn);
}

function authorizeTrelloApiKey(trelloApiKey, callbackFn) {
	Trello.setKey(trelloApiKey);

	Trello.authorize({
	  type: 'popup',
	  name: 'TrelloEnhanced',
	  scope: {
	    read: 'true',
	    write: 'true' 
	  },
	  expiration: 'never',
	  success: callbackFn,
	  error: trelloAuthOnFailure
	});
}


// TODO: Any kind of actual error handling
function trelloAuthOnFailure() {  
	alert("Error authenticating with Trello API");
}

function trelloApiCallOnFailure() {
	alert("Error accessing Trello API");
}