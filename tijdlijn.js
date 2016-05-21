// Globals, used in every JS file
var Nom_Globals = {
	$timeline			: null,
	baseUrl				: 'http://www.nationaleombudsman-nieuws.nl',
	oData 				: new Nom_Data(),
	oGrid 				: new Nom_Grid(),
	oFilter				: new Nom_Filter(),
	startYear			: 2008,
	endYear				: null,
	initialYear 		: 2011,
	todayYear			: null,
	todayMonth			: null,
	todayDay 			: null,
	showDossierFilter	: true,
	showTypeFilter		: true,
	dossier				: false,
	type				: false,
	mode				: 'nieuws',
	showBanner			: false,
	allowScriptAccess	: false,
	white				: true,
	defaultHeight		: 0
};

// Timeline class
function Nom_TimeLine()
{
	// make reference to main timeline in global
	Nom_Globals.$timeline = $("#timeline");
	
	// make an internal global so the class can always easily call itself
	var oTL = this;

	this.Init = function()
	{	
		// set today
		var date = new Date();
		Nom_Globals.todayDay = date.getDate();
		Nom_Globals.todayMonth = parseInt(date.getMonth() + 1, 10);
		Nom_Globals.todayYear = date.getFullYear();
		
		// set options (left hand side of $_GET( and defaults (right hand side)
		Nom_Globals.startYear 			= parseInt($_GET('startYear', Nom_Globals.startYear), 10);
		Nom_Globals.endYear 			= parseInt($_GET('endYear', Nom_Globals.todayYear), 10);
		Nom_Globals.initialYear 		= parseInt($_GET('initialYear', Nom_Globals.initialYear), 10);
		Nom_Globals.dossier				= $_GET('dossier', Nom_Globals.dossier);
		Nom_Globals.type				= $_GET('type', Nom_Globals.type);
		Nom_Globals.showDossierFilter 	= $_GET('showDossierFilter', Nom_Globals.showDossierFilter);
		Nom_Globals.showTypeFilter		= $_GET('showTypeFilter', Nom_Globals.showTypeFilter);
		Nom_Globals.mode				= $_GET('mode', Nom_Globals.mode);
		Nom_Globals.showBanner			= $_GET('showBanner', Nom_Globals.showBanner);
		Nom_Globals.allowScriptAccess	= $_GET('allowScriptAccess', Nom_Globals.allowScriptAccess);
		Nom_Globals.white				= $_GET('white', Nom_Globals.white);
		
		// white
		if(Nom_Globals.white === false) {
			$("body").css('background-color', '#EBEBEB');
		}
		
		// banner
		if(Nom_Globals.showBanner == false) {
			$(".banner").remove();
		}
		
		// change "what you see" text
		if(Nom_Globals.mode == 'nieuws') {
			$("#whatYouSee").text('informatie van de Nationale ombudsman');
		}
		
		// change parent frame height
		if(Nom_Globals.allowScriptAccess === true && typeof parent.document.getElementsByTagName("iframe")[0] != 'undefined') {
			Nom_Globals.defaultHeight =  $("#container").outerHeight() + $("#filters").outerHeight();
			parent.document.getElementsByTagName("iframe")[0].height = Nom_Globals.defaultHeight;
		}
		
		// only one year
		if(Nom_Globals.startYear == Nom_Globals.endYear) {
			$("#to_today").remove();
		}
		
		// set loading
		$("#next, #prev").addClass("disabled");
		var $loading = $('<span id="loading"/>');
		Nom_Globals.$timeline.append($loading);
		
		// create years, months and days
		Nom_Globals.oGrid.Create(Nom_Globals.startYear, Nom_Globals.endYear, Nom_Globals.initialYear);
		
		// get data
		Nom_Globals.oData.Load(function(){	
			// start animation
			oTL.IntroAnimation();
			
			$("#next, #prev").removeClass("disabled");
			// fill grid with icons
			Nom_Globals.oGrid.Fill();
			
			// build filter			
			Nom_Globals.oFilter.BuildTypeFilter();
			Nom_Globals.oFilter.BuildDossierFilter();	

			// pre filter
			if(Nom_Globals.dossier !== false) {
				Nom_Globals.oFilter.SetDossierFilter(Nom_Globals.oData.GetDossierById(Nom_Globals.dossier));
			}
			if(Nom_Globals.type !== false) {
				Nom_Globals.oFilter.SetTypeFilter(Nom_Globals.type);
			}
			
			// go to initial year
			Nom_Globals.oGrid.InstantlyToYear(Nom_Globals.initialYear);
			
			// remove loading icon
			$loading.remove();
		});
		
		// optionally hide filters
		if(Nom_Globals.showDossierFilter === false && Nom_Globals.showTypeFilter === false) {
			$("#filters").remove();
		} else if(Nom_Globals.showDossierFilter === false) {
			$("#filter_dossier").remove();
		} else if( Nom_Globals.showTypeFilter === false) {
			$("#filter_type").remove();
		}
		
		/**
		 * EVENTS
		 */
		// next prev events
		$("#next").click(function(){
			if(!$(this).hasClass("disabled")) {
				Nom_Globals.oGrid.Next();
			}
		});
		$("#prev").click(function(){
			if(!$(this).hasClass("disabled")) {
				Nom_Globals.oGrid.Prev();
			}
		});

		// zoom in when clicking on month
		$(".month").click(function(){
			if(Nom_Globals.oGrid.IsYearView()) {
				Nom_Globals.oGrid.GoToMonth($(this).data("year"), $(this).data("month"));
			}
		});
		
		// today button
		$("#to_today").click(function(){
			if(Nom_Globals.oGrid.IsMonthView()) {
				Nom_Globals.oGrid.GoToMonth(Nom_Globals.todayYear, Nom_Globals.todayMonth);
			} else {
				Nom_Globals.oGrid.GoToYear(Nom_Globals.todayYear);
			}
		});
	};
	
	this.IntroAnimation = function()
	{
		setTimeout(function(){
			var normalBg = $("#selection").css("background-color");
			$("#selection").css("background-color", "#ffe154");
			$("#selection").animate({
				'background-color' : normalBg
			}, 2000);
		}, 1500);
	}
	
	// start the init
	oTL.Init();
}

// on load
jQuery(function(){
	Nom_TimeLine();
});