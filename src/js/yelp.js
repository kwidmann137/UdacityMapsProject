//builds the necessary oAuth message to get yelp search results
//once results are achieved they are passed back to maps to verify
//they match the location and be added to the model
function yelpSearch(location, name, result, marker, type) {
    var auth = {
        consumerKey: "9v0dToFOoyuhLJiWJfujRA",
        consumerSecret: "HCtQEDyu5Xq-Axp-1hqbEpkiBSM",
        accessToken: "J44hl-oUuyJqNqd7hDk_mlfWcay8p3EL",
        accessTokenSecret: "XLzY67GI-YbvQwy2N36416mAdLo",
        serviceProvider: {
            signatureMethod: "HMAC-SHA1"
        }
    };

    name = name.replace(' ', '+');
    location = location.replace(' ', '+');

    var terms = name;
    var near = location;

    var accessor = {
        consumerSecret: auth.consumerSecret,
        tokenSecret: auth.accessTokenSecret
    };
    parameters = [];
    parameters.push(['term', terms]);
    parameters.push(['location', near]);
    parameters.push(['callback', 'yelpCB']);
    parameters.push(['limit', '1']);
    parameters.push(['oauth_consumer_key', auth.consumerKey]);
    parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
    parameters.push(['oauth_token', auth.accessToken]);
    parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

    var message = {
        'action': 'https://api.yelp.com/v2/search',
        'method': 'GET',
        'parameters': parameters
    };

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    var parameterMap = OAuth.getParameterMap(message.parameters);

    $.ajax({
        'url': message.action,
        'data': parameterMap,
        'dataType': 'jsonp',
        //need to set cache to true to eliminate additional underscore and get a valid yelp result
        'cache': true
    }).done(function(data) {
        if (data.businesses[0] != null) {
            data = data.businesses[0];
        } else {
            data = null;
        }
        if (type == "featured") {
            mapAddCompletedFeaturedLocation(data, result, marker);
        } else {
            mapAddCompletedSearchLocation(data, result, marker);
        }
    }).fail(function(XMLHttpRequest, textStats, error) {
        console.log("Error");
        console.log(error);
    });
}