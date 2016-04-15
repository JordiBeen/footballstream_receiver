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
        html += '<div data-match-id=' + matchArray[i] + ' class="match col-md-' + columnClass + '"><h1>MATCH</h1></div>';
    };

    // Append the HTML to the container
    $container.html(html);

    // Fire off the getData function
    getDataForEachMatch()
}

function getDataForEachMatch() {
    var matchInfo = {}
    var $matches = $(".match");
    var matchesLength = $matches.length;
    $matches.each(function(i) {
        $this = $(this);
        var matchId = $this.data('match-id');
        $.get("http://footballstream-api.jordibeen.nl/api/v1/matches/" + matchId, function(data) {
            matchInfo[matchId] = data;
            if (i == matchesLength - 1) {
                fillDataForEachMatch(matchInfo);
            }
        });
    });
}

function fillDataForEachMatch(matchInfo){
    console.log(matchInfo);
}
