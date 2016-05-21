// Grid class
function Nom_Item(oData)
{
	// init
	var oItem = this;
	this.oPopup = null;
		
	// adapt values of oData
	for(key in oData) {
		if(key != '') {
			oItem[key] = oData[key];
		}
	}

	/**
	 * Get date object for this item's post date
	 */
	this.GetDate = function() {
		var oDate = '';
		// fix date
		if(oItem['Post date'].indexOf('-') > 0) {
			// i.e. 2011-01-01
			var datePart = explode(' ', oItem['Post date'])[0];
			var aDateParts = explode('-', datePart);
			oDate = new Date(aDateParts[0] /* y */, parseInt(aDateParts[1], 10) - 1 /* m */, aDateParts[2] /* d */);
		}  else {
			// i.e. Mon Mar 12 12:32:28 +0000 2012
			var aDateParts = explode(' ', oItem['Post date']);
			oDate = new Date(aDateParts[1] + ' ' + aDateParts[2] + ', ' + aDateParts[5]);
		}
		
		return oDate;
	}
	
	/**
	 * Returns the type of the item
	 */
	this.GetType = function()
	{
		if(typeof oItem['Tijdlijntype'] == 'undefined' || !oItem.ValidateType()) {
			return 'nieuws';
		} else {
			return oItem['Tijdlijntype'].toLowerCase();
		}
	}

	/**
	 * Get the popup object for this item
	 */
	this.GetPopup = function()
	{
		if(oItem.oPopup === null) {
			oItem.oPopup = new Nom_Popup(oItem);
		}
		
		return oItem.oPopup;
	}
	
	/**
	 * Readable date (i.e. 18 oktober 2011)
	 */
	this.GetReadableDate = function()
	{
		var date = oItem.GetDate();	
		var day = date.getDate();
		var month = Nom_Globals.oGrid.GetNiceMonth(parseInt(date.getMonth() + 1, 10));
		var year = date.getFullYear();
		
		return day + ' ' + month + ' ' + year;
	}
	
	/**
	 * Check if this item has a valid type
	 */
	this.ValidateType = function()
	{
		switch(oItem['Tijdlijntype'].toLowerCase()) {
			case 'nieuws':
			case 'video':
			case 'tweet':
			case 'lezing':
			case 'mijlpaal':
				return true;
			break;
			default:
				return false;	
		}
	}
	
	/**
	 * Get the full HTML of the item
	 */
	this.GetCloudHTML = function()
	{
		// get type html
		var itemHtml = '';
		switch(oItem.GetType()) {
			case 'nieuws':
				itemHtml = oItem.GetNieuwsCloudHtml();
			break;
			case 'video':
				itemHtml = oItem.GetVideoCloudHtml();			
			break;
			case 'tweet':
				itemHtml = oItem.GetTweetCloudHtml();
			break;
			case 'lezing':
				itemHtml = oItem.GetLezingCloudHtml();
			break;
		}
		
		// compile html
		return '<div class="itemHtml">' + itemHtml + '</div>' + oItem.GetDossierCloudHtml();
	}
	
	/**
	 * Get the HTML content of a nieuws item
	 */
	this.GetNieuwsCloudHtml = function()
	{
		var title = oItem.GetTitleHtml();
		var image = oItem.GetImageHtml();
		var readMore = '<a class="readMore" href="' + Nom_Globals.baseUrl + oItem['Pad'] + '">&rsaquo; lees verder</a>';
		
		return title + image + readMore;
	}

	/**
	 * Get the HTML content of a video item
	 */	
	this.GetVideoCloudHtml = function()
	{
		var still = '<a class="playVideo" href="' + Nom_Globals.baseUrl + oItem['Pad'] + '">' + oItem.GetImageHtml() + '</a>';
		var readMore = '<a class="readMore" href="' + Nom_Globals.baseUrl + oItem['Pad'] + '">&rsaquo; bekijk video</a>';
		var title = oItem.GetTitleHtml();		
		return title + still + readMore;
	}
	
	/**
	 * Get the HTML content of a tweet
	 */
	this.GetTweetCloudHtml = function()
	{
		return '<strong class="tweetUsername">@nat_ombudsman</strong>' + linkify_tweet(oItem.GetTitleHtml(500));
	}
	
	/**
	 * Get the HTML content of a lezing item
	 */
	this.GetLezingCloudHtml = function()
	{
		var title = oItem.GetTitleHtml();
		var image = oItem.GetImageHtml();
		var readMore = '<a class="readMore" href="' + Nom_Globals.baseUrl + oItem['Pad'] + '">&rsaquo; lees meer</a>';
		
		
		if(oItem['Bestandenpad'].length > 0) {
			readMore = '<a class="readMore" href="' + Nom_Globals.baseUrl + oItem['Pad'] + '">&rsaquo; lees meer</a>';
		//	readMore = '<a class="readMore" target="_blank" href="' + oItem['Bestandenpad'][0] + '">&rsaquo; download bestand</a>';
		}
		
		return title + image + readMore;
	}
	
	/**
	 * Get an item's dossier HTML
	 */
	this.GetDossierCloudHtml = function()
	{
		// loop dossiers and add to dossier navigator
		var showDossier = false;
		var aDossiers = oItem.GetDossiers();
		for(index in aDossiers) {
		    var oDossier = aDossiers[index];    
			var currentFilter = Nom_Globals.oFilter.GetDossierFilter();			
			// dossier filter is on? only show dossier mention if it applies to current filter
			if(currentFilter !== false) {
				if(oDossier.GetClassName() == currentFilter) {
					showDossier = oDossier;
				}
			}
			// no dossier filter? show every dossier that we have. they will overwrite each other so only the last one is shown, but that's life...
			else {
				showDossier = oDossier;
			}
		}
		
		// get dossier html
		if(showDossier !== false && Nom_Globals.showDossierFilter != false) {
			var maxLength = 21;
			var title = oDossier['Titel'];
			if(title.length > maxLength) {
				title = title.substr(0, maxLength - 3) + '...';
			}
			return '<a target="_blank" href="' + oDossier['Pad'] +'" class="itemDossier">in dossier ' + title + '</a>';
		}
		
		return '';
	}
	
	/**
	 * What is this for?
	 */
	this.GetContentHtml = function()
	{
		return $('<div class="cloudContent" />');
	}
	
	/**
	 * Get title html
	 * @param dontShorten sorry for the double negative. Only set this to "true" if you want the entire title, not the shortened one
	 */
	this.GetTitleHtml = function(maxLength)
	{
		if(typeof maxLength === 'undefined') {
			var maxLength = 90;
		} 
		
		// init
		var title = oItem['Titel'];
		// strip
		if(title.length > maxLength) {
			title = title.substr(0, maxLength - 3) + '...';
			// title attribute with long title
			var titleAttr = 'title="' + strip_tags(oItem['Titel']).replace('"', '').replace('#', '').replace('@','').replace('http://','').replace('https','') + '"';
		}
		
		return '<h2 ' + titleAttr + '"><span>' +  title + '</span></h2>';
	}
	
	/**
	 * Image tag
	 */
	this.GetImageHtml = function()
	{
		// get youtube image for videos
		if(oItem.GetType() == 'video') {
			var id = 'videoThumb' + (Math.floor(Math.random() * 9000) + 1000);

			return '<img id="' + id + '" src="' + oItem.GetVideoThumb(id) + '" alt="' + oItem['Titel'] + '" />';
		}
		// all else: get image path from json feed
		else if(typeof oItem['Afbeelding'] !== 'undefined') {
			return '<img class="itemImage" src="' + oItem['Afbeelding'] + '" alt="' + oItem['Titel'] + '" />';
		} 
		
		return '';
	}
	
	/**
	 * Dossier objects for this item
	 */
	this.GetDossiers = function()
	{
		var aDossiers = new Array();
		var aDossierNames = oItem.GetDossierNames();
		for(index in aDossierNames) {
			if(oDossier = Nom_Globals.oData.GetDossierByName(aDossierNames[index])) {
				// subdossier? also  main dossier
			    if(typeof oDossier.Hoofddossier != 'undefined') {
			    	aDossiers.push(Nom_Globals.oData.GetDossierByName(oDossier.Hoofddossier));
			    } else {
				    aDossiers.push(oDossier);
			    }
			}
		}
		return aDossiers;
	}
	
	/**
	 * Get dossier names
	 */
	this.GetDossierNames = function()
	{
		// init
		var aDossierNames = new Array();

		// Check item type to see which field to use
		var fieldName = 'Dossier backreference';
		if(oItem.Type == 'Tijdlijnbericht') {
			fieldName = 'Dossier referentie';
		}
		
		// build array
		if(typeof oItem[fieldName] !== 'undefined') {
			if(typeof oItem[fieldName] != 'object') {
				oItem[fieldName] = new Array(oItem[fieldName]);
			}
			
			// loop dossiers
			for(index in oItem[fieldName]) {
				aDossierNames.push(oItem[fieldName][index].replace('Dossier: ', ''));
			}
			
			// return dossier names
			return aDossierNames;
		}
		
		// return empty array
		return aDossierNames;
	}
	
	/**
	 * Is this item a video?
	 */
	this.IsVideo = function()
	{
		return oItem.Tijdlijntype == 'Video';
	}
	
	/**
	 * Is this item a news item?
	 */	
	this.IsNews = function() 
	{
		return oItem.Tijdlijntype == 'Nieuws';
	}
	
	/**
	 * Is this item a tweet?
	 */
	this.IsTweet = function() 
	{
		return oItem.Tijdlijntype == 'Tweet';
	}
	
	/**
	 * Is this item a lezing?
	 */
	this.IsLezing = function()
	{
		return oItem.Tijdlijntype == 'Lezing';
	}
	
	/**
	 * Is this item a mijlpaal?
	 */
	this.IsMijlpaal = function()
	{
		return oItem.Tijdlijntype == 'Mijlpaal';
	}
	
	/**
	 * Get the youtube id for videos
	 */
	this.GetYouTubeID = function() {
		var url = oItem['Video'];
    	return decodeURIComponent(url).match(/(\?|&)v=([^&]+)/).pop();
	}

	/**
	 * Get the youtube id for videos
	 */
	this.GetVimeoID = function() {
		var url = oItem['Video'];
		var match = url.match(/http:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/);
		if (match){
			return match[2];
		}
		
		return null;
	}
		
	/**
	 * Get the YouTube embed code for videos
	 */
	this.GetEmbedCode = function()
	{
		var videoUrl = oItem['Video'];
		
		// youtube		
		if(videoUrl.indexOf('youtu') > 0) {
			return '<iframe width="590" height="330" src="http://www.youtube.com/embed/' + oItem.GetYouTubeID() + '?autoplay=1&border=0&controls=0&modestbranding=1&theme=light" frameborder="0" allowfullscreen></iframe>';
		}
		// vimeo
		else {
			return '<iframe width="590" height="330" src="http://player.vimeo.com/video/' + oItem.GetVimeoID() + '?autoplay=1" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';
		}
	}
	
	this.GetVideoThumb = function(id)
	{
		var videoUrl = oItem['Video'];
		
		// youtube		
		if(videoUrl.indexOf('youtu') > 0) {
			return 'http://img.youtube.com/vi/' + oItem.GetYouTubeID() + '/0.jpg';
		}
		// vimeo (asynchronous, returns a temp image and adds the right image later)
		else {
			$.getJSON('http://www.vimeo.com/api/v2/video/' + oItem.GetVimeoID() + '.json?callback=?', {format: "json"}, function(data) {
				$("#" + id).attr('src', data[0].thumbnail_large);
			});
			
			return '/tijdlijn/images/empty.gif';
		}
		
	}
	
}