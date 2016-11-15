var viewModel = function() {
    //all variables for model
    var self = this;
    self.searchKeyword = ko.observable("");
    self.listHidden = ko.observable(true);

    self.listLocations = ko.observableArray([]);
    self.featuredLocations = ko.observableArray([]);

    self.listEmpty = ko.observable(false);

    //called when hid or show list button is clicked, keeps track of if list is hidden
    self.toggleList = function() {
        self.listHidden() ? self.listHidden(false) : self.listHidden(true);
    };

    //searches via googleMaps based on keyword
    self.search = function() {
        if (self.searchKeyword() !== "") {
            self.listLocations().forEach(function(v, i) {
                mapClearMarker(v.marker());
            });
            self.listLocations.removeAll();
            mapSearch(self.searchKeyword());
            self.searchKeyword("");
        }
    };

    //adds a search result from google maps to the list
    self.addSearchResult = function(yelpData, googleResult, marker) {
        var formattedResult = new location(yelpData, googleResult, marker, "search");
        self.listLocations.push(formattedResult);
    };

    //object to store locations info
    var location = function(yelpData, googleResult, marker, type) {
        var photoURL = typeof googleResult.photos !== 'undefined' ?
            googleResult.photos[0].getUrl({
                'maxWidth': 150,
                'maxHeight': 150
            }) :
            ''; //alternative a "nophoto.jpg"
        this.googleResult = ko.observable(googleResult);
        this.address = ko.observable(googleResult.formatted_address);
        this.location = ko.observable(googleResult.geometry);
        this.name = ko.observable(googleResult.name);
        this.photoURL = ko.observable(photoURL);
        this.id = ko.observable(googleResult.place_id);
        this.rating = ko.observable(googleResult.rating);
        this.types = ko.observableArray(googleResult.types);
        this.marker = ko.observable(marker);
        this.match = ko.observable(true);
        this.type = ko.observable(type);
        this.expanded = ko.observable(false);
        this.expandDetailsText = ko.observable("See More Details...");
        if (yelpData !== null) {
            this.yelpData = ko.observable(yelpData);
            this.hasYelpDetails = ko.observable(true);
            this.yelpNumberOfReviews = ko.observable(yelpData.review_count);
            this.yelpReviewSnippet = ko.observable(yelpData.snippet_text);
            this.yelpURL = ko.observable(yelpData.url);
            this.yelpRating = ko.observable(yelpData.rating);
        } else {
            this.yelpData = ko.observable(yelpData);
            this.hasYelpDetails = ko.observable(false);
        }
    };

    //adds a featured location to the list and to the featured location array
    self.addFeaturedLocation = function(yelpData, googleResult, marker) {
        var formattedResult = new location(yelpData, googleResult, marker, "featured");
        self.featuredLocations.push(formattedResult);
        self.listLocations.push(formattedResult);
    };

    //filters the current list based on keyword
    self.filterList = function() {
        // console.log(self.listLocations());
        self.listLocations().forEach(function(loc, i) {
            //set match to false for entire list and only set true for those who match
            loc.match(false);
            //if any portion of name matches keep
            if (loc.name().toLowerCase().search(self.searchKeyword().toLowerCase()) >= 0) {
                console.log("name matched");
                loc.match(true);
            }
            //if any category matches, keep
            if (loc.types().forEach(function(type, i) {
                    if (type.toLowerCase().search(self.searchKeyword().toLowerCase()) >= 0) {
                        this.match(true);
                    }
                }, loc)) {
                //empty body since callback function handles setting to true
            }
            //if address matches keep
            if (loc.address().toLowerCase().search(self.searchKeyword().toLowerCase()) >= 0) {
                loc.match(true);
            }
            //if nothing matches, remove from map
            if (loc.match() === false) {
                mapClearMarker(loc.marker());
            } else {
                mapSetMarker(loc.marker());
            }
        });
        self.noResults();
        self.searchKeyword("");
    };

    //clears the map and list and adds back featured locations
    self.restoreFeatured = function() {
        self.listLocations().forEach(function(v, i) {
            mapClearMarker(v.marker());
        });
        self.listLocations.removeAll();
        self.listLocations(self.featuredLocations().slice(0));
        self.listLocations().forEach(function(v, i) {
            //ensure match is true so loc shows on list
            v.match(true);
            mapSetMarker(v.marker());
        });
    };

    //animates the corresponding marker
    self.animateMarker = function() {
        // console.log(this);
        mapAnimateMarker(this.marker(), this.type());
        mapOpenInfoWindow(this.googleResult(), this.yelpData(), this.marker());
    };

    //expands the list items details if available
    self.expandDetails = function() {
        this.expanded() ? this.expanded(false) : this.expanded(true);
        if (this.expandDetailsText() == "See More Details...") {
            this.expandDetailsText("Hide Details...");
        } else {
            this.expandDetailsText("See More Details...");
        }
    };

    //checks if there are no results and notifys user in the list if empty
    self.noResults = function() {
        self.listEmpty(true);
        self.listLocations().forEach(function(loc, i) {
            if (loc.match() === true) {
                self.listEmpty(false);
            }
        });
    };

    self.openInfoWindow = function(){
        console.log();

    };
};

var myVM = new viewModel();
ko.applyBindings(myVM);