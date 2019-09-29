var APP = {};
APP.CONSTANTS = {};
APP.UTIL = {};
APP.AJAX = {};
APP.WIDGET = {};
APP.LISTENER = {};
APP.LISTENER.CLICK = {};
APP.LISTENER.TOUCH = {};
APP.LISTENER.RESIZE = {};
APP.LISTENER.HISTORY = {};
APP.DIRTY = {};
APP.DIRTY.OVERRIDE = {};
APP.INIT = {};
APP.CACHE = {};
APP.CACHE.firstPageHistory = null;

APP.CONSTANTS.CHAPTER_YAGS_FUNCTION_BY_TOPIC = "chapA"; //do not include .html
APP.CONSTANTS.CHAPTER_YAGS_FUNCTION_BY_REFERENCE = "chapB"; //do not include .html

APP.CONSTANTS.WEB_DOMAIN = "xamanek.izt.uam.mx";
APP.CONSTANTS.PREFIX_DOC_FOLDER = "doc";

APP.CONSTANTS.WIDTH_MOBILE = 1000; /*if you change this value you will have to change the media queries in main.css */

/*************************************************************************************************
                                            UTIL PACKAGE 
*************************************************************************************************/

/******************** generic utilities used to manipulate section IDs ***********************/
APP.UTIL.buildSectionIdSelector = function(sectionId){
	return "#" + sectionId + "-link";
};

APP.UTIL.getSectionIdFromSelector = function(cssSelector){
	return cssSelector.replace("#","").replace("-link","");
};


/********************************** generic utilities for urls **********************************/

/*we need to generate random urls in order to avoid the IE cache*/
APP.UTIL.randomizeUrl = function(theUrl) {
    //"?_random=" + Math.random();
	return APP.UTIL.addParamToUrl(theUrl, "_random", Math.random());
};

APP.UTIL.addParamToUrl = function(theUrl, paramName, paramValue){
	var newUrl;

	if (theUrl.indexOf("?") === -1) {
		newUrl = theUrl + "?";
	} else {
		newUrl = theUrl + "&";
	}

	newUrl = newUrl + paramName + "=" + paramValue;

	return newUrl; 
};

APP.UTIL.getParamsUrl = function(){
	var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    paramsUrl = {};
    while (match = search.exec(query)){
       paramsUrl[decode(match[1])] = decode(match[2]);
    }

    return paramsUrl;
};


/*********************  utilities for gapDocs urls (chapter#hash fomrat) ***************************/

APP.UTIL.formatDocUrl = function(theUrl) {

	if(theUrl.indexOf(APP.CONSTANTS.PREFIX_DOC_FOLDER) === -1){
		theUrl = APP.CONSTANTS.PREFIX_DOC_FOLDER + "/" + theUrl;
	}

	return theUrl + "";//always a new string
};

APP.UTIL.buildGapDocUrl = function(chapter, hash){
	var theUrl = APP.UTIL.formatDocUrl("");

	if(chapter.length > 0){
		theUrl =  theUrl + chapter + ".html";
		theUrl = (hash.length>0)? (theUrl + "#" + hash):theUrl;
	}	
	
	return theUrl;
};

APP.UTIL.getChapterAndHashFromGapDocUrl = function(theUrl){
	var chapterAndHash, chapter, hash;

	chapterAndHash = theUrl.substring(theUrl.lastIndexOf("/") + 1,theUrl.length).split("#");
	chapter = chapterAndHash[0];
	chapter = chapter.replace(".html","");
	hash = (chapterAndHash.length > 1)?chapterAndHash[1]:"";

	return {
		chapter: chapter,
		hash: hash
	};
};

APP.UTIL.isGapDocUrl = function(theUrl){
	var isGapDocUrl;

	theUrl = theUrl.toLowerCase();	
	isGapDocUrl = /chap[a-z0-9]{1,4}\.html/i.test(theUrl); //this is the pattern used by gap docs.

	return isGapDocUrl;
};


/********************* utilities for gapDocs urls (query string format) ****************************/
APP.UTIL.buildGapDocQueryString = function(sectionId, chapter, hash){
	return sectionId + ".html?chapter=" + chapter + "&hash=" + hash;
};

APP.UTIL.gapDocUrlToQueryString = function(sectionId, gapDocsUrl){
	var docInfo = APP.UTIL.getChapterAndHashFromGapDocUrl(gapDocsUrl);

	return APP.UTIL.buildGapDocQueryString(sectionId, docInfo.chapter, docInfo.hash);
};



//*****************************************************************************************
//                                QUICK AND DIRTY PACKAGE 
//*****************************************************************************************


APP.DIRTY.fixGapDocsContainer = function(jGapDocsContainer, chapter){

	APP.DIRTY.modifyChapSects(jGapDocsContainer);

	APP.DIRTY.fixImages(jGapDocsContainer);
	APP.DIRTY.fixGapDocLinks(jGapDocsContainer);
	APP.DIRTY.fixPreNormalTags(jGapDocsContainer);
	APP.DIRTY.fixChapterLinkTop(jGapDocsContainer);

	if ( typeof APP.DIRTY.OVERRIDE[chapter] !== "undefined") {
		APP.DIRTY.OVERRIDE[chapter](jGapDocsContainer);	
	}
};

