// Grid class
function Nom_Filter()
{
	// init
	var oNom_Filter = this;
	this.currentFilter = false;
	this.currentDossierFilter = false;
	this.aTypes = {'nieuws' : 'nieuwsberichten', 'video' : 'video\'s', 'tweet' : 'tweets', 'lezing' : 'lezingen'};

	this.SetTypeFilter = function(type) {
		// validate input
		if(typeof oNom_Filter.aTypes[type] == 'undefined') {
			alert("Onbekend filter type '" + type +"'");
			return false;
		}
		
		// remove all filters
		oNom_Filter.RemoveAllType(false);
		
		// Apply filter
		Nom_Globals.$timeline.addClass('filter-' + type);
		$("#filter_type").addClass('filter-' + type + ' filtered');
		
		// add "clear filter" button
		$("#filter-clear, #selection_type").show();
		
		// change selection text
		$("#selection_type").html('van de <strong>' + oNom_Filter.aTypes[type] + '</strong>');
		
		// open clouds
		Nom_Globals.oGrid.OpenRandomClouds();		
	}

	/**
	 * Get current filter
	 */
	this.GetCurrent = function()
	{
		return oNom_Filter.currentFilter;
	}
	
	/**
	 * Unset all type filters
	 */
	this.RemoveAllType = function(removeFilter)
	{
		// remove all filters
		for(type in oNom_Filter.aTypes) {
			Nom_Globals.$timeline.removeClass("filter-" + type);
			$("#filter_type").removeClass("filter-" + type);
		}
		
		$("#filter_type").removeClass("filtered");
		
		oNom_Filter.currentFilter = false;
		
		// remove "clear filter" button
		if(removeFilter === true) {
			$("#filter-clear").fadeOut("fast");
			// clear text
			$("#selection_type").fadeOut('slow', function(){
				$(this).html('');
			});
			// open clouds
			Nom_Globals.oGrid.OpenRandomClouds();		
		}
	}
	
	this.BuildTypeFilter = function()
	{
		var  i = 1;
		var oddEven = '';
		for(type in oNom_Filter.aTypes) {
			if(i%2) {
				oddEven = 'odd';
			} else {
				oddEven = 'even';			
			}
			var $filter = $('<div title="Toon alleen de ' + oNom_Filter.aTypes[type] +' in deze periode" id="filter-'+type+'" class="' + oddEven + ' typeFilter type filter ' + type + '"><span class="itemCount"></span> <span class="itemName">' + oNom_Filter.aTypes[type] + '</span></div>');
			$filter.click(function(){
				var typeFilter = $(this).attr("id").replace('filter-','');
				oNom_Filter.SetTypeFilter(typeFilter);
				
				// set event
				_gaq.push(['_trackEvent', 'Typefilters', 'Aanzetten', typeFilter]);

			
			}).hover(function(){
				$(".filterHelper").hide();
				var helperSelector = '#' + $(this).attr("id").replace('filter-', 'filterHelper-');
				$(helperSelector).show();
			}, function(){
				$(".filterHelper").hide();
			});
			$("#filter_type").append($filter);
			$("#filter_type").append('<span class="filterHelper" id="filterHelper-' + type +'">Toon alleen de ' + oNom_Filter.aTypes[type] + ' in deze periode<span class="lid"></span></span>');
			i++;
		}
		
		var $clearFilter = $('<div id="filter-clear" class="clearFilter">Verwijder filter</div>');
		$clearFilter.click(function(){
			oNom_Filter.RemoveAllType(true);
			
			// set event
			_gaq.push(['_trackEvent', 'Typefilters', 'Uitzetten']);
		});
		$("#filter_type").append($clearFilter);
	}
	
	
	this.SetDossierFilter = function(oDossier) 
	{
		// go to year view
		Nom_Globals.oGrid.GoToYear(Nom_Globals.oGrid.currentYear, function(){

			// remove all filters
			oNom_Filter.RemoveAllDossier(false);
			
			// Apply filter
			Nom_Globals.$timeline.find('.item:not(.today)').addClass('hidden');
			Nom_Globals.$timeline.find('.item.' + oDossier.GetClassName()).removeClass('hidden');
			
			// Update item count
			Nom_Globals.$timeline.find('.item.' + oDossier.GetClassName()).each(function(){
				$(this).find(".itemCount").text($(this).data(oDossier.GetClassName()).length);
			});
			
			// Set current
			oNom_Filter.currentDossierFilter = oDossier.GetClassName();
			
			// add "clear filter" button
			$("#dossier-close, #selection_dossier").show();
			
			// change selection text
			$("#selection_dossier").html('van dossier <strong>' + oDossier.Titel + '</strong>');
			
			// set item to active
			$('li#' + oDossier.GetClassName()).addClass('active');
			
			// open clouds
			Nom_Globals.oGrid.OpenRandomClouds();

		});
	}
	
	this.RemoveAllDossier = function(removeFilter)
	{
		// loop items
		Nom_Globals.$timeline.find(".item:not(.today, .mijlpaal)").each(function(){
			// update item count
			$(this).find(".itemCount").text($(this).data('aItems').length);
			// show items
			$(this).removeClass('hidden');
		});
		
		// no current dossier filter
		oNom_Filter.currentDossierFilter = false;
		
		// make items inactive
		$(".dossierWrapper li").removeClass('active')
		
		// remove "clear filter" button
		if(removeFilter === true) {
			$("#dossier-close").fadeOut("fast");
			// clear text
			$("#selection_dossier").fadeOut('slow', function(){
				$(this).html('');
			});
			// open clouds
			Nom_Globals.oGrid.OpenRandomClouds();		
		}
	}
	
	/**
	 * Checks if a dossier filter was set and returns the right one if it's so
	 */
	this.GetDossierFilter = function()
	{
		return oNom_Filter.currentDossierFilter;
	}
	
	this.BuildDossierFilter = function()
	{
		// loop items to find dossier
		var aDossiers = Nom_Globals.oData.GetDossiers();
		// loop dossiers
		for(var key in aDossiers) {
			// get dossier data
			var oDossier = aDossiers[key];
			if(typeof oDossier.Hoofddossier == 'undefined') {
				
				for(var dossierYear in oDossier['aYears']) { 
					// create year wrapper if it doesn't exist
					var $wrapper = $('#dossierWrapper-' + dossierYear + ' ul');
					if($wrapper.length == 0) {
					    var $wrapperDiv = $('<div id="dossierWrapper-' + dossierYear + '" class="dossierWrapper"><h2>Toon dossiers</h2></div>');
					    $("#filter_dossier").append($wrapperDiv);
					    $wrapper = $('<ul class="dossiers" />');
					    $wrapperDiv.append($wrapper);
					}
					
					// add list item
					var $listItem = $('<li id="' + oDossier.GetClassName() + '">' + oDossier.Titel + '<a target="_blank" href="' + oDossier.Pad + '">&rsaquo; bekijk</a></li>');
					$wrapper.append($listItem);
					$listItem.data('oDossier', oDossier);
					// list item events
					$listItem.click(function(){
					    // set this filter
					    oNom_Filter.SetDossierFilter($(this).data('oDossier'));
					    
					    // set event
					    _gaq.push(['_trackEvent', 'Dossierfilters', 'Aanzetten', $(this).data('oDossier').Titel]);
					});
				}
			}
		}
		
		var $clearFilter = $('<div id="dossier-close" class="clearFilter">Sluit dossier</div>');
		$clearFilter.click(function(){
			oNom_Filter.RemoveAllDossier(true);
			
			// set event
			_gaq.push(['_trackEvent', 'Dossierfilters', 'Uitzetten']);
		});
		$("#filter_dossier").append($clearFilter);
	}

}