$(document).on("new-match-event", function(e, event) {
    showEvent(event);
});

function showEvent(eventInfo) {
    var type = eventInfo["type"];
    var player = eventInfo["player"];
    var team = eventInfo["team"]["name"];
    var minute = eventInfo["minute"];

    if (eventInfo["extra_min"]) {
        minute += eventInfo["extra_min"] + "'";
    } else {
        minute += "'";
    }

    var eventToStringMapping = {
        "yellowcard": "Yellow Card!",
        "goal": "GOALLLL!!!!",
        "redcard": "Red Card!",
    };

    $("#eventName").text(minute + " " + eventToStringMapping[type]);
    $("#playerName").text(player);
    $("#teamName").text(team);
    $("#eventImage").attr("src", "./images/" + type + ".png");

    playSound(type);

    $( "#event" ).show( 1000, function() {
        setTimeout(function () {
            $("#event").hide(1000);
        }, 5000);
    });

}

function playSound(type) {
    var audioElement = document.createElement('audio');
    var goals = ["goal1.mp3", "goal2.mp3", "goal3.mp3", "goal4.mp3", "goal5.mp3"];
    switch (type) {
        case "redcard":
        case "yellowcard":
            audioElement.setAttribute('src', './audio/whistle.mp3');
            break;
        case "goal":
            audioElement.setAttribute('src', './audio/' + goals[Math.floor(Math.random() * goals.length)]);
            break;
    }
    audioElement.setAttribute('autoplay', 'autoplay');
    audioElement.play();
}