//  -------  functions to override the content of a chapter in the gap docs. --------------

APP.DIRTY.OVERRIDE[APP.CONSTANTS.CHAPTER_YAGS_FUNCTION_BY_TOPIC] = function(jGapDocsContainer){
	var chapterTitle = jGapDocsContainer.find("h3 span.Heading").first().parent();
	chapterTitle.html("Appendix " + chapterTitle.html());
};

APP.DIRTY.OVERRIDE[APP.CONSTANTS.CHAPTER_YAGS_FUNCTION_BY_REFERENCE] = function(jGapDocsContainer){
	var chapterTitle = jGapDocsContainer.find("h3 span.Heading").first().parent();
	chapterTitle.html("Appendix " + chapterTitle.html());
};


//-----------------------------------------------------------------------------------------

//fixes the div.ChapSects for tablets and mobiles phones; moves the div.ChapSects
// into #dirty-gapdocs-menu
APP.DIRTY.modifyChapSects = function(jGapDocsContainer){
	var newGapDocsMenuHtml, jNewGapDocsMenu, jOriginalGapDocsMenu;

	jOriginalGapDocsMenu = jGapDocsContainer.find(".ChapSects");

	// IMPORTANT: jOriginalGapDocsMenu is not an array, is a jquery collection
	if(jOriginalGapDocsMenu.length > 0){
		
		//build a wrapper for the original gapdocs menu
		newGapDocsMenuHtml = '<div id="dirty-modal-gapdocs-menu" class="invisible-on-mobile">' + 
			                     '<div id="dirty-gapdocs-menu">' + 
		                            '<div id="dirty-gapdocs-menu-lframe-wrapper">' +
		                               '<div id="dirty-gapdocs-menu-lframe">' +
		                                  '<div id="dirty-gapdocs-button-hide">&gt</div>' + 
		                                '<div>' + 
		                            '</div>' + 
		                          '</div>' + 
	                          '</div>';
	    jNewGapDocsMenu = $(newGapDocsMenuHtml);

	    //append the wrapper to the gapdocs container
	    jNewGapDocsMenu.appendTo(jGapDocsContainer);
	    //append the button to show the new gapdocs menu on tablets and mobile phones
	    //$('<button id="dirty-gapdocs-button-show">&lt;</button>').prependTo(jContent);
	    $('<div id="dirty-gapdocs-button-show">&lt;</div>').prependTo(jGapDocsContainer);
	    //move the original gapdocs menu into the new menu (wrapper)
	    jOriginalGapDocsMenu.detach().appendTo(jNewGapDocsMenu.find("#dirty-gapdocs-menu"));
	    //jNewGapDocsMenu.find("#dirty-gapdocs-menu").append('<div id="dirty-gapdocs-menu-footer"></div>');
	    jOriginalGapDocsMenu.addClass("scrollable");
	}
};

//fixes the relative path of img tags in order to point to the correct
//folder of the yags docs.
APP.DIRTY.fixImages = function(jGapDocsContainer){	
	jGapDocsContainer.find("img").each(function(){
		var currentImg = $(this);
		var fixedSrc = APP.UTIL.formatDocUrl(currentImg.attr("src"));

		currentImg.attr("src",fixedSrc);
	});
};


// a quick and dirty function to fix the url of each link generated for gap docs and avoid
// fix each link manually.
APP.DIRTY.fixGapDocLinks = function(jGapDocsContainer){
	jGapDocsContainer.find("a").each(function(){
		var linkHref, currentLink;

		currentLink = $(this);
		linkHref = currentLink.attr("href");

		if (typeof linkHref !== "undefined" && APP.UTIL.isGapDocUrl(linkHref) === true) {
			currentLink.attr("href", APP.UTIL.formatDocUrl(linkHref));
		}
	});	
};

APP.DIRTY.fixChapterLinkTop = function(jGapDocsContainer){
	if(jGapDocsContainer.find(".ChapSects").length > 0){
		jGapDocsContainer.find(".chlinktop").addClass("dirty-chlinktop");
	}
};

APP.DIRTY.isACitation = function(jTag) {
	var isACitation = false;
	var tagHtml = jTag.html();

    //we decide if the pre tag is a citation using  the duck test:
   	//   "If it looks like a duck, swims like a duck, and quacks like a duck, then it probably is a duck"
   	//  :S   	
   	if (tagHtml.indexOf("@manual") !== -1 && tagHtml.indexOf("author") !== -1  && tagHtml.indexOf("title") !== -1){
   		isACitation = true;
   	}

   	return isACitation;
};

