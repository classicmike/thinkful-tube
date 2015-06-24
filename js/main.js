(function(){
    var thinkfulTube = {};

    thinkfulTube.VideoResult = function(id, thumbnailUrl){
        this.id = id;
        this.thumbnailUrl = thumbnailUrl;
    };

    thinkfulTube.VideoList = function(){
        this.items = [];
    };

    thinkfulTube.VideoList.prototype = Object.create(EventEmitter.prototype);
    thinkfulTube.VideoList.prototype.constructor = thinkfulTube.VideoList;

    thinkfulTube.VideoList.prototype.searchAndRetrieveResults = function(searchTerms){
        if(!searchTerms){
            return;
        };

        var apiParameters = {
            part: thinkfulTube.VideoList.PART_PARAMETER,
            q: searchTerms,
            key: thinkfulTube.VideoList.APIKEY
        };

        $.get(thinkfulTube.VideoList.YOUTUBE_URL, apiParameters)
            .then(this.processResults.bind(this));


    };

    thinkfulTube.VideoList.prototype.processResults = function(results){
        var searchItems = results.items;
        for(var i = 0; i < searchItems.length; i++){
            console.log('Getting a result');
            var item = searchItems[i];

            if(item.id.kind === 'youtube#video'){
                var video = new thinkfulTube.VideoResult(item.id.videoId, item.snippet.thumbnails.medium.url);
                this.items.push(video);
            }
        }

        console.log(this.items);

        this.emitEvent('update-results');
    };

    thinkfulTube.VideoList.prototype.processError = function(error){
        console.log(error);

    };


    thinkfulTube.VideoList.YOUTUBE_URL = 'https://www.googleapis.com/youtube/v3/search';
    thinkfulTube.VideoList.PART_PARAMETER = 'snippet';
    thinkfulTube.VideoList.APIKEY = 'AIzaSyCXkCmtPrjb7pmve6uhvS9IuoN5-yXnSOQ';


    thinkfulTube.Controller = function(){
        this.view = {};
        this.videoList = new thinkfulTube.VideoList();
        this.setEvents();
    };

    thinkfulTube.Controller.prototype.processSearch = function(searchTerms){
        if(!searchTerms){
            console.log('No search terms were entered');
            return;
        }

        this.videoList.searchAndRetrieveResults(searchTerms);
    };

    thinkfulTube.Controller.prototype.setEvents = function(){
        this.videoList.addListener('update-results', this.updateResults.bind(this));
    };

    thinkfulTube.Controller.prototype.updateResults = function(){
        console.log('Rendering results');
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
        console.log('Submitting');
        event.preventDefault();

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
                resultsHTML.append('<li><a href="' + thinkfulTube.View.YOUTUBE_WATCH_URL + videoObject.id +'" target="_blank"><img src="' + videoObject.thumbnailUrl+ '" /></li>')
            }


        }

        this.searchResultsElement.append(resultsHTML);
    };

    thinkfulTube.View.SEARCH_ELEMENT_ID = '#search-form';
    thinkfulTube.View.SEARCH_RESULTS_ID = '#search-results';
    thinkfulTube.View.YOUTUBE_WATCH_URL = 'https://www.youtube.com/watch?v='


    $(document).ready(function(){
        var controller = new thinkfulTube.Controller();
        var view = new thinkfulTube.View(controller);
    });


})(jQuery);