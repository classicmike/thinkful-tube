(function(){
    var thinkfulTube = {};

    thinkfulTube.VideoResult = function(id, thumbnailUrl, caption){
        this.id = id;
        this.thumbnailUrl = thumbnailUrl;
        this.caption = caption;
    };

    thinkfulTube.VideoList = function(){
        this.setUp();
    };

    thinkfulTube.VideoList.prototype = Object.create(EventEmitter.prototype);
    thinkfulTube.VideoList.prototype.constructor = thinkfulTube.VideoList;

    //reset the search list results
    thinkfulTube.VideoList.prototype.setUp = function(){
        this.items = [];
    };

    thinkfulTube.VideoList.prototype.searchAndRetrieveResults = function(searchTerms){
        //reset the lists;
        this.setUp();

        if(!searchTerms){
            return;
        };

        var apiParameters = {
            part: thinkfulTube.VideoList.PART_PARAMETER,
            q: searchTerms,
            key: thinkfulTube.VideoList.APIKEY,
            type: thinkfulTube.VideoList.TYPE,
            maxResults: thinkfulTube.VideoList.MAX_RESULTS
        };

        $.get(thinkfulTube.VideoList.YOUTUBE_URL, apiParameters)
            .then(this.processResults.bind(this));


    };

    thinkfulTube.VideoList.prototype.processResults = function(results){
        var searchItems = results.items;
        for(var i = 0; i < searchItems.length; i++){
            var item = searchItems[i];

            if(item.id.kind === 'youtube#video'){
                var video = new thinkfulTube.VideoResult(item.id.videoId, item.snippet.thumbnails.high.url, item.snippet.title);
                this.items.push(video);
            }
        }

        this.emitEvent('update-results');
    };


    thinkfulTube.VideoList.YOUTUBE_URL = 'https://www.googleapis.com/youtube/v3/search';
    thinkfulTube.VideoList.PART_PARAMETER = 'snippet';
    thinkfulTube.VideoList.APIKEY = 'AIzaSyCXkCmtPrjb7pmve6uhvS9IuoN5-yXnSOQ';
    thinkfulTube.VideoList.MAX_RESULTS = 12;
    thinkfulTube.VideoList.TYPE = 'video';


    thinkfulTube.Controller = function(){
        this.view = {};
        this.videoList = new thinkfulTube.VideoList();
        this.setEvents();
    };

    thinkfulTube.Controller.prototype.processSearch = function(searchTerms){
        if(!searchTerms || searchTerms.length < 1){
            this.view.notifyOfError(thinkfulTube.View.SEARCH_TERMS);
            return;
        }

        this.videoList.searchAndRetrieveResults(searchTerms);
    };

    thinkfulTube.Controller.prototype.setEvents = function(){
        this.videoList.addListener('update-results', this.updateResults.bind(this));
    };

    thinkfulTube.Controller.prototype.updateResults = function(){
        this.view.renderResults();
    };


    thinkfulTube.View = function(controller){
        this.controller = controller;
        this.controller.view = this;
        this.searchElement = $(thinkfulTube.View.SEARCH_ELEMENT_ID);
        this.searchResultsElement = $(thinkfulTube.View.SEARCH_RESULTS_ID);

        this.setEvents();
    };

    thinkfulTube.View.prototype.setEvents = function(){
        this.searchElement.on('submit', this.processSearch.bind(this));
    };

    thinkfulTube.View.prototype.processSearch = function(event){
        event.preventDefault();
        this.showLoading();

        var inputElement = $(event.target).find('input[type="text"]');

        this.controller.processSearch(inputElement.val());
        return false;

    };

    thinkfulTube.View.prototype.renderResults = function(){
        var results = this.controller.videoList.items;

        var resultsHTML = '';

        if(results.length === 0){
            resultsHTML = '<p>Sorry no results found</p>'
        } else {
            resultsHTML = $('<ul class="small-block-grid-1 medium-block-grid-2 large-block-grid-3">');

            for(var i = 0; i < results.length; i++){
                var videoObject = results[i];
                resultsHTML.append('<li class="text-center"><a href="' + thinkfulTube.View.YOUTUBE_WATCH_URL + videoObject.id +'" target="_blank"><img src="' + videoObject.thumbnailUrl+ '" /><h5>' + videoObject.caption + '</h5></li>')
            }
        }

        this.searchResultsElement.html(resultsHTML);
    };

    thinkfulTube.View.prototype.showLoading = function(){
        this.searchResultsElement.html('<p class="' + thinkfulTube.View.LOADING_ELEMENT_CLASS + '">Loading Results. Please Wait....</p>');
    };

    thinkfulTube.View.prototype.hideLoading = function(){
        this.searchResultsElement.find('.' + thinkfulTube.View.LOADING_ELEMENT_CLASS).remove();
    };

    thinkfulTube.View.prototype.notifyOfError = function(error){
        var message = '';
        if(!error|| typeof error !== 'string'){
            message = 'There seems to be an uncaught error please try again or contact me at vi3t4lyfe69@gmail.com if you experiencing problems';
        } else {
            message = error;
        }

        this.hideLoading();
        alert(message);
    };

    thinkfulTube.View.SEARCH_ELEMENT_ID = '#search-form';
    thinkfulTube.View.SEARCH_RESULTS_ID = '#search-results';
    thinkfulTube.View.YOUTUBE_WATCH_URL = 'https://www.youtube.com/watch?v=';
    thinkfulTube.View.UNCAUGHT_ERROR_MESSAGE = 'There seems to be an uncaught error please try again or contact me at vi3t4lyfe69@gmail.com if you experiencing problems';
    thinkfulTube.View.SEARCH_TERMS = 'Please enter a set of search terms';
    thinkfulTube.View.LOADING_ELEMENT_CLASS = 'loading';


    $(document).ready(function(){
        var controller = new thinkfulTube.Controller();
        var view = new thinkfulTube.View(controller);
    });


})(jQuery);