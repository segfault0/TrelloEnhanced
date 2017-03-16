// TODO: Make usage of member/user CONSISTENT
// TODO: Calculate and set width of current user field?

// Create the array of member elements that will be used for randomly selecting
var storage = chrome.storage.local;
$(function() {

	// Get member list and setup user shuffle after retrieving
	getMemberList(setupUserShuffle);

	// Populate lists with initial card counts and setup mutation observer to update
	updateCardCounts();
	setupListCardCounts();

});

function setupListCardCounts() {
	// Add mutation observer to each list
	var allCardLists = document.getElementsByClassName("js-list-cards");
	for(var i = 0; i < allCardLists.length; i++) {
		var cardList = allCardLists[i];
		var cardListMutationObserver = new MutationObserver(function(mutations, observer) { updateCardCount(observer['cardList']); } );
		cardListMutationObserver['cardList'] = cardList;
		cardListMutationObserver.observe(cardList, {
				childList: true,
				subtree: true,
				attributes: true,
				characterData: false
			}
		);
	}
}

function updateCardCounts() {
	$(".js-list-content").each(function() {
			updateCardCount(this);
		}
	)
}

function updateCardCount(cardList) {
	var $fullList = $(cardList).closest(".js-list-content");
	var numVisibleCards = $fullList.find(".list-card:not('.hide')").length;
	var listName = $fullList.find("h2").text();
	$fullList.find("textarea").text(listName + " (" + numVisibleCards + ")");
}

var fullMemberList, curMemberList;
function setupUserShuffle(memberList) {
    // Filter Trello users by ID first
    var filterUserList = []; // Will be populated by user in the future
	fullMemberList = memberList.filter(function(el) { return filterUserList.indexOf(el.id) });
	curMemberList = fullMemberList;
	setupUI();
}

// Calling this without a userId will undo any current filter
function filterByUserId(userId) {
	// Remove all hide classes to undo any current filtering
	$(".list-card").removeClass("hide");

	if(!$.isEmptyObject(userId)) {
		// Filter all cards that are not assigned to the current user
		$(".list-card:not(:has('.js-member-on-card-menu[data-idmem=" + userId + "]'))").addClass("hide");
	}
}

var curShuffleList = [];
var curShuffleIndex = 0;
var newShuffle = true;
function randomBtnOnClick() {
    if(newShuffle) {
        newShuffle = false;
        curShuffleList = [];
    }

	if(!$(".user-control-btn").is(":visible")) {
        $(".user-control-btn").show();
	}

	// TODO: Change how restarting is handled?
	if($.isEmptyObject(curMemberList)) {
        newShuffle = true; // Start a new shuffle the next time the random user button is clicked
		$("#cur-user-text").text("Done!");
		filterByUserId();
		curMemberList = fullMemberList;
		return;
	}

	var nextMember = curMemberList[Math.floor(Math.random() * curMemberList.length)];
    curShuffleList.push(nextMember);
    curShuffleIndex = curShuffleList.length - 1;
	curMemberList = curMemberList.filter(function(el) { return el.id != nextMember.id });

    updateDisplayedMember(nextMember);
}

function updateDisplayedMember(nextMember) {
    var name = nextMember.fullName;
    var noFilter = nextMember.noFilter != null ? nextMember.noFilter : false;
    var id = noFilter ? null : nextMember.id;

    $("#cur-user-text").text(name);
    $("#cur-user").attr("user-id", id);
    $("#cur-user").attr("filtered", true);

    filterByUserId(id);
}

function setupUI() {
	var toolbarUrl = chrome.extension.getURL("/html/toolbar-template.html");
	$.get(toolbarUrl, function(data, textStatus, jqXHR) {
	    $("#permission-level").after(data);

	    $("#random-user").click(randomBtnOnClick);
        $("#prev-user").click(function() { curShuffleIndex = (curShuffleIndex == 0) ? curShuffleList.length - 1 : curShuffleIndex - 1; updateDisplayedMember(curShuffleList[curShuffleIndex]); } );
        $("#next-user").click(function() { curShuffleIndex = (curShuffleIndex + 1) % curShuffleList.length; updateDisplayedMember(curShuffleList[curShuffleIndex]); } );

        $("#cur-user").click(function() {
            if(!this.hasAttribute("user-id")) {
                return;
            }
            if(this.hasAttribute("filtered")) {
                filterByUserId();
                this.removeAttribute("filtered");
            } else {
                filterByUserId(this.getAttribute("user-id"));
                this.setAttribute("filtered", true);
            }
        });
	},"html");
}