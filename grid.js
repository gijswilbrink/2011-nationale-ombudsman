// Grid class
function Nom_Grid()
{
	// init
	var oNom_Grid = this;
	this.currentYear = null;
	this.currentMonth = null;
	this.aMonthNames = new Array(
		'Januari',
		'Februari',
		'Maart',
		'April',
		'Mei',
		'Juni',
		'Juli',
		'Augustus',
		'September',
		'Oktober',
		'November',
		'December'
	);
	this.aShortMonthNames = new Array(
		'Jan', 
		'Feb',
		'Maa',
		'Apr',
		'Mei',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Okt',
		'Nov',
		'Dec'
	);

	/**
	 * Switch between month and year
	 */
	this.SwitchView = function(type) {
		// correct type
		if(typeof type == 'undefined') {
			type = 'year';
		}
		
		// remove display styles set with jquery
		$('#gridWrapper *').css("display", "");
		
		// switch class
		if (type == 'year') {
			Nom_Globals.$timeline.removeClass("view-month").addClass("view-year");
			$("body").removeClass("view-month").addClass("view-year");
		} else if (type == 'month') {
			Nom_Globals.$timeline.removeClass("view-year").addClass("view-month");
			$("body").removeClass("view-year").addClass("view-month");
		}

	}

	/**
	 * Creates grid with years, months and days
	 */
	this.Create = function(startYear, endYear, currentYear, currentMonth)
	{
		// wrapper
		var $gridWrapper = $('<div id="gridWrapper" />');
		Nom_Globals.$timeline.append($gridWrapper);
		$gridWrapper.append($('<div id="divider" />'));
		
		// loop years
		for(var year = startYear; year <= endYear; year++) {
			// create year div
			var yearId = 'y' + year;
			var $year = $('<div class="year ' + yearId + '" id="'+ yearId +'" />');
			$gridWrapper.append($year);
			$year.data("year", year);
			
			// create year choice
			var yearTxt = 'Toon de hele tijdlijn van ' + year;
			if(year == Nom_Globals.todayYear) {
				var yearTxt = 'Toon de hele tijdlijn tot vandaag';
			} 
			var $yearChoice = $('<div class="yearChoiceContainer ' + yearId + '" id="choiceContainer-'+ yearId +'"><span class="yearChoice" id="choice-'+ yearId +'">' + yearTxt +'</span></div>');
			$("#selection_options").append($yearChoice);
			
			// loop months
			for(var month = 1; month <= 12; month++) {
				// create month div
				var monthId = 'm' + month;
				var $month = $('<div class="month ' + yearId + ' ' + monthId + '" id="' + yearId + monthId + '" />');
				$year.append($month);
				$month.data("year", year);
				$month.data("month", month);
				
				// create month choice
				var $monthChoice = $('<span class="monthChoice ' + monthId + '" id="choice-' + yearId + monthId +'">' + oNom_Grid.GetNiceMonth(month, 'short') + '</span>');
				$yearChoice.append($monthChoice);
			
				// loop days
				var iDaysInMonth = oNom_Grid.DaysInMonth(year, month);
				for(var day = 1; day <= iDaysInMonth; day++) {
					// create day div
					var dayId = 'd' + day;
					var $day = $('<div class="hiddenIn-year shownIn-month day ' + yearId + ' ' + monthId + ' ' + dayId + '" id="' + yearId + monthId + dayId + '" />');
					
					$day.css('width', (100 / iDaysInMonth) + '%');
					
					// apply to grid
					$month.append($day);
					$day.data("year", year);
					$day.data("month", month);
					$day.data("day", day);
					
					// day label
					var $dayLabel = $('<span class="label dayLabel">' + day + '</span>');
					$day.append($dayLabel);
				}	
				
				// month label
				var $monthLabel = $('<span class="label monthLabel hiddenIn-month shownIn-year">' + oNom_Grid.GetNiceMonth(month, 'short') + '</span>');
				$month.append($monthLabel);
			}
			
			// year label
			var $yearLabel = $('<span class="label yearLabel">' + year + '</span>');
			$year.append($yearLabel);
		}
		
		// grid wrapper width
		$("#gridWrapper").width(Nom_Globals.$timeline.width() * $(".year").length * 12);
		
		// apply choice events
		oNom_Grid.ApplyChoiceEvents();
	}

	this.FixChoiceNav = function()
	{
		$("#prevChoice, #nextChoice").removeClass("disabled");
		var newOffset = parseInt($('#choiceWrapper').css("left").replace('px', ''), 10);
		if(newOffset >= 0) {
			$("#prevChoice").addClass("disabled");
		} 
		
		if(newOffset <= (0 - $("#choiceWrapper").width() + $(".yearChoiceContainer").width())) {
			$("#nextChoice").addClass("disabled");
		}
	}

	/**
	 * Apply events to month and year choices
	 */
	this.ApplyChoiceEvents = function()
	{	
		// create wrapper
		var $choiceWrapper = $('<div id="choiceWrapper" />');
		$("#selection_options").append($choiceWrapper);
		$choiceWrapper.append($(".yearChoiceContainer"));
		var yearWidth = $(".yearChoiceContainer").width();
		var totalWidth = yearWidth * $(".yearChoiceContainer").length;
		$choiceWrapper.width(totalWidth);

		// prev choice
		$("#prevChoice").click(function(){
			var currentOffset = parseInt($choiceWrapper.css("left").replace('px', ''), 10);
			if(currentOffset < 0) {
				$choiceWrapper.animate({
					left: currentOffset + yearWidth
				}, 600, function(){
					oNom_Grid.FixChoiceNav();
				});
			}
		});
		
		// next choice
		$("#nextChoice").click(function(){
			var currentOffset = parseInt($choiceWrapper.css("left").replace('px', ''), 10);
			if(currentOffset > (0 - totalWidth + yearWidth)) {
				$choiceWrapper.animate({
					left: currentOffset - yearWidth
				}, 600, function(){
					oNom_Grid.FixChoiceNav();
				});
			}
		});
				
		// open button
		$("#selection_change").bind('click', oNom_Grid.OpenChoices);
		
		// choice events
		$(".yearChoice, .monthChoice").click(function(){
			var selector = $(this).attr("id").replace("choice-", "");
			oNom_Grid.GoToDiv(selector);
			
			// set event
			_gaq.push(['_trackEvent', 'Periodekeuze', 'Klik', selector]);
		});
		
		// hover out: hide selection area
		var selectionTimeout = null;
		$("#selection").hover(function(){
			clearTimeout(selectionTimeout);
		}, function(){
			selectionTimeout = setTimeout(oNom_Grid.CloseChoices, 1000);			
		});
	}
	
	/**
	 * Close the selection choices
	 */
	this.CloseChoices = function()
	{
		$("#selection").removeClass("expanded");
		// close choices
		$("#selection_choice").slideUp(600);
		// show normal navigation left & right
		$("#prev, #next").fadeIn(600, function(){
			// change parent frame height
			if(Nom_Globals.allowScriptAccess === true) {
				parent.document.getElementsByTagName("iframe")[0].height = Nom_Globals.defaultHeight;
			}
		});
		// change function of button
		$("#selection_change").text("kies maand/jaar").unbind('click', oNom_Grid.CloseChoices).bind('click', oNom_Grid.OpenChoices);
		
		 // set event
		 _gaq.push(['_trackEvent', 'Periodekeuze', 'Sluiten']);

	}
	
	/**
	 * Open the selection choices
	 */
	this.OpenChoices = function()
	{
		// change parent frame height
		if(Nom_Globals.allowScriptAccess === true) {
			parent.document.getElementsByTagName("iframe")[0].height = Nom_Globals.defaultHeight + 100;
		}
		
		$("#selection").addClass("expanded");
		// open choices
		$("#selection_choice").slideDown(600);
		// hide normal navigation left & right
		$("#prev, #next").fadeOut(600);
		// change function of button		
		$("#selection_change").text("klap menu in").unbind('click', oNom_Grid.OpenChoices).bind('click', oNom_Grid.CloseChoices);
		
		// set event
		 _gaq.push(['_trackEvent', 'Periodekeuze', 'Openen']);
	}
	
	/**
	 * Fill grid with icons
	 */
	this.Fill = function()
	{
		// loop items
		var aItems = Nom_Globals.oData.GetItems();
		for(id in aItems) {
			// add item to day and month div
			oNom_Grid.AddToDivs(aItems[id]);
		}

		// fix vertical offset of items
		Nom_Globals.$timeline.find(".item").each(function(){
			if(!$(this).hasClass("today") && !$(this).hasClass("mijlpaal")) {
				// add span with amount of items in this icon
				var amount =  $(this).data("aItems").length;
				$(this).html('<span class="itemCount">' + amount + '</span>');
				$(this).addClass('amount-' + amount);
			}
			// decide Y position
			oNom_Grid.DecideYPosition(this);
		});
		
		// today icon
		oNom_Grid.AddTodayIcon();
		
		// Mijlpaal events
		$(".mijlpaal").click(function(e){
			// set event
			_gaq.push(['_trackEvent', 'Tijdlijnitem', 'Klik', 'Mijlpaal']);
		 
			e.stopPropagation();
		}).hover(function(e){
			$(this).find(".mijlpaalText").each(function(){
				$(this).show();
				var $clone = $(this).clone();
				$clone.appendTo("body");
				$clone.css("left", $(this).offset().left);
				$clone.css("bottom", $("body").height() - $(this).offset().top - $(this).outerHeight());
				$clone.css("margin-left", 0);
				$clone.css('display', 'block');
				$(this).hide();
			});
		}, function(){
			$("body > .mijlpaalText").remove();
		});
	}
	
	/** 
	 * Get a reference to a grid div by its date
	 */
	this.AddToDivs = function(oItem)
	{
		// not allowed in mode? return
		if((Nom_Globals.mode == 'nieuws' && oItem['Tonen in master tijdlijn op nieuwssite'] == 'Nee') || (Nom_Globals.mode == 'jaarverslag' && oItem['Tonen op jaarverslag.nationaleombudsman.nl'] == 'Nee')) {
			return false;
		// mijlpaal
		} else if(oItem.IsMijlpaal()) {
			if(Nom_Globals.mode != 'nieuws') {
				var $dayPaal = $('<div class="mijlpaal item"><span class="mijlpaalLabel">Mijlpaal</span><span class="mijlpaalText">'+oItem['Titel']+'<span class="lid"></span></span></div>');
				var $monthPaal = $dayPaal.clone();
				$monthPaal.addClass('hiddenIn-month shownIn-year');
				$dayPaal.addClass('hiddenIn-year shownIn-month');
				if(oNom_Grid.GetDateDiv(oItem) != false) {
					oNom_Grid.GetDateDiv(oItem).append($dayPaal);
					oNom_Grid.GetDateDiv(oItem, 'month').append($monthPaal);
				}
			}
		}

		// only add item if it's within the scope
		else if(oItem.GetDate().getFullYear() < Nom_Globals.todayYear || (oItem.GetDate().getFullYear() == Nom_Globals.todayYear && oItem.GetDate().getMonth() < Nom_Globals.todayMonth)) {
			// add to month div
			oNom_Grid.AddItemToIconDiv(oItem, oNom_Grid.GetDateDiv(oItem, 'month'));
			
			// add to day div
			oNom_Grid.AddItemToIconDiv(oItem, oNom_Grid.GetDateDiv(oItem));
			
			// add date to dossier
			var itemYear = oItem.GetDate().getFullYear();
			var aItemDossiers = oItem.GetDossiers();
			for(var aItemDossierKey in aItemDossiers) {			
				// add year
				if(typeof aItemDossiers[aItemDossierKey]['nietinjarenjv'] == 'undefined' || aItemDossiers[aItemDossierKey]['nietinjarenjv'].indexOf(itemYear) == -1) {
				    aItemDossiers[aItemDossierKey]['aYears'][itemYear] = itemYear;
				}
			}
		}
	}
	
	/**
	 * Get the date div for an item
	 */
	this.GetDateDiv = function (oItem, type)
	{		
		// init
		if(typeof type == 'undefined') {
			type = 'day';
		}
		// get date, month, year
		if(oItem === false) {
			var date = new Date();
		} else {
			date = oItem.GetDate();
		}
		var day = date.getDate();
		var month = parseInt(date.getMonth() + 1, 10);
		var year = date.getFullYear();

		// is the item within the timeline scope?
		if(year < Nom_Globals.startYear || year > Nom_Globals.endYear) {
			return false;
		}
		
		// get the actual selector
		if(type == 'month') {
			var $dateDiv = $('#y' + year + 'm' + month);
		} else {
			var $dateDiv = $('#y' + year + 'm' + month  + 'd' + day);		
		}
		
		return $dateDiv;
	}
	
	/**
	 * Adds an item to an icon div. If no icvon div exists, it will be created
	 */
	this.AddItemToIconDiv = function (oItem, $parent) 
	{	
		if($parent !== false) {
			// icon div already exists
			if($parent.children('.' + oItem.GetType()).length > 0) {
				$iconDiv = $parent.children('.' + oItem.GetType());
			} else {
				// create div
				$iconDiv = oNom_Grid.CreateIconDiv(oItem);
				$parent.append($iconDiv);
				if($parent.hasClass("month")) {
					$iconDiv.addClass("hiddenIn-month shownIn-year");
				}
				$iconDiv.data('aItems', new Array());
			}
				
			// add id to icon data
			var aItems = $iconDiv.data('aItems');
			aItems.push(oItem.Nid);
			$iconDiv.data('aItems', aItems);
			
			// add id to dossier data
			var aDossiers = oItem.GetDossiers();

			for(index in aDossiers) {
				var oDossier = aDossiers[index];
				// only hoofddossiers
				if(typeof oDossier.Hoofddossier != 'undefined') {
					oDossier = Nom_Globals.oData.GetDossierByName(oDossier.Hoofddossier);
				}
				
				// no dossier array in this icon yet? add it
				if(typeof $iconDiv.data(oDossier.GetClassName()) == 'undefined') {
					$iconDiv.data(oDossier.GetClassName(), new Array());
				}
				
				// add item id to dossier array
				var aDossierItems = $iconDiv.data(oDossier.GetClassName());
				aDossierItems.push(oItem.Nid);
				$iconDiv.data(oDossier.GetClassName(), aDossierItems);
				
				// add dossier class to main icon
				$iconDiv.addClass(oDossier.GetClassName());
			}
		}
	}
	
	/**
	 * Creates an icon div for an item
	 */
	this.CreateIconDiv = function(oItem)
	{
		// create div
		var $iconDiv = $('<div class="item ' + oItem.GetType() + '"></div>');
		$("body").append($iconDiv);
		$iconDiv.data('type', oItem.GetType());
		
		// add events
		$iconDiv.click(function(e){	
			e.stopPropagation();
			$(this).GetCloud().OpenOrClose();	
			
			_gaq.push(['_trackEvent', 'Tijdlijnitem', 'Klik', oItem.GetType()]);
		});
		
		// return
		return $iconDiv;
	}	
	
	/**
	 * Add "today" icon
	 */
	this.AddTodayIcon = function()
	{
		if(Nom_Globals.endYear >= Nom_Globals.todayYear) {
			// day
			var $dayDiv = $('<div class="item today">Vandaag</div>');
			oNom_Grid.GetDateDiv(false).append($dayDiv);
			$dayDiv.click(function(e){
				e.stopPropagation();
				_gaq.push(['_trackEvent', 'Tijdlijnitem', 'Klik', 'vandaag']);
			});
					
			// month
			var $monthDiv = $dayDiv.clone(true).addClass("hiddenIn-month shownIn-year");		
			oNom_Grid.GetDateDiv(false, 'month').append($monthDiv);
		}
	}
	
	/**
	 * Decide the Y position of an item
	 */
	this.DecideYPosition = function(oItem)
	{
		// init
		var prev 	= $(oItem).prevAll('.item').length;
		var current = prev + 1;
		var total 	= $(oItem).siblings(".item").length + 1;
		var itemHeight = 85; // fixed amount
		
		// decide on which range the item may be in
		var pixelsPerPart = (Nom_Globals.$timeline.height() - 30/* correction for month and day labels at bottom*/) / total;
		var rangeStart = prev * pixelsPerPart;			
		var rangeEnd = current * pixelsPerPart - itemHeight;
				
		// decide offset
		var offset = Math.floor(Math.random() * (pixelsPerPart - itemHeight)) + rangeStart;
		
		// set offset
		$(oItem).css("top", offset + "px");
	}
	
	/**
	 * Close all clouds
	 */
	this.CloseClouds = function()
	{
		// loop all 
		$(".item.active").each(function(){
			// close
			$(this).GetCloud().Close();
		});
	}
		
	/**
	 * Open random clouds in current selection
	 */
	this.OpenRandomClouds = function()
	{
		// close all clouds
		oNom_Grid.CloseClouds();
		
		// find items in current selection
		// year
		if(oNom_Grid.IsYearView()) {
			var parent = "#y" + oNom_Grid.currentYear;
			// try jan/feb, august and december
			var $janfeb = $(parent + " > .m1 > .item:visible:not(.today, .mijlpaal), " + parent + " > .m2 > .item:visible:not(.today, .mijlpaal)");
			if($janfeb.length > 0) {
				// show jan feb
				oNom_Grid.SelectRandom($janfeb).GetCloud().Open();
				
				// show august
				$aug = $(parent + " > .m8 > .item:visible:not(.today, .mijlpaal)");
				if($aug.length > 0) {
					oNom_Grid.SelectRandom($aug).GetCloud().Open();
				}
				
				// show december
				$dec = $(parent + " > .m12 > .item:visible:not(.today, .mijlpaal)");
				if($dec.length > 0) {
					oNom_Grid.SelectRandom($dec).GetCloud().Open();
				}
			} else {
				// none in jan or feb? try march/april and oktober/november/december
				$marchapril = $(parent + " > .m3 > .item:visible:not(.today, .mijlpaal), " + parent + " > .m4 > .item:visible:not(.today, .mijlpaal)");
				if($marchapril.length > 0) {
					oNom_Grid.SelectRandom($marchapril).GetCloud().Open();
				}
				$octnovdec = $(parent + " > .m10 > .item:visible:not(.today, .mijlpaal), " + parent + " > .m11 > .item:visible:not(.today, .mijlpaal)" + parent + " > .m12 > .item:visible:not(.today, .mijlpaal)");
				if($octnovdec.length > 0) {
					oNom_Grid.SelectRandom($octnovdec).GetCloud().Open();
				}
			}	
		}
		// month: just open first and last cloud
		else {
			var parent = "#y" + oNom_Grid.currentYear + "m" + oNom_Grid.currentMonth;
			var $items = $(parent + " .day .item:visible:not(.today, .mijlpaal)");
			if($items.length > 0) {
				$($items[0]).GetCloud().Open();
				$($items[$items.length -1]).GetCloud().Open();
			}
		}
	}
	
	this.SelectRandom = function($items)
	{
		var randomNumber = Math.floor(Math.random() * $items.length);
		return $($items[randomNumber]);
	}
	
	/**
	 * determine the amount of days in a month
	 */
	this.DaysInMonth = function(year,month)
	{
		return new Date(year,month,0).getDate();
	}
	
	/**
	 * Are we in month mode?
	 */
	this.IsMonthView = function() 
	{
		return Nom_Globals.$timeline.hasClass("view-month");
	}
	
	/**
	 * Are we in year mode?
	 */
	this.IsYearView = function()
	{
		return Nom_Globals.$timeline.hasClass("view-year");	
	}
	
	/**
	 * What mode are we in?
	 */
	this.GetViewMode = function() 
	{
		if(oNom_Grid.IsMonthView()) {
			return 'month';
		}
		return 'year';
	}
	
	/**
	 * Go to a the next year or month (depending on if you're looking at a year or month)
	 * @param fnCallback function Callback
	 */
	this.Next = function(fnCallback)
	{
		// next month
		if(oNom_Grid.IsMonthView()) {
			var year = oNom_Grid.currentYear
			var month = oNom_Grid.currentMonth + 1
			if(oNom_Grid.currentMonth == 12) {
				year = year + 1;
				month = 1;
			}
			oNom_Grid.GoToMonth(year, month, fnCallback);
		} 
		// next year
		else {
			var year = oNom_Grid.currentYear + 1;
			oNom_Grid.GoToYear(year, fnCallback);		
		}
	}
	
	/**
	 * Go to a the previous year or month (depending on if you're looking at a year or month)
	 * @param fnCallback function Callback
	 */
	this.Prev = function(fnCallback)
	{
		// previous month
		if(oNom_Grid.IsMonthView()) {
			var year = oNom_Grid.currentYear
			var month = oNom_Grid.currentMonth - 1
			if(oNom_Grid.currentMonth == 1) {
				year = year - 1;
				month = 12;
			}
			
			oNom_Grid.GoToMonth(year, month, fnCallback);
		} 
		// previous year
		else {
			var year = oNom_Grid.currentYear - 1;
			oNom_Grid.GoToYear(year, fnCallback);
		}
	}
	
	/**
	 * Go to a specific month in the timeline
	 * @param year the year to go to 
	 * @param month the month to go to
	 * @param fnCallback function Callback
	 */
	this.GoToMonth = function(year, month, fnCallback)
	{		
		// correction
		year = parseInt(year, 10);
		month = parseInt(month, 10);
		if(year > Nom_Globals.endYear) {
			year = Nom_Globals.endYear;
			month = 12; 
		} else if (year == Nom_Globals.todayYear && month > Nom_Globals.todayMonth) {
			year = Nom_Globals.todayYear;
			month = Nom_Globals.todayMonth;
		}
		
		oNom_Grid.StartAnimate();
		
		// no need to go anywhere? call callback
		if(oNom_Grid.currentYear == year && oNom_Grid.currentMonth == month && (year != Nom_Globals.todayYear || month < Nom_Globals.todayMonth)) {
			if(typeof fnCallback == 'function') {
				fnCallback();
			}
			return;
		}
		// in year view? first slide to correct year, then zoom in
		else if(oNom_Grid.IsYearView()) {
		
			// close all clouds
			oNom_Grid.CloseClouds();

			// slide to correct year
			this.GoToYear(year, function(){
				// zoom in
				oNom_Grid.ZoomIn(month, function(){
					// small fix for current month
					if(year == Nom_Globals.todayYear && month >= Nom_Globals.todayMonth) {
						oNom_Grid.GoToMonth(year, month, fnCallback);
					} else {
						// set current month and year
						oNom_Grid.SetCurrentMonth(year, month);
						
						// selection changed
						oNom_Grid.SelectionChanged();
					
						// callback
						if(typeof fnCallback == 'function') {
							fnCallback();
						};
					}
				});			
			})
		}
		// in month view? slide
		else {	
			// close all clouds
			oNom_Grid.CloseClouds();
		
			// init	
			var $month = $("#y" + year + "m" + month);
			if($month.length > 0) {
				var endOffset = parseInt(0 - $month.position().left, 10);
				// year is same as today? only show until today
				if(year == Nom_Globals.todayYear && month >= Nom_Globals.todayMonth) {
					// set offset for today
					var $correctMonth = $("#y" + Nom_Globals.todayYear + "m" + Nom_Globals.todayMonth);
					endOffset = parseInt(0 - $correctMonth.position().left, 10) + $correctMonth.width() - (Nom_Globals.todayDay * $correctMonth.children(".d1").width());
					
					// this is what we call a "broken view"
					$('body').addClass('brokenView');

					// set divider
					$('#divider').css('left', ((endOffset * -1) + ((oNom_Grid.DaysInMonth(year, month) - Nom_Globals.todayDay) * $month.children(".d1").width())));
				}
				// set current month and year
				oNom_Grid.SetCurrentMonth(year, month);
				// go to point
				oNom_Grid.SlideToPoint(endOffset, fnCallback);
			} else {
				// callback
				if(typeof fnCallback == 'function') {
					fnCallback();
				};	
			}
		}
		
		// close all clouds
		oNom_Grid.CloseClouds();
	}
	
	/**
	 * Go to a specific year in the timeline
	 * @param year the year to go to
	 * @param fnCallback function Callback
	 */
	this.GoToYear = function(year, fnCallback)
	{
		// correction
		year = parseInt(year, 10);
		if(year > Nom_Globals.endYear) {
			year = Nom_Globals.endYear;
		} 
		
		oNom_Grid.StartAnimate();
		// no need to go anywhere? call callback
		if(oNom_Grid.currentYear == year && oNom_Grid.IsYearView() && year != Nom_Globals.todayYear) {
			// callback
			if(typeof fnCallback == 'function') {
				fnCallback();
			};
			return;
		} 
		// in month view? first zoom out, then slide to correct year
		else if(oNom_Grid.IsMonthView()) {			
			// close all clouds
			oNom_Grid.CloseClouds();
			
			// zoom out
			oNom_Grid.ZoomOut(function(){
				// slide to correct year (just call this function again and we'll be fine)
				oNom_Grid.GoToYear(year, function(){
					// set current month and year
					oNom_Grid.SetCurrentYear(year);
					
					// selection changed
					oNom_Grid.SelectionChanged();
					
					// callback
					if(typeof fnCallback == 'function') {
						fnCallback();
					}
				});
			});			
		} 
		// in year view? slide
		else {		
			// close all clouds
			oNom_Grid.CloseClouds();
		
			// init
			var $year = $("#y" + year);
			if($year.length > 0) {
				var endOffset = parseInt(0 - $year.position().left, 10);
				
				// year is same as today? only show until today
				if(year == Nom_Globals.todayYear && Nom_Globals.todayMonth != 12) {
					// get offset of today
					endOffset = endOffset + $year.width() - (Nom_Globals.todayMonth * $year.children(".m1").width());
					
					// this is a "broken view", which means no whole month or year is shown
					$('body').addClass('brokenView');
					
					// set divider
					$('#divider').css('left', ((endOffset * -1) + ((12 - Nom_Globals.todayMonth) * $year.children(".m1").width())));
				} 
								
				// set current month and year
				oNom_Grid.SetCurrentYear(year);
				
				// go to point
				oNom_Grid.SlideToPoint(endOffset, fnCallback);
			} else {
				// callback
				if(typeof fnCallback == 'function') {
					fnCallback();
				}
			}
		}
	}
	
	this.SetCurrentYear = function(year)
	{
		// set current month and year
		oNom_Grid.currentMonth = 0;
		oNom_Grid.currentYear = parseInt(year, 10);
	}
	
	this.SetCurrentMonth = function(year, month)
	{
		// set current month and year
		oNom_Grid.currentMonth = parseInt(month, 10);
		oNom_Grid.currentYear = parseInt(year, 10);
	}

	/**
	 * Go to a year or month div with a selector 
	 * @param selector div to go to
	 */
	this.GoToDiv = function(id, fnCallback)
	{	
		// replace y and #y, we don't need it
		id = id.replace('#', '').replace('y', '');
		
		// month div
		var monthIndex = id.indexOf('m');

		if(monthIndex > 0) {
			var year = id.substr(0, monthIndex);
			var month = id.substr(monthIndex + 1);

			oNom_Grid.GoToMonth(year, month, fnCallback);
		}
		// year div
		else {
			oNom_Grid.GoToYear(id, fnCallback);
		}
	}
	
	/**
	 * Zooms the timelone from year to month view
	 * @param fnCallback function Callback
	 */
	this.ZoomIn = function(month, fnCallback)
	{	
		// validate
		if(oNom_Grid.IsMonthView()) {
			fnCallback();
		}
	
		// init
		var iZoomSpeed = 600;
		var oMonth = document.getElementById('y' + oNom_Grid.currentYear + 'm' + month);

		// fade out year stuff, fade in month stuff
		$(".hiddenIn-month", oMonth).fadeOut(iZoomSpeed / 3, function(){
			$(".shownIn-month", oMonth).fadeIn(iZoomSpeed / 3);
		});

		// widths of the months
		$(".month").animate({
			width: Nom_Globals.$timeline.width()
		}, iZoomSpeed);

		// change grid wrapper offset
		var offset = 0 - (parseInt($(".month").index(oMonth), 10)) * Nom_Globals.$timeline.width();
		$("#gridWrapper").animate({
			'left' : offset
		}, iZoomSpeed, function(){
			// switch view
			oNom_Grid.SwitchView('month');

			// everybody loves callback functions
			if(typeof fnCallback == 'function') {
				fnCallback();
			};
		});	
	}
	
	/**
	 * Zooms the timelone from month to year view
	 * @param fnCallback function Callback
	 */
	this.ZoomOut = function(fnCallback)
	{
		// validate
		if(oNom_Grid.IsYearView()) {
			// everybody loves callback functions
			if(typeof fnCallback == 'function') {
				fnCallback();
			};
		}
		
		// init
		var iZoomSpeed = 600;
		var oYear = document.getElementById('y' + oNom_Grid.currentYear);
		var oMonth = document.getElementById('y' + oNom_Grid.currentYear + 'm' + oNom_Grid.currentMonth);
		
		// fade out year stuff, fade in month stuff
		$(".hiddenIn-year").hide();		
		$(".hiddenIn-year", oMonth).show().fadeOut(iZoomSpeed / 3, function(){
			$(".shownIn-year", oMonth).fadeIn(iZoomSpeed / 3);
		});
		
		// widths of the months
		$(".month").animate({
			width: Nom_Globals.$timeline.width() / 12
		}, iZoomSpeed);
		
		// change grid wrapper offset
		var timelineWidth = Math.floor(Nom_Globals.$timeline.width() / 12) * 12;
		var offset = 0 - (parseInt($(".year").index(oYear), 10) * timelineWidth);
		$("#gridWrapper").animate({
			'left' : offset
		}, iZoomSpeed, function(){
			// switch view\
			oNom_Grid.SwitchView('year');
			
			// everybody loves callback functions
			if(typeof fnCallback == 'function') {
				fnCallback();
			};
		});		
	}
	
	/**
	 * When we're going to another place
	 */
	this.StartAnimate = function()
	{
		$('body').removeClass('brokenView');
		$("body > .item").remove();
	}
	
	/**
	 * stuff we always have to do when selection has changed
	 */
	this.SelectionChanged = function()
	{		
		// change selection text
		oNom_Grid.ChangeSelectionText();
		
		// open random clouds
		oNom_Grid.OpenRandomClouds();
		
		// update selection bar
		oNom_Grid.UpdateSelectionBar();
		
		// activate or deactivate arrow buttons
		$("#prev, #next").removeClass("disabled");
		// deactivate next
		if((oNom_Grid.IsYearView() && oNom_Grid.currentYear == Nom_Globals.endYear) || (oNom_Grid.IsMonthView() && ((oNom_Grid.currentYear == Nom_Globals.endYear && oNom_Grid.currentMonth == 12) || (oNom_Grid.currentYear == Nom_Globals.todayYear && oNom_Grid.currentMonth == Nom_Globals.todayMonth)))) {
			$("#next").addClass("disabled");
		}
		
		// deactivate prev
		if((oNom_Grid.IsYearView() && oNom_Grid.currentYear == Nom_Globals.startYear) || (oNom_Grid.IsMonthView() && oNom_Grid.currentYear == Nom_Globals.startYear && oNom_Grid.currentMonth == 1)) {
			$("#prev").addClass("disabled");
		}
		
		// update visible dossiers
		$(".dossierWrapper").hide();
		$("#dossierWrapper-" + oNom_Grid.currentYear).show();
		
		// clone today icon
		$('#y' + oNom_Grid.currentYear + 'm' + oNom_Grid.currentMonth + ' .day .today').each(function(){
			var $clone = $(this).clone();
			$clone.appendTo("body");
			$clone.css("left", $(this).offset().left);
			$clone.css("top", $(this).offset().top);
			$clone.css("margin-left", 0);
			$clone.css("z-index", 900);
		});
	}
	
	/* updates the offset of the selection bar */
	this.UpdateSelectionBar = function()
	{
		$(".monthChoice").removeClass('active');
		var $yearChoice = $("#choiceContainer-y" + oNom_Grid.currentYear);
		var $monthChoice = $yearChoice.children('.m' + oNom_Grid.currentMonth);
		
		// set active
		$monthChoice.addClass('active');

		// fix offset
		$("#choiceWrapper").css('left', 0 - ($yearChoice.width() * $yearChoice.prevAll(".yearChoiceContainer").length));
		
		// fix navigation
		oNom_Grid.FixChoiceNav();
	}
	
	/**
	 * Go to a specific point in the timeline
	 * @param offset the pixels to go to
	 * @param fnCallback function Callback
	 */
	this.SlideToPoint = function(offset, fnCallback)
	{
		// animate
		$("#gridWrapper").animate({
			'left' : offset
		}, 400, function(){
			// selection changed
			oNom_Grid.SelectionChanged();
			
			// everybody loves callback functions
			if(typeof fnCallback == 'function') {
				fnCallback();
			};
		});
	}
	
	/**
	 * Instantly go to a specific year
	 */
	this.InstantlyToYear = function(year)
	{
		// init
		var $year = $("#y" + year);
		if($year.length > 0) {
			oNom_Grid.SwitchView('year');
			var endOffset = parseInt(0 - $year.position().left, 10);

			// year is same as today? only show until today
			if(year == Nom_Globals.todayYear && Nom_Globals.todayMonth != 12) {
			    // get offset of today
			    endOffset = endOffset + $year.width() - (Nom_Globals.todayMonth * $year.children(".m1").width());
			    
			    // this is a "broken view", which means no whole month or year is shown
			    $('body').addClass('brokenView');
			    
			    // set divider
			    $('#divider').css('left', ((endOffset * -1) + ((12 - Nom_Globals.todayMonth) * $year.children(".m1").width())));
			} 
				
			// set current month and year
			oNom_Grid.SetCurrentYear(year);
			
			// go to point
			$("#gridWrapper").css('left', endOffset + 'px');

			// selection changed
			oNom_Grid.SelectionChanged();
		}		
	}
	
	/**
	 * Change the text of the current selection 'Deze tijdlijn toont een selectie uit 2012'
	 */
	this.ChangeSelectionText = function()
	{
		$("#selection_fromTxt").html('uit');
		if(oNom_Grid.IsYearView()) {
			if(oNom_Grid.currentYear == Nom_Globals.todayYear) {
				$("#selection_fromTxt").html('tot vandaag');
				$("#selection_period").html('');
			} else {
				$("#selection_period").html('<strong>' + oNom_Grid.currentYear + '</strong>');
			}
		} else {
			$("#selection_period").html('<strong>' + oNom_Grid.GetNiceMonth(oNom_Grid.currentMonth) + ' ' + oNom_Grid.currentYear +'</strong>');	
		}
	}
	
	/**
	 * Get nice month name
	 */
	this.GetNiceMonth = function(month, type) {
		if(type == 'short') {
			return oNom_Grid.aShortMonthNames[month - 1];
		} else {
			return oNom_Grid.aMonthNames[month - 1];
		}
	}
}