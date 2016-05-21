// Dossier
function Nom_Dossier(oData)
{
	// init
	var oDossier = this;
	this.aYears = new Array();

	// adapt values of oData
	for(key in oData) {
		if(key != '') {
			oDossier[key] = oData[key];
		}
	}
		
	this.GetClassName = function()
	{
		return 'dossier-' + oDossier['Titel'].toLowerCase().replace(/\W|_/gi, '-').replace(/ /gi, '-');
	}
	
	/**
	 * Get date object for this item's post date
	 */
	this.GetDate = function() {
		var oDate = '';
		// fix date
		if(oDossier['Post date'].indexOf('-') > 0) {
			// wrong date format, fix it
			var datePart = explode(' ', oDossier['Post date'])[0];
			var aDateParts = explode('-', datePart);
			oDate = new Date(aDateParts[0], aDateParts[1], aDateParts[2]);
		}  else {
			oDate = new Date(oDossier['Post date']);
		}
		
		return oDate;
	}
}