APP.DIRTY.isAGraphCategoryDiagram = function(jTag){
    var isAGraphCategoryDiagram = false;
    var tagHtml = jTag.html();

    //we decide if the pre tag is a graph category diagram using  the duck test:
   	//   "If it looks like a duck, swims like a duck, and quacks like a duck, then it probably is a duck"
   	//  :S
   	if(tagHtml.indexOf("OrientedGraphs") !== -1 && tagHtml.indexOf("LooplessGraphs") !== -1  && tagHtml.indexOf("UndirectedGraphs") !== -1){
   		isAGraphCategoryDiagram = true;
   	}

   	return isAGraphCategoryDiagram;
};

// fix boxes pre.normal
APP.DIRTY.fixPreNormalTags = function (jGapDocsContainer){
    jGapDocsContainer.find("pre.normal").each(function(){
    	var currentPreTag = $(this);
    	var currentPreTagHtml = currentPreTag.html();

    	if (APP.DIRTY.isACitation(currentPreTag) === true){
    		APP.DIRTY.fixCitation(currentPreTag);
    	} else if (APP.DIRTY.isAGraphCategoryDiagram(currentPreTag) === true){
    		APP.DIRTY.fixGraphCategoryDiagram(currentPreTag);
    	}
	});
};

//fix graph category diagram inside gap docs
APP.DIRTY.fixGraphCategoryDiagram = function (theTag){
    theTag.addClass("dirty-graph-category");
};


//fix citations inside gap docs
APP.DIRTY.fixCitation = function (theTag){
    //var citationContainer = $('<div class=".dirty-citation-container"></div>');
   	theTag.addClass("dirty-citation");
};

//******************************************************************************************
//                                       WIDGET PACKAGE 
//******************************************************************************************

APP.WIDGET.isCustomAjaxLink = function(cssSelector){
	var currentLink = $(cssSelector);
	var isCustomAjaxLink = false;

	if( currentLink.hasClass("ajax-link") === true){
		isCustomAjaxLink = true;
	} 

	if(currentLink.hasClass("gap-ajax-link") === true){
		isCustomAjaxLink = true;	
	}

	if(currentLink.hasClass("modal-ajax-link") === true){
		isCustomAjaxLink = true;
	}

	return isCustomAjaxLink;
};

APP.WIDGET.pushSectionButton = function(sectionId){
	var currentLink = $(APP.UTIL.buildSectionIdSelector(sectionId));			
	//disable current "active" button in #menu
	$(".link-active").removeClass("link-active");
	//make the link that has been selected from #menu the "active" button
	currentLink.addClass("link-active");	
};

// scrolls to the position of a given box in the browser.
//IMPORTANT: scroll should be the last method to call in "onFadeIn";
//           otherwise the scroll method will not be able to get the correct position
//           of the element to scroll to.
// boxSelector: A CSS selector pointing to a box inside the body
APP.WIDGET.scrollToBoxPosition = function(boxSelector, onAnimationComplete){	
    APP.CACHE.jHtmlAndjBody.animate({
		scrollTop: ($(boxSelector).offset().top - 60)
	}, 0, onAnimationComplete);
};

APP.WIDGET.resizeModalWindow = function(modalWindow){

	if(APP.CACHE.jWindow.width() > APP.CONSTANTS.WIDTH_MOBILE){
		windowHeight = APP.CACHE.jWindow.height() - 250;
	}else{
		windowHeight = APP.CACHE.jWindow.height() - 92;
	}
	
	var modalBody = modalWindow.find(".modal-body");
	//set appropiate size for window
	modalBody.height(windowHeight); //default 60%
};

// idContainer: a css selector or a jquery object pointing to the the box that contains the modal markup.
// removeOnClose: if it is true, then the DOM object of the modal box will be removed from the DOM tree after the
//                the modal windows has been closed.
APP.WIDGET.showModalWindow = function(idContainer, removeOnClose){
	var modal, windowHeight, closeButton, clickOutsideHandler, closeHandler;	

	// Get the modal box
	modal = $(idContainer);

	//prepare callback to close the window
	closeHandler = function(){		
		modal.css("display","none");	

		//disable scroll on body and container
		APP.CACHE.jBody.removeClass("noscroll");
		//APP.CACHE.jBody.removeClass("noscroll-ios");
		//APP.CACHE.jMainContainer.removeClass("noscroll-ios");

		if(removeOnClose === true){
			modal.remove();
		}
	};
	//prepare callback to call whe the user clicks outside the window
	clickOutsideHandler = function (event) {
		if (event.target == modal[0]) {
			closeHandler();	        
			APP.CACHE.jWindow.off("click",clickOutsideHandler);
	    }
	}

	APP.WIDGET.resizeModalWindow(modal);

	// Get the <span> element that closes the window
	closeButton = modal.find(".modal-close");	
	// When the user clicks on <span> (x), close the window
	closeButton.click(function(){
		closeHandler();
		APP.CACHE.jWindow.off("click",clickOutsideHandler);
	});
	// When the user clicks anywhere outside of the modal, close it
	APP.CACHE.jWindow.on("click", clickOutsideHandler);

	//disable scroll on body and container
	APP.CACHE.jBody.addClass("noscroll");
	//APP.CACHE.jBody.addClass("noscroll-ios");
	//APP.CACHE.jMainContainer.addClass("noscroll-ios");
	APP.WIDGET.removeIOSRubberEffect( modal.find(".modal-body")[0] );

	//show the modal window
	modal.css("display", "block");
};

