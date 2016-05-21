// Load and returns data class
function Nom_Data()
{
	// init
	var oData = this;
	oData.messages = null;
	oData.items = null;
	oData.dossiers = null;

	/**
	 * Do JSON Requests to get the data
	 */
	this.Load = function(callback)
	{
		$.when(
			// when the following 3 ajax requests are loaded
			$.getJSON('json/tijdlijnbericht.json.php?m=20140220'),
			$.getJSON('json/dossiers.json.php?m=20140220'),
			$.getJSON('json/twitter.json.php?m=20140220')
		).then(function(r1, r2, r3){
			// then assign the values
			oData.SetDossiers(r2[0].nodes);
			oData.SetItems(r1[0].nodes);
			oData.SetTweets(r3[0]);		
			// and call the callback
			if(typeof callback == 'function') {
				callback();
			}
		});
	}

	/**
	 * Organize an array with the Nid field as key
	 */
	this.OrganizeArray = function (aItems, type)
	{
		if(typeof type == 'undefined') type = 'item';
		
		var aOrganized = new Array();	
		for (var i = 0; i < aItems.length; i++)
		{
			if(typeof aItems[i] == 'object') {
			    // items are tweets
			    if(type == 'tweets') {	
			    	aItems[i].node = {
			    		'Tijdlijntype': 'Tweet',
			    		'Nid': aItems[i].id_str,
			    		'Titel': aItems[i].text,
			    		'Post date': aItems[i].created_at	
			    	}
			    }
			
			    // key already exists
			    if(typeof aOrganized[aItems[i].node.Nid] != 'undefined' && typeof aItems[i].node['Bestanden (field_file) - data'] != 'undefined') {
			    	// already an array? add path
			    	if(typeof aOrganized[aItems[i].node.Nid]['Bestanden (field_file) - data'] == 'object') {
			    		 aOrganized[aItems[i].node.Nid]['Bestanden (field_file) - data'].push(aItems[i].node['Bestanden (field_file) - data']);
			    		 aOrganized[aItems[i].node.Nid]['Bestandenpad'].push(aItems[i].node['Bestandenpad']);
			    	} 
			    	// not an array? create new array
			    	else {
			    		aOrganized[aItems[i].node.Nid]['Bestanden (field_file) - data'] = new Array(aItems[i].node['Bestanden (field_file) - data']);
			    		aOrganized[aItems[i].node.Nid]['Bestandenpad'] = new Array(aItems[i].node['Bestandenpad']);
			    	}
			    }
			    // new key
			    else {
			    	if(type == 'dossiers') {
			    		aOrganized[aItems[i].node.Nid] = new Nom_Dossier(aItems[i].node);			
			    	} else {
			    		// normal item, new key
			    		aOrganized[aItems[i].node.Nid] = new Nom_Item(aItems[i].node);
			    		if(typeof aOrganized[aItems[i].node.Nid]['Bestanden (field_file) - data'] != 'object') {
			    			aOrganized[aItems[i].node.Nid]['Bestanden (field_file) - data'] = new Array();
			    			aOrganized[aItems[i].node.Nid]['Bestandenpad'] = new Array();
			    			if(typeof aItems[i].node['Bestanden (field_file) - data'] != 'undefined' ) {
			    				aOrganized[aItems[i].node.Nid]['Bestanden (field_file) - data'] = new Array(aItems[i].node['Bestanden (field_file) - data']);
			    				aOrganized[aItems[i].node.Nid]['Bestandenpad'] = new Array(aItems[i].node['Bestandenpad']);
			    			}
			    		}
			    	}
			    }
			}
		}
		return aOrganized;
	}
	
	/**
	 * Organize messages and set internal reference
	 */
	this.SetMessages = function(aItems)
	{
		oData.messages = oData.OrganizeArray(aItems);
	}
	
	/**
	 * Organize items and set internal reference
	 */
	this.SetItems = function(aItems)
	{
		oData.items =  oData.OrganizeArray(aItems);
	}
	
	/**
	 * Set tweets
	 */
	this.SetTweets = function(aTweets)
	{
		aOrganized = oData.OrganizeArray(aTweets, 'tweets');
		for(id in aOrganized) {
			oData.items[id] = aOrganized[id];
		}
	}
	
	/**
	 * Organize Dossiers and set internal reference
	 */
	this.SetDossiers = function(aItems)
	{
		oData.dossiers = oData.OrganizeArray(aItems, 'dossiers');
	}
	
	/**
	 * returns a single items item by id
	 */
	this.GetItemById = function(id)
	{
		return oData.items[id];	
	}
	
	/**
	 * returns a single Dossier item by id
	 */
	this.GetDossierById = function(id)
	{
		return oData.dossiers[id];
	}
	
	this.GetDossierByName = function(name)
	{
		for(id in oData.dossiers) {
			if(oData.dossiers[id]['Titel'] == name) {
				return oData.dossiers[id];
			}
		}
	}
	
	/**
	 * returns a single message item by id
	 */
	this.GetMessageById = function(id)
	{
		return oData.messages[id];
	}
	
	/**
	 * returns all Dossier items
	 */
	this.GetDossiers = function()
	{
		return oData.dossiers;
	}
	
	/**
	 * returns all items
	 */
	this.GetItems = function()
	{
		return oData.items;
	}
	
	/**
	 * returns all message items
	 */
	this.GetMessages = function()
	{
		return oData.messages;
	}
}