/**
 * Locale 
 */
var Module = (function(){

	var moduleKEY = "Locale", loaded = {}, KEYS = {};

	/**
	 * load
	 * @param object keys
	 */
	function load(keys)
	{
		for (var key in keys) {
			KEYS[key] = keys[key];
		}
	}

	/**
	 * update
	 */
	function update()
	{

	}

	/**
	 * say
	 * @param string key.
	 * @return string translation.
	 */
	function say(key, mode)
	{
		var text;

		if (key==="*") {
			return KEYS;
		}
		if (KEYS[key]) {
			text = KEYS[key];
		} else {
			text = "*" + key;
		}
		return text;
	}

	/**
	 * export
	 */
	return {
		key: moduleKEY		
		, say: function(key) {return say(key);}
		, load: function(keys) {return load(keys);}
	}

})();

