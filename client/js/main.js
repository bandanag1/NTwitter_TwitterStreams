var socket;
var keyword = "amsterdam";

function callServer() {
	keyword = document.getElementById("searchInput").value;
	socket.emit('news',{message: keyword});
}

var streamClient = {
    tweets: ko.observableArray([]),
    total: ko.observable(0),
    init: function(data) {
        this.tweets([]);
        this.tweets(data.tweets);
    },
    initialized: false,
    tweetThresholdMet: false,
    tweetThreshold: 400
};
$(function() {    
    //socket = io.connect('http://10.20.4.121:8559');
    socket = io.connect('http://192.168.2.6:8559');
    socket.on('connect', function () {	
	socket.on('newTweet', function (tweet) {
            if(streamClient.tweets().filter(function(x) { return x.id === tweet.id; }).length === 0) {
                streamClient.tweets.unshift(tweet);
                streamClient.total(streamClient.total() + 1);
                if(!streamClient.tweetThresholdMet) {
                    streamClient.tweetThresholdMet = streamClient.tweets().length > streamClient.tweetThreshold;
                }
                else {
                    streamClient.tweets.splice(streamClient.tweetThreshold, streamClient.tweets().length - streamClient.tweetThreshold);
                }
            }
        });
        socket.on("init", function(data){
            if(!streamClient.initialized) {
                streamClient.init(data);
                streamClient.total(data.tweets.length || 0);
                streamClient.initialized = true;
            }
        });
    });
    ko.applyBindings(streamClient);
});