APP.WIDGET.removeIOSRubberEffect = function( element ) {

	if(element === null){
		return;
	}

    element.addEventListener( "touchstart", function () {

        var top = element.scrollTop, totalScroll = element.scrollHeight, currentScroll = top + element.offsetHeight;

        if ( top === 0 ) {
            element.scrollTop = 1;
        } else if ( currentScroll === totalScroll ) {
            element.scrollTop = top - 1;
        }

    } );
}

/************************************** gap docs menu **************************************/
APP.WIDGET.closeGapDocsMenu = function() {
	APP.CACHE.jBody.removeClass("noscroll");
	//APP.CACHE.jMainContainer.removeClass("noscroll-ios");
	$("#dirty-gapdocs-menu").removeClass("dirty-slide-left-gadocs-menu");	
	//@TODO: use a keyframe	
	setTimeout(function(){		
		$("#dirty-modal-gapdocs-menu").addClass("invisible-on-mobile");
	},300); //waith long enough to let slide-down animation to finish
};

APP.WIDGET.openGapDocsMenu = function(){
	APP.CACHE.jBody.addClass("noscroll");	
	//APP.CACHE.jMainContainer.addClass("noscroll-ios");
	$("#dirty-modal-gapdocs-menu").removeClass("invisible-on-mobile");
	//@TODO: use a keyframe	
	setTimeout(function(){		
		$("#dirty-gapdocs-menu").addClass("dirty-slide-left-gadocs-menu");
	},300); //waith long enough to let slide-down animation to finish
	
};

APP.WIDGET.isGapDocsMenuOpen = function(){
	return $("#dirty-gapdocs-menu").hasClass("dirty-slide-left-gadocs-menu");
}

APP.WIDGET.isGapDocsMenuVisible = function(){
	return $("#dirty-gapdocs-button-show").css("display") !== "none";
};

APP.WIDGET.isAClickInsideGapDocsMenu = function(jObject){
	var isGapDocsShowButton = jObject[0] === $("#dirty-gapdocs-button-show")[0];
	var isGapDocsMenu = (jObject.parents("#dirty-gapdocs-menu").length > 0) || (jObject[0] === $("#dirty-gapdocs-menu")[0]);

	return isGapDocsMenu || isGapDocsShowButton;
};

/*************************************** responsive menu *************************************/

APP.WIDGET.isResponsiveMenuVisible = function(){
	return APP.CACHE.jResponsiveMenuButton.css("display") !== "none"
};

APP.WIDGET.isResponsiveMenuOpen = function(){
    return APP.CACHE.jMenuOptions.hasClass("menu-options-slide-down");
};

APP.WIDGET.isAClickInsideResponsiveMenu = function(jObject){
    var isResponsiveMenu = (jObject.parents("#menu-responsive").length > 0) || (jObject[0] === APP.CACHE.jResponsiveMenu[0]);
    var isMainMenu = (jObject.parents("#menu-options").length > 0) 	|| (jObject[0] == APP.CACHE.jMenuOptions[0]);

    return isMainMenu || isResponsiveMenu;
};

APP.WIDGET.closeResponsiveMenu = function(){
	APP.CACHE.jBody.removeClass("noscroll");
	APP.CACHE.jMainContainer.removeClass("noscroll-ios");
	APP.CACHE.jMenuOptions.removeClass("menu-options-slide-down");
	//@TODO: use a keyframe	
	setTimeout(function(){		
		APP.CACHE.jMenu.addClass("invisible-on-mobile");	
	},300); //waith long enough to let slide-down animation to finish
};

APP.WIDGET.openResponsiveMenu = function(){
	APP.CACHE.jBody.addClass("noscroll");
	APP.CACHE.jMainContainer.addClass("noscroll-ios");
	APP.CACHE.jMenu.removeClass("invisible-on-mobile");
	//@TODO: use a keyframe
	setTimeout(function(){
		APP.CACHE.jMenuOptions.addClass("menu-options-slide-down");
	}, 10);	
};

//**********************************************************************************************
//                                          AJAX PACKAGE 
//**********************************************************************************************


APP.AJAX.errorHandler = function(opt){
	var errorUrl = "resources/ajax-content/errors/errorGeneric-content.html";
    // error handling
     if(opt.xhr.status==404) {
     	errorUrl = "resources/ajax-content/errors/error404-content.html";		     	
     }

     opt.jContent.show();
     APP.CACHE.jLoadingBox.hide();
     opt.jContent.load(errorUrl, function(){
     	opt.jContent.find(".error-url").html(opt.url);
     	opt.jContent.find(".error-log").html(opt.error);
     });		     	
}

