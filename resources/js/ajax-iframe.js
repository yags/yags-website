
//USELESS CODE :(
APP.CONSTANTS.URL_CSS_OVERRIDE_IFRAME = "/yags/resources/css/override-iframe.css";

//  idSection: a css selector pointing to any anchor in the "#menu" box that has an attribute: class="iframe-link".
//             Usually you will use the value of the "id" attribute. A jquery Object of the anchor it is also 
//             a valid argument for this function.
//  skipHistory: if true this method will not push a state for the HTML5 History API
APP.UTIL.loadIFrameSection = function(idSection, skipHistory) {
	var currentLink;

	currentLink = $(idSection);			

	APP.UTIL.setActiveLink(currentLink);
	APP.UTIL.loadIFrame(currentLink.data("href"), currentLink.attr("id"), skipHistory);
};


APP.UTIL.loadIFrame = function(url, idMenuButton, skipHistory){
	var iframeBox, contentBox, linkToDocHandler, onLoadHandler;

	contentBox = $("#content");

	//remove any previous iframe to avoid conflicts
	contentBox.find("iframe").remove();

	//hide banner for iframe links
	$("#banner").hide();

	//build the DOM of the iframe
	iframeBox = $('<iframe src="' + url + '"  width="100%" style="height: 100vh;" frameBorder="0"></iframe>');	

	updateIFrame = function(skipHistory){

		if(skipHistory === false){	
			//update html5 history
			APP.UTIL.updateDocumentHistory(iframeBox[0].contentWindow.location.href);
		}

		//override css
		$.get(APP.CONSTANTS.URL_CSS_OVERRIDE_IFRAME, function(response){
			var boxhtml, boxPosition, theHash;

			iframeBox.contents().find("head").append("<style>" + response + " />");

			theHash = iframeBox[0].contentWindow.location.hash.trim();
			if(theHash.length > 0){			
				boxhtml = iframeBox.contents().find(iframeBox[0].contentWindow.location.hash);
				boxPosition = boxhtml.offset().top;	

				//THIS SCROLL DOES NOT WORK FOR IFRAMES :(
				iframeBox.contents().find('html, body').animate({
					scrollTop: 0
				}, 0, function(){

					iframeBox.contents().find('html, body').animate({
						scrollTop: boxPosition
					}, 0);
				});

				/*
				$('html, body').animate({
					scrollTop: boxPosition
				}, 1000);
				*/
			}	       
		});		


		//reload mathjax
		//APP.UTIL.reloadMathJax();
	};
	
	//when the DOM of the iframe is ready call the onLoadHandler only ONCE.
	iframeBox.one("load",function(){

	    //listen every click on anchors	inside the iframe
		$('body iframe').contents().find('a').on('click',function(event) {
			var theURL = $(this).attr("href");

			//if the url is a doc url load the content in a new iframe inside #content
			//the current iframe will be destroyed
			if(APP.UTIL.isADocURL(theURL) === true){				
				theURL = APP.CONSTANTS.PREFIX_DOC_FOLDER + "/" + theURL;
				APP.UTIL.loadIFrame(theURL,idMenuButton,false);
			} else {
				//if the url is not a doc then load its contents in a new tab of the browser
				window.open(theURL,"_blank");				
			} 	

			//avoid any weird behaviour of the current iframe, we will destroy it and reload the iframe again anyway
			event.stopPropagation(); 
			//stop the normal way of update the iframe in order to control manually its refresh cycle
			event.preventDefault();
		});

		updateIFrame(skipHistory);
	});

	//format the content box in order to display the iframe
	contentBox.removeClass("format-content");

	//insert the iframe
	contentBox.html(iframeBox);		
};
