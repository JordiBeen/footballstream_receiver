$(document).on("new-match-event", function(e, event) {
    showEvent(event);
});

function showEvent(eventInfo) {
    var type = eventInfo["type"];
    var player = eventInfo["player"];
    var team = eventInfo["team"]["name"];
    var minute = eventInfo["minute"] + '\'';

    var eventToStringMapping = {
        "yellowcard": "Yellow Card!",
        "goal": "GOALLLL!!!!",
        "redcard": "Red Card!",
    };

    $("#eventName").text(minute + " " + eventToStringMapping[type]);
    $("#playerName").text(player);
    $("#teamName").text(team);
    $("#eventImage").attr("src", "./images/" + type + ".png");

    $( "#event" ).show( 1000, function() {
        setTimeout(function () {
            $("#event").hide(1000);
        }, 5000);
    });

}