APP.AJAX.reloadMathJax = function(){
	var theTimer;
	//as soon as the ajax page has been loaded, "jaxify" any equation in the page
	//we need a timeout because mathjax is loaded asynchronously
	theTimer = setTimeout(function(){
		if(typeof MathJax != "undefined") {
			MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
			//stop the timer
			clearTimeout(theTimer);
		}
	},1000);		
};


/* Required arguments: 
        url:        ajax url that will be used to fetch the html content.
        jContent:   the jquery Object where the html content will be loaded.
        sectionId:  the section id associated with the html content.

   Optional arguments:
        urlHistory: the url that will be used by the html5 history API.     
        onFadeOut:  callback to execute after the fade out event
        onFadeIn:   callback to execute after the fade in event
*/
APP.AJAX.loadAjaxSection = function(opt){

	//push the button associated with the section id.
	APP.WIDGET.pushSectionButton(opt.sectionId);

	if(typeof opt.urlHistory !== "undefined"){
		//update the html5 history
		history.pushState({
			id: opt.sectionId,
			isFullAjax: false,
			urlAjax: opt.url
		}, null, opt.urlHistory);
	}

	APP.AJAX.loadContentHtml({
		jContent:  opt.jContent, 
		url:       opt.url, 
		onFadeOut: function(jContent){

			//remove helper class used by full-ajax sections
			jContent.removeClass("format-fullajax-content");	
			//show the banner
			APP.CACHE.jBanner.show();

			if(typeof opt.onFadeOut !== "undefined"){
			    opt.onFadeOut(jContent);
		    }
	    }, 
	    onFadeIn: function(jContent){

			if(typeof opt.onFadeIn !== "undefined"){
				opt.onFadeIn(jContent);
			}

			//IMPORTANT: scroll should be the last method to call in "onFadeIn";
			//           otherwise the scroll method will not be able to get the correct position
			//           of the element to scroll to.
		    APP.WIDGET.scrollToBoxPosition("body", function(){
		    	APP.AJAX.reloadMathJax();
		    });
		}		
	});
};

/*
    Required arguments  
        jContent: 
        sectionId: 
        url:
        
    Optional arguments    
        urlHistory: 
        onContainerReady:
        onFadeOut:
        onFadeIn:

*/
APP.AJAX.loadGapAjaxSection = function(opt){
	var docUrlInfo = APP.UTIL.getChapterAndHashFromGapDocUrl(opt.url); 
	//push the button associated with the section id
	APP.WIDGET.pushSectionButton(opt.sectionId);

	if(typeof opt.urlHistory !== "undefined"){
		
		history.pushState({
			id: opt.sectionId,
			isFullAjax: true,
			urlAjax: opt.url
		}, null, opt.urlHistory);
	}

	APP.AJAX.loadFullHtml({			
		jContent:       opt.jContent,
		url:            opt.url,
		wrapperPrefix:  '<div id="dirty-gapdocs-container" ><div id="dirty-gapdocs-content" >',
		wrapperSuffix:  '</div></div>',
		onContainerReady: function(jGapDocsContainer){
			//var gapDocsContainer = jContent.find("#dirty-gapdocs-container");
			jGapDocsContainer.data("section-id", opt.sectionId);
			APP.DIRTY.fixGapDocsContainer(jGapDocsContainer, docUrlInfo.chapter);
		},
		onFadeOut: function(jContent){
			opt.jContent.addClass("format-fullajax-content");
			APP.CACHE.jBanner.hide();	
			//APP.WIDGET.removeIOSRubberEffect( document.querySelector( "div.ChapSects" ) );

			if(typeof opt.onFadeOut !== "undefined"){
				opt.onFadeOut(jContent);
			}
	    },
		onFadeIn: function(jContent){

			if (typeof opt.onFadeIn !== "undefined") {
				opt.onFadeIn(jContent);
			}

			//IMPORTANT: scroll should be the last method to call in "onFadeIn";
			//           otherwise the scroll method will not be able to get the correct position
			//           of the element to scroll to.
			var boxToScroll = (docUrlInfo.hash.trim().length > 0)? "#" + docUrlInfo.hash : "body";
			APP.WIDGET.scrollToBoxPosition(boxToScroll);
		}
	});			
};

/*
jContent, url, onFadeOut, onFadeIn
*/
APP.AJAX.loadContentHtml = function(opt){

	opt.jContent.fadeOut(300,function(){


	    APP.CACHE.jLoadingBox.css("display", "block");	

		//when the DOM of the ajax link is ready do:
		opt.jContent.load(APP.UTIL.randomizeUrl(opt.url), function(){	

			if (typeof opt.onFadeOut !== "undefined") {
				opt.onFadeOut(opt.jContent);
			}

			APP.CACHE.jLoadingBox.css("display", "none");	
			opt.jContent.fadeIn(300,function(){

			    if(typeof opt.onFadeIn !== "undefined"){
			    	opt.onFadeIn(opt.jContent);
			    }
			});

		}); //end of load	
	}); //end of fadeOut
};

