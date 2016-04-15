$(document).on('data-message-changed', function() {
    initChange();
});

function initChange(){
    var $container = $("#container");
    var matchString = $container.data('matches');
    var matchArray = matchString.split(",");
}

