$(document).on('data-message-changed', function() {
    splitScreen();
});

function splitScreen() {
    // Get container element
    var $container = $("#container");

    // Create an array according to the matches that came from the app
    var matchString = $container.data('matches');
    var matchArray = matchString.split(",");

    // Check how many matches are selected
    var matchAmount = matchArray.length

    // Alter bootstrap classes according match amount
    // selected
    switch (matchAmount) {
        case 1:
            var columnClass = 12;
            break;
        case 2:
            var columnClass = 6;
            break;
        case 3:
            var columnClass = 4;
            break;
        case 4:
            var columnClass = 6;
            break;
        case 5:
            var columnClass = 4;
            break;
        case 6:
            var columnClass = 4;
            break;
        default:
            var columnClass = 1;
            break;
    }

    // Create HTML according to match amount
    var html = "";
    for (var i = 0; i < matchAmount; i++) {
        html += '<div data-match-id=' + matchArray[i] + ' class="match col-md-' + columnClass + '">\
                    <h1 class="matchup"></h1>\
                    <h2 class="score"></h2>\
                    <p class="stadium"></p>\
                    <p class="attendance"></p>\
                    <p class="referee"></p>\
                    <div class="events"></div>\
                    <div class="competition"></div>\
                </div>';
    };

    // Append the HTML to the container
    $container.html(html);

    // Fire off the getData function
    getDataForEachMatch()
}

function getDataForEachMatch() {
    var $matches = $(".match");
    var matchesLength = $matches.length;

    // Object to be filled with matchid:matchobject structure
    var matchesObject = {}

    // Array to store get requests to be made
    var gets = [];

    // Loop through all matches and create get request according to match id
    $matches.each(function(i) {
        $this = $(this);
        var matchId = $this.data('match-id');
        gets.push($.ajax({
            type: "GET",
            url: "http://footballstream-api.jordibeen.nl/api/v1/matches/" + matchId,
            success: function(data) {
                matchesObject[matchId] = data;
            }
        }));
    });

    // Fire off all get requests, and fill the data when they are done
    $.when.apply($, gets).then(function() {
        fillDataForEachMatch(matchesObject);
    })
}

function fillDataForEachMatch(matchesObject) {
    // Loop through all matches in the matches object
    for (matchId in matchesObject) {
        // Get match info object per match
        var matchInfo = matchesObject[matchId]['match'];
        // Look for base html for this match 
        // will return empty HTML node already loaded in the DOM
        var $matchNode = $("div[data-match-id='" + matchId + "'");

        // MATCHUP
        $matchNode.find('.matchup').html(matchInfo['matchup']);
        // SCORE
        $matchNode.find('.score').html(matchInfo['visitorteam_score'] + " - " + matchInfo['localteam_score']);
        // STADIUM
        $matchNode.find('.stadium').html(matchInfo['stadium']);

    }
}