/*jContent, url, onFadeOut, onFadeIn*/
APP.AJAX.loadFullHtml = function(opt){

	opt.jContent.fadeOut(300,function(){

		APP.CACHE.jLoadingBox.css("display","block");
		$.get(APP.UTIL.randomizeUrl(opt.url),function(fullHtml){
			var jContainer, containerHtml;

			//@TODO: "PONER UN NOT FOUND"

			containerHtml =  fullHtml.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '');
			containerHtml =  opt.wrapperPrefix + containerHtml  + opt.wrapperSuffix;		                     		           

			jContainer = $(containerHtml);

			if(typeof opt.onContainerReady !== "undefined"){
				opt.onContainerReady(jContainer);
			}
									
			opt.jContent.html(jContainer.wrap("<div/>"));								

			if(typeof opt.onFadeOut !== "undefined"){
				opt.onFadeOut(opt.jContent);
			}

			opt.jContent.get(0).offsetHeight; 
			APP.CACHE.jLoadingBox.css("display","none");
			opt.jContent.fadeIn(300,function(){

				if (typeof opt.onFadeIn !== "undefined") {
					opt.onFadeIn(opt.jContent);
				}									
			});		
		
		}).fail(function(xhr, status, error) {
			APP.AJAX.errorHandler({
				jContent: opt.jContent,
				xhr:      xhr,
				status:   status,
				error:    error,
				url:      opt.url				
			});
        });//end of $.get
    });//end fadeOut
};


//******************************************************************************************
//                                     LISTENER PACKAGE 
//******************************************************************************************


APP.LISTENER.CLICK.onAjaxLink = function(event){	
	var currentLink;

	event.preventDefault();	
	currentLink = $(event.currentTarget);	

	APP.WIDGET.closeResponsiveMenu();

	APP.AJAX.loadAjaxSection({
		jContent:   APP.CACHE.jContent, 
		sectionId:  APP.UTIL.getSectionIdFromSelector(currentLink.attr("id")),
		url:        currentLink.data("href"), 
		urlHistory: currentLink.data("history")
	});
};

APP.LISTENER.CLICK.onModalAjaxLink = function(event){	
	var currentLink, modalContentUrl;

	event.preventDefault();	
	currentLink = $(event.currentTarget);			

	//show modal loading box 
	APP.CACHE.jModalLoadingBox.show();

	modalContentUrl = APP.UTIL.randomizeUrl(currentLink.data("href")); 

	$.get(modalContentUrl, function (data) {
		//without the <div> tag we can't use the find() method
		var modalContainer = $("<div>" + data + "</div>").find(".modal");
		
		//append the modal container to the body
		modalContainer.appendTo(APP.CACHE.jBody);
		//disable the modal blox
		APP.CACHE.jModalLoadingBox.hide();
		//finally, show the modal window
		APP.WIDGET.showModalWindow(modalContainer, true);				
	});	
};

APP.LISTENER.CLICK.onGapAjaxLink = function(event){
	var currentLink;

	event.preventDefault();
	currentLink = $(event.currentTarget);

	APP.WIDGET.closeResponsiveMenu();

	APP.AJAX.loadGapAjaxSection({
		jContent:   APP.CACHE.jContent,
		sectionId:  APP.UTIL.getSectionIdFromSelector(currentLink.attr("id")), 
		url:        currentLink.data("href"), 
		urlHistory: currentLink.data("history")
	});

};

APP.LISTENER.CLICK.onLinkInsideContent = function(event){		
	var isGapDocUrl, isCustomAjaxLink, currentLink, hrefCurrentLink, urlFullHtml, sectionId, gapDocsContainer;

	currentLink = $(event.currentTarget);		
	hrefCurrentLink = currentLink.attr('href')
	//ignore clicks on anchors with classes: .ajax-link , .gap-ajax-link
	isCustomAjaxLink = APP.WIDGET.isCustomAjaxLink(currentLink);
	//test if the url follows the pattern chapter#number		
	isGapDocUrl = (isCustomAjaxLink == false) && APP.UTIL.isGapDocUrl(hrefCurrentLink);
	
	if(isGapDocUrl){			
		//build the url
		urlFullHtml = APP.UTIL.formatDocUrl(hrefCurrentLink);

		//NOTE: gapDocsContainer is NOT an array, is a jquery collection
		gapDocsContainer = APP.CACHE.jContent.find("#dirty-gapdocs-container");			

		//if this link doesn't have a #dirty-gapdocs-container parent
		if(gapDocsContainer.length === 0){ 
			//default section id
			sectionId = "documentation";
		} else {
			sectionId = gapDocsContainer.data("section-id");
		}

		APP.WIDGET.closeGapDocsMenu();
		APP.AJAX.loadGapAjaxSection({
			sectionId:  sectionId,
			jContent:   APP.CACHE.jContent, 
			url:        urlFullHtml,
			urlHistory: APP.UTIL.gapDocUrlToQueryString(sectionId, urlFullHtml)
		});		

		event.preventDefault();						
					
	} else if(isCustomAjaxLink === false && hrefCurrentLink.lastIndexOf("mailto") === -1){ //if the current link is an external link

		//open external links in new window
		window.open(hrefCurrentLink);
		event.preventDefault();			
	}		
};

