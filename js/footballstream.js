$(document).ready(function() {
    setTimeout(function(){
        $('body').removeClass('loading');
    }, 3000);
});

$(document).on('data-message-changed', function() {
    splitScreen();
    setInterval(function(){ 
        getDataForEachMatch(false);
    }, 60000);
    $("#event").removeClass('hidden');
});

function splitScreen() {
    // Get container element
    var $container = $("#container");

    //Set ammount of colums per section
    var columns = 2;

    // Hide event element
    $("#event").hide();

    // Create an array according to the matches that came from the app
    var matchString = $container.data('matches');
    var matchArray = matchString.split(",");

    // Check how many matches are selected
    var matchAmount = matchArray.length

    // Set the column width
    var columnClass = 12 / columns;

    // Create HTML according to match amount
    var html = "";
    for (var i = 0; i < matchAmount; i++) {
        if ((i % columns) == 0) {
            html += '<div class="section">'
        }
        html += '   <div class="col-md-' + columnClass + ' match-col">\
                        <div class="panel-heading text-center">\
                            <h3 class="panel-title competition"></h3>\
                        </div>\
                        <div data-match-id=' + matchArray[i] + ' class="match text-center well">\
                            <div class="row basic-info">\
                                <p class="date_start"></p>\
                                <p class="venue"></p>\
                                <p class="matchup"></p>\
                                <p class="status"></p>\
                            </div>\
                            <div class="row info hidden">\
                                <div class="commentary-body hidden commentary"></div>\
                                <div class="col-md-6">\
                                    <table class="table borderless text-center stats">\
                                    </table>\
                                </div>\
                                <div class="events col-md-6"></div>\
                                <div class="row">\
                                    <div class="col-md-8 col-md-offset-2 col-xs-12 tweet hidden">\
                                        <div class="col-md-3 col-xs-2 text-right tweet-img"><img/></div>\
                                        <div class="col-md-9 col-xs-10 text-left alert alert-dismissible alert-info tweet-text"></div>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>';
        if (((i + 1) % columns) == 0 || (i + 1) == matchAmount) {
            html += '</div>'
        }
    };

    // Append the HTML to the container
    $container.html(html);

    //Set widths
    var sectionAmount = $container.find('.section').length;
    $container.width(sectionAmount* 100 - 30 + "%");
    $(".section").width(100 / sectionAmount + "%");

    // Fire off the initial getData function
    getDataForEachMatch(true);
}

function getDataForEachMatch(firstTime) {
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
        fillBasicInfoForEachMatch(matchesObject, firstTime);
    })
}

function fillBasicInfoForEachMatch(matchesObject, firstTime) {
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

        // VENUE
        $matchNode.find('.venue').html(matchInfo['venue']);

        // COMPETITION
        $matchNode.parent().find('.competition').html(matchInfo['competition']['name']);
        $matchNode.parent().find('.competition').closest('.match-col').addClass(matchInfo['competition']['name'].replace(new RegExp(" ", 'g'), '-').replace(new RegExp("\u00F3", 'g'), 'o').toLowerCase());

        // MATCHUP
        var homeTeam = matchInfo['home_team']['name'].replace(new RegExp(" ", 'g'), '_').replace(new RegExp("-", 'g'), '_').toLowerCase();
        var awayTeam = matchInfo['away_team']['name'].replace(new RegExp(" ", 'g'), '_').replace(new RegExp("-", 'g'), '_').toLowerCase();
        var homeIcon = "<image class='team-icon' src='/images/icons/" + homeTeam + ".png' alt='' />";
        var awayIcon = "<image class='team-icon' src='/images/icons/" + awayTeam + ".png' alt='' />";
        $matchNode.find('.matchup').html(homeIcon + matchInfo['matchup'] + awayIcon);

        // Replace all characters with a - so we get a date object
        // like this: "01-01-2016-20-30"
        var match_data_raw = matchInfo['date_start'].replace(' ', '-').replace(':', '-');
        // Split the datestring so we get an array
        var date_part = match_data_raw.split('-');

        // Get current date
        var now = new Date();
        // The following is used to parse our European date format into a JavaScript date object
        var match_datetime = new Date(date_part[2], date_part[1] - 1, date_part[0], date_part[3], date_part[4]);

        // We need to do this twice, because we check on setHours later,
        // this caused the current date to lose all hours, minutes and seconds values
        var check_now = new Date();
        var check_match_datetime = new Date(date_part[2], date_part[1] - 1, date_part[0], date_part[3], date_part[4]);

        // Check if the date is in the future, but it is today
        if (match_datetime > now && (check_now.setHours(0, 0, 0, 0) == check_match_datetime.setHours(0, 0, 0, 0))) {
            if(firstTime){
                $matchNode.find('.status').html("<p class='countdown'></p>").countdown(match_datetime, function(event) {
                    $(this).find('.countdown').text(
                        event.strftime("Starts in %-H hours and %-M minutes and %-S seconds")
                    )
                });
            }
                // Check if the date is in the future
        } else if (match_datetime > now) {
            if(firstTime){
                $matchNode.find('.status').countdown(match_datetime, function(event) {
                    $(this).text(
                        event.strftime("Starts %-D days from now")
                    )
                });
            }
            // The date has passed, game has begun or is finished, we can show all of our info now
        } else {
            fillDetailedInfoForEachMatch(matchInfo, $matchNode, firstTime);
        }
    }
}

