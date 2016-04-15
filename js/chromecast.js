window.onload = function() {
    window.containerElement = document.getElementById('container');
    window.mediaManager = new cast.receiver.MediaManager(window.containerElement);
    window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();

    // create a CastMessageBus to handle messages for a custom namespace
    window.messageBus =
        window.castReceiverManager.getCastMessageBus(
            'urn:x-cast:nl.footballstream');

    // handler for the CastMessageBus message event
    window.messageBus.onMessage = function(event) {
        console.log('Message [' + event.senderId + ']: ' + event.data);
        // display the message from the sender
        changeContainerData(event.data);
        // inform all senders on the CastMessageBus of the incoming message event
        // sender message listener will be invoked
        window.messageBus.send(event.senderId, event.data);
    }

    window.castReceiverManager.start();

    window.castReceiverManager.onSenderDisconnected = function(event) {
        if (window.castReceiverManager.getSenders().length == 0 &&
            event.reason == cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER) {
            window.close();
        }
    }

    function changeContainerData(sentMatchString) {
        var $container = $("#container");
        $container.data('matches', sentMatchString);
        $(document).trigger('data-message-changed');
        window.castReceiverManager.setApplicationState("Casting matches");
    };
};