APP.LISTENER.CLICK.onLinkInsideModal = function(event){		
	var currentLink, hrefCurrentLink, isCustomAjaxLink, isGapDocUrl, urlFullHtml, sectionId;
	
	currentLink = $(event.currentTarget);		
	hrefCurrentLink = currentLink.attr('href')
	//ignore clicks on anchors with classes: .ajax-link , .gap-ajax-link
	isCustomAjaxLink = APP.WIDGET.isCustomAjaxLink(currentLink);
	//test if it is an url that follows the pattern chapter#number		
	isGapDocUrl = (isCustomAjaxLink == false) && APP.UTIL.isGapDocUrl(hrefCurrentLink);
	
	if(isGapDocUrl){			
		//build the url
		urlFullHtml = APP.UTIL.formatDocUrl(hrefCurrentLink);

		//all the links pointing to a docUrl inside a modal window will be opened in the "documentation" section			
		sectionId = "documentation";	

		//build the url as a query string and open it in a new window
		window.open(APP.UTIL.gapDocUrlToQueryString(sectionId, urlFullHtml));
		
		event.preventDefault();											
	}

};

APP.LISTENER.CLICK.onResponsiveButton = function(event) {		    

	if(APP.WIDGET.isResponsiveMenuOpen()){		
	    APP.WIDGET.closeResponsiveMenu();
	} else {
	    APP.WIDGET.openResponsiveMenu();
	}
};

APP.LISTENER.CLICK.onGapDocsMenuShowButton = function(event){			
	$("#dirty-gapdocs-menu-lframe").addClass("dirty-gapdocs-menu-lframe-fixed");
	APP.WIDGET.openGapDocsMenu();
};

APP.LISTENER.CLICK.onGapDocsMenuHideButton = function(event){	
	$("#dirty-gapdocs-menu-lframe").removeClass("dirty-gapdocs-menu-lframe-fixed");	
	APP.WIDGET.closeGapDocsMenu();    
};

APP.LISTENER.CLICK.onClickInsideWindow =  function(event){		
	var jObject = $(event.target);
	var gapDocsMenu = $("#dirty-gapdocs-menu");
	
    if( APP.WIDGET.isAClickInsideResponsiveMenu(jObject) === false &&  APP.WIDGET.isResponsiveMenuOpen() === true){
     	APP.WIDGET.closeResponsiveMenu();
    }    	   

    if(APP.WIDGET.isAClickInsideGapDocsMenu(jObject) === false && APP.WIDGET.isGapDocsMenuOpen() === true){
    	APP.WIDGET.closeGapDocsMenu();
    }	
};

APP.LISTENER.TOUCH.onMove = function( event ) {
    var isTouchMoveAllowed = true, target = event.target;

    while ( target !== null ) {
        if ( target.classList && target.classList.contains( 'noscroll-ios' ) ) {
            isTouchMoveAllowed = false;
            break;
        }
        target = target.parentNode;
    }

    if ( !isTouchMoveAllowed ) {
        event.preventDefault();
        //APP.CACHE.jMainContainer.removeClass("noscroll-ios");
    }
};

APP.LISTENER.RESIZE.onWindow = function() {

	var modalWindow = $(".modal");
	if(modalWindow.length > 0){
		APP.WIDGET.resizeModalWindow(modalWindow);
	}

	//close responsive menu if it is open and invisible
	if ( APP.WIDGET.isResponsiveMenuOpen() && APP.WIDGET.isResponsiveMenuVisible() === false){
		APP.WIDGET.closeResponsiveMenu();
	}

	//close gap docs menu if it is open and invisible 
	if (APP.WIDGET.isGapDocsMenuOpen() && APP.WIDGET.isGapDocsMenuVisible() === false) {
		APP.WIDGET.closeGapDocsMenu();
	}
};


APP.LISTENER.HISTORY.onPopState = function(e) {
	var historyData = e.state;	
	
	if(historyData === null){
	   historyData = APP.CACHE.firstPageHistory;
	} 

	var opt = {
		jContent:  APP.CACHE.jContent,
		sectionId: historyData.sectionId, 
		url:       historyData.urlAjax
	}

	if(historyData.isFullAjax === true){
		APP.AJAX.loadGapAjaxSection(opt);
	} else {
		APP.AJAX.loadAjaxSection(opt);
	}   	
};



//*****************************************************************************************
//                                   INIT PACKAGE 
//*****************************************************************************************

