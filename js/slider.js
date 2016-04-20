var time = 5000;
var index = 0;
var $container = $("#container");

function slideToNextMatch() {
    var childrenCount = $("#container").find(".section").length;
    index = (index + 1) % childrenCount;
    $container.css({
        marginLeft: -1 * index * 100 + "%"
    })
}

var pt = window.setInterval(function() {
    slideToNextMatch();
}, time)