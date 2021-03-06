function SignalingChannel(id){

    var _ws;
    var self = this;

    function connectToTracker(url, onClose, onError){
        _ws = new WebSocket(url);
        _ws.onopen = _onConnectionEstablished;
        _ws.onmessage = _onMessage;
        _ws.onclose = onClose ? onClose : _onClose;
        _ws.onerror = onError ? onError : _onError;
    }

    function _onConnectionEstablished(){
        _sendMessage('init', id);
    }

    function _onClose(){
        console.error("connection closed");
        alert("Connection closed. Please, try again later.");
    }

    function _onError(err){
        console.error("error:", err);
    }


    function _onMessage(evt){
        var objMessage = JSON.parse(evt.data);
        switch (objMessage.type) {
            case "ICECandidate":
                self.onICECandidate(objMessage.ICECandidate, objMessage.source);
                break;
            case "offer":
                self.onOffer(objMessage.offer, objMessage.source);
                break;
            case "peers":
                self.onPeers(objMessage.peers);
                break;
            case "answer":
                self.onAnswer(objMessage.answer, objMessage.source);
                break;
            default:
                throw new Error("invalid message type");
        }
    }

    function _sendMessage(type, data, destination){
        var message = {};
        message.type = type;
        message[type] = data;
        message.destination = destination;
        _ws.send(JSON.stringify(message));
    }

    function sendICECandidate(ICECandidate, destination){
        _sendMessage("ICECandidate", ICECandidate, destination);
    }

    function sendOffer(offer, destination){
        _sendMessage("offer", offer, destination);
    }

    function sendAnswer(answer, destination){
        _sendMessage("answer", answer, destination);
    }

    this.connectToTracker = connectToTracker;
    this.sendICECandidate = sendICECandidate;
    this.sendOffer        = sendOffer;
    this.sendAnswer       = sendAnswer;

    //default handler, should be overriden
    this.onOffer = function(offer, source){
        console.log("offer from peer:", source, ':', offer);
    };

    //default handler, should be overriden 
    this.onPeers = function(peers){
        console.log("peers:", peers);
    };

    //default handler, should be overriden 
    this.onAnswer = function(answer, source){
        console.log("answer from peer:", source, ':', answer);
    };

    //default handler, should be overriden 
    this.onICECandidate = function(ICECandidate, source){
        console.log("ICECandidate from peer:", source, ':', ICECandidate);
    };
}

window.createSignalingChannel = function(url, id, onClose, onError){
    var signalingChannel = new SignalingChannel(id);
    signalingChannel.connectToTracker(url, onClose, onError);
    return signalingChannel;
};