APP.INIT.setLayout =  function(sectionId, onLayoutReady, onContentLayoutReady) {		
	var jBody = $("body");
	
	//get the layout using ajax
	$.get(APP.UTIL.randomizeUrl("resources/ajax-content/layout.html"), function(layoutHtml){

		//insert layout into body (the layout includes #content)
		$(layoutHtml).prependTo(jBody);				

		//find the ajax-link or gap-ajax-link associated to this sectionId
		var jLink = jBody.find(APP.UTIL.buildSectionIdSelector(sectionId));
		//prepare options for ajax call
		var opt = {
			jContent:  jBody.find("#content"),
			sectionId: sectionId,
		    url:   jLink.data("href") //default url
		};
		var isFullAjax = jLink.hasClass("gap-ajax-link");
		var ajaxMethod = "loadAjaxSection"; //default ajax method

	    //if the first page requires a gap document (it also requires full-ajax)
	    if (isFullAjax){   	 
	    	//get url params for documentation
	    	var paramsUrl = APP.UTIL.getParamsUrl();
	    	//if the user wants a specific chapter
	    	if(typeof paramsUrl.chapter !== "undefined"){	    		
	    		//check if the user wants a specific position in the page (hash)
	    		hash = (typeof paramsUrl.hash !== "undefined")? paramsUrl.hash : "";
	    		//override default url
	    		opt.url = APP.UTIL.formatDocUrl(APP.UTIL.buildGapDocUrl(paramsUrl.chapter, hash));
	    	} 
	    	//override default ajax method
	    	ajaxMethod = "loadGapAjaxSection";	    
	    }

	    var firstPageHistory = {
	    	sectionId:  sectionId,
	    	urlAjax:    opt.url,
	    	isFullAjax: isFullAjax
	    };

	    //invoke first callback
		onLayoutReady(jBody, opt.jContent, firstPageHistory);

		//prepare final callback
		opt.onFadeIn = function(){
			onContentLayoutReady(jBody, opt.jContent, firstPageHistory);
		};
		//execute the ajax method
		APP.AJAX[ajaxMethod](opt);
    }); 
};


/* CALL THIS FUNCTION AFTER THE DOM AND CACHE ARE READY*/
APP.INIT.setListeners = function(){ 
	var jBody = APP.CACHE.jBody;
	var jWindow = APP.CACHE.jWindow;
    //******************** CLICK EVENT *********************
	jBody.on("click", ".ajax-link", APP.LISTENER.CLICK.onAjaxLink);
	jBody.on("click", ".modal-ajax-link", APP.LISTENER.CLICK.onModalAjaxLink);
	jBody.on("click", ".gap-ajax-link", APP.LISTENER.CLICK.onGapAjaxLink);
	// listen if a link (that leads to "documentation") is pressed
	jBody.on("click", "#content a", APP.LISTENER.CLICK.onLinkInsideContent);
	// listen if a link inside a modal window (that leads to "documentation") is pressed
	jBody.on("click", ".modal-body a", APP.LISTENER.CLICK.onLinkInsideModal);
    jBody.on("click", "#menu-responsive-button", APP.LISTENER.CLICK.onResponsiveButton);  
    jBody.on("click", "#dirty-gapdocs-button-show", APP.LISTENER.CLICK.onGapDocsMenuShowButton);
    jBody.on("click", "#dirty-gapdocs-button-hide", APP.LISTENER.CLICK.onGapDocsMenuHideButton);
    jWindow.on("click", APP.LISTENER.CLICK.onClickInsideWindow);
    
    //******************** RESIZE EVENT *********************
    jWindow.resize(APP.LISTENER.RESIZE.onWindow);

    //******************** HISTORY EVENT *********************
	window.addEventListener('popstate', APP.LISTENER.HISTORY.onPopState);

	//********************** IOS LISTENERS ********************************
	document.ontouchmove = APP.LISTENER.TOUCH.onMove;
    APP.WIDGET.removeIOSRubberEffect( document.querySelector( "#menu-options" ) );    
    
};



//  sectionId: the value of the "id" attribute without the "-link" suffix. 
APP.INIT.setFirstPage = function(sectionId){	

	//wait for the DOM to be ready
	$(document).ready(function(){

		//set html layout
		APP.INIT.setLayout(sectionId, function(jBody, jContent, firstPageHistory){
			//initialize CACHE
		    APP.CACHE.firstPageHistory = firstPageHistory;
		    //we need to save all the important jquery objects in cache in order to increase performance		    
		    APP.CACHE.jWindow  = $(window);
		    APP.CACHE.jBody    = jBody;
		    APP.CACHE.jContent = jContent;
		    APP.CACHE.jHtmlAndjBody = $("html, body");		    
		    APP.CACHE.jMenu    = jBody.find("#menu");		    
		    APP.CACHE.jBanner  = jBody.find("#banner");
		    APP.CACHE.jLoadingBox = jBody.find("#loading-box");
		    APP.CACHE.jModalLoadingBox = jBody.find("#modal-loading-box");
		    APP.CACHE.jMainContainer        = jBody.find("#main-container");
		    APP.CACHE.jMenuOptions          = jBody.find("#menu-options");
		    APP.CACHE.jResponsiveMenu       = jBody.find("#menu-responsive");
		    APP.CACHE.jResponsiveMenuButton = jBody.find("#menu-responsive-button");

		},function(jBody, jContent){
			//bind listeners to the DOM
		    APP.INIT.setListeners();	
		});		   

	});//end .ready()
};