function fillDetailedInfoForEachMatch(matchInfo, $matchNode, firstTime) {
    // Show score
    var localteam_score = 0;
    var visitorteam_score = 0;

    if(matchInfo['localteam_score']){
        localteam_score = matchInfo['localteam_score']
    } 
    if(matchInfo['visitorteam_score']){
        visitorteam_score = matchInfo['visitorteam_score']
    } 
    var statusHtml = "";
    if(isInt(matchInfo['status'])){
        statusHtml += " <span class='timer'>(" + matchInfo['status'] + "')</span>"
    }
    function isInt(value) {
        var er = /^-?[0-9]+$/;
        return er.test(value);
    }
    $matchNode.find('.status').html("<span class='score'><strong>" + localteam_score + " - " + visitorteam_score + "</strong></span>" + statusHtml);

    // Remove hidden info div    
    var $info = $matchNode.find('.info');
    $info.removeClass('hidden');
    
    // STATS
    var $stats = $info.find('.stats');
    teamMapping = {}
    teamMapping[matchInfo['home_team']['id']] = 'home';
    teamMapping[matchInfo['away_team']['id']] = 'away';

    if(matchInfo['match_stats']){
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
            "possesiontime": "Possession",
            "shots_total": "Shots total"
        };

        $stats.html("");
        for (stats in localteam) {
            local_stats = localteam[stats];
            away_stats = awayteam[stats];
            for (stat in local_stats) {
                $stats.append("<tr><td>" + local_stats[stat] + "</td><td><strong>" + statToStringMapping[stat] + "</strong></td><td>" + away_stats[stat] + "</td></tr>")
            }
        }
    } else {
        $stats.remove();
        $info.find('.events').removeClass('col-md-6').addClass('col-md-12').addClass('full');
    }

    // TWEET
    var $tweet = $info.find('.tweet')
    var tweets = matchInfo['tweets'];
    if (tweets) {
        var tweet = tweets[Math.floor(Math.random() * tweets.length)];
        $tweet.removeClass('hidden');
        $tweet.find('img').attr("src", tweet['profile_image_url']);
        $tweet.find('.tweet-text').html("<span class='twitter-user'>@" + tweet['screen_name'] +"</span><span class='tweet'>" + tweet['text'] + "</span>");
        $tweet.find('img').height($tweet.find('.tweet-text').innerHeight());
    }

    // LATEST COMMENTARY
    var commentaries = matchInfo['commentaries'];
    if (commentaries && commentaries[0] !== 'undefined') {
        commentary = commentaries[0];
        $info.find('.commentary').removeClass('hidden');
        $info.find('.commentary').html("<h4>" + commentary['minute'] + "</h4> <p>" + commentary['comment'] + "</p>");
    }

    // EVENTS
    var events = matchInfo['events'];
    var $events = $info.find('.events')
    if (events) {
        var html = "";
        // Sort events by minute ascending
        events.sort(function(a, b) {
            return (a.minute > b.minute) ? 1 : ((b.minute > a.minute) ? -1 : 0); 
        });
        for (event in events) {
            event = events[event];
            var teamSide = teamMapping[event['team']['id']];

            if (event["type"] == 'yellowred') {
                event["type"] = 'redcard';
            }

            if (event["extra_min"]) {
                event["extra_min"] = "+" + event["extra_min"];
            } else {
                event["extra_min"] = "";
            }

            if (event["assist"]) {
                event["assist"] = "Assist: " + event["assist"];
            }

            html += '<p class=' + teamSide + '-events>\
                            <span class="minute">' + event["minute"] + event["extra_min"] + '\'</span>\
                            <img src="/images/' + event["type"] + '.png"/>\
                            <span class="player">' + event["player"] + '</span>\
                            <span class="result">' + event["result"].replace("[", "(").replace("]", ")") + '</span>\
                            <span class="assist">' + event["assist"] + '</span>\
                        <p>\
            ';
        }

        // Check if the new last event is new,
        var last_event = events[events.length - 1];
        if(!($events.data('last-event-id') == last_event['id'])){
            $events.data('last-event-id', last_event['id']);
            // If is the first time we're checking data?
            if(!firstTime){
                $(document).trigger("new-match-event", last_event);
            }
            
        } 
        $events.html(html);
    }

    if ($info.find('.stats').height() < $info.find('.events').height()) {
        $info.find('.stats').height($info.find('.events').height());
    } else if ($info.find('.stats').innerHeight() > $info.find('.events').innerHeight()) {
        $info.find('.events').height($info.find('.stats').height());
    }
}
