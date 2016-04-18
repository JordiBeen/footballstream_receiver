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
        html += '   <div class="col-md-' + columnClass + '"">\
                        <div data-match-id=' + matchArray[i] + ' class="match text-center well">\
                            <div class="row">\
                                <p class="date_start"></p>\
                                <p class="matchup"></p>\
                                <p class="status"></p>\
                            </div>\
                            <div class="row info hidden">\
                                <p class="attendance"></p>\
                                <p class="referee"></p>\
                                <div class="events"></div>\
                                <div class="competition"></div>\
                                <div class="home col-md-4"></div>\
                                <div class="stats col-md-4"></div>\
                                <div class="away col-md-4"></div>\
                            </div>\
                        </div>\
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
    var requests = [];

    // Loop through all matches and create get request according to match id
    $matches.each(function(i) {
        $this = $(this);
        var matchId = $this.data('match-id');
        requests.push($.ajax({
            type: "GET",
            url: "http://footballstream-api.jordibeen.nl/api/v1/matches/" + matchId,
            success: function(data) {
                matchesObject[matchId] = data;
            }
        }));
    });

    // Fire off all get requests, and fill the data when they are done
    $.when.apply($, requests).then(function() {
        fillBasicInfoForEachMatch(matchesObject);
    })
}

function fillBasicInfoForEachMatch(matchesObject) {
    // Loop through all matches in the matches object
    for (matchId in matchesObject) {
        // Get match info object per match
        var matchInfo = matchesObject[matchId]['match'];
        // Look for base html for this match 
        // will return empty HTML node already loaded in the DOM
        var $matchNode = $("div[data-match-id='" + matchId + "'");


        // Show basic info that every match has
        // DATE START
        $matchNode.find('.date_start').html(matchInfo['date_start']);

        // MATCHUP
        $matchNode.find('.matchup').html(matchInfo['matchup']);

        // Replace all characters with a - so we get a date object
        // like this: "01-01-2016-20-30"
        var match_data_raw = matchInfo['date_start'].replace(' ', '-').replace(':', '-');
        // Split the datestring so we get an array
        var date_part = match_data_raw.split('-');

        // Get current date
        var now = new Date();
        // The following is used to parse our European date format into a JavaScript date object
        var match_datetime = new Date(date_part[2], date_part[1]-1, date_part[0], date_part[3], date_part[4]);

        // We need to do this twice, because we check on setHours later,
        // this caused the current date to lose all hours, minutes and seconds values
        var check_now = new Date();
        var check_match_datetime = new Date(date_part[2], date_part[1]-1, date_part[0], date_part[3], date_part[4]);

        // Check if the date is in the future, but it is today
        if(match_datetime > now && (check_now.setHours(0,0,0,0) == check_match_datetime.setHours(0,0,0,0))){
            $matchNode.find('.status').html("<p class='countdown'></p>").countdown(match_datetime, function(event){
                $(this).find('.countdown').text(
                    event.strftime("Starts in %-H hours and %M minutes and %S seconds")
                )
            })
        // Check if the date is in the future
        } else if (match_datetime > now){
            $matchNode.find('.status').countdown(match_datetime, function(event){
                $(this).text(
                    event.strftime("Starts %-D days from now")
                )
            });
        // The date has passed, game has begun or is finished, we can show all of our info now
        } else {
            fillDetailedInfoForEachMatch(matchInfo, $matchNode);
        }
    }
}

function fillDetailedInfoForEachMatch(matchInfo, $matchNode){
    // Show score
    $matchNode.find('.status').html("<span class='score'><strong>" + matchInfo['localteam_score'] + " - " + matchInfo['visitorteam_score'] + "</strong></span>");

    // Remove hidden info div    
    var $info = $matchNode.find('.info');
    $info.removeClass('hidden');

    var $home = $info.find('.home');
    var $stats = $info.find('.stats');
    var $away = $info.find('.away');
    var localteam = matchInfo['match_stats']['localteam'];
    var awayteam = matchInfo['match_stats']['visitorteam'];
    var statToStringMapping = {
        "saves": "Saves",
        "yellowcards": "Yellow cards",
        "offsides": "Offsides",
        "fouls": "Fouls",
        "shots_ongoal": "Shots on goal",
        "redcards": "Red cards",
        "corners": "Corners",
        "possesiontime": "Possesion",
        "shots_total": "Shots total"
    };
    for(stats in localteam){
        stats = localteam[stats];
        for(stat in stats){
            $home.append("<p class=" + stat + ">" + stats[stat] + "</p>");    
            $stats.append("<p><strong>" + statToStringMapping[stat] + "</strong></p>")
        }
    }

    for(stats in awayteam){
        stats = awayteam[stats];
        for(stat in stats){
            $away.append("<p class=" + stat + ">" + stats[stat] + "</p>");    
        }
    }
}
