// 	============================================================================
//	OD HASH
// 	============================================================================

/*
 * ODHash class
 * Sets, gets and removes stuff from the address bar on a key-value basis
 */
 
var ODHash = {
	/* 
	 * Set a kay and value
	 * Use like ODHash.Set(key, value)
	 */
	Set: function(key, value)
	{
		// init
		var newHash = '';
		if(ODHash.Get(key)) {
			ODHash.Remove(key);
		}
		
		window.location.hash = window.location.hash + ODHash.GetSyntax(key, value);
	},
	
	/* 
	 * Get syntax for one hash
	 * Use like ODHash.GetSyntax(key, value)
	 */	
	GetSyntax: function(key, value)
	{
		return '!/' + key + '/' + value;
	},
	
	/* 
	 * Get value for hash item
	 * Use like ODHash.Get(key)
	 */	
	Get: function(key)
	{
		// get complete hash string to search in
		var hash =  window.location.hash.substr(1);
		
		// determine search string to find key
		var searchStr = ODHash.GetSyntax(key, '');
			
		// key found? extract value
		var keyBegin = hash.indexOf(searchStr);
		if(keyBegin !== -1) {
			var value = '';
			
			// substr only the part that we need and return
			var nextKeyBegin = hash.indexOf('!/', keyBegin + 1);
			if(nextKeyBegin === -1) {
				value = hash.substring(keyBegin + searchStr.length);
			} else {
				value = hash.substring(keyBegin + searchStr.length, nextKeyBegin);
			}
			return value;
		} 
		// key not found? return false
		else {
			return false;
		}
	},
	
	/* 
	 * Remove item from window hash
	  * Use like ODHash.Remove(key)
	 */
	Remove: function(key)
	{
		var removeStr = ODHash.GetSyntax(key, ODHash.Get(key));
		window.location.hash = window.location.hash.replace(removeStr, "");
	}
};