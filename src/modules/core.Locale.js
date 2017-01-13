/*
 * Locale 
 */
var Module = (function(){

	var moduleKEY = "Locale", loaded = {}, KEYS = {};


	/*
	 * load
	 */
	function load(keys)
	{
		for (var key in keys) {
			KEYS[key] = keys[key];
		}
	}

	/*
	 *
	 */
	function update()
	{

	}

	/*
	 * load
	 * @param {array|string} paths fullpaths including extension
	 */
	/*function load(paths, callback)
	{
		paths = paths || [];		
		if (typeof paths==="string") {
			paths = [paths];
		}
//console.log("locale.load.START", paths);
		paths.forEach(function(path, index) {
			loaded[path] = false;
			Flink.loadJS({
				path: path
				, data: {path: path}
				, callback: function(event) {
					var target = event.target;
					loaded[target.getAttribute("data-path")] = true;
					for (var key in localeKEYS) {
						KEYS[key] = localeKEYS[key];
					}
//console.log(KEYS);					
					if (typeof callback==="function") callback(event);
				}
			})
		});
	}*/

	/*
	 * say
	 * @param {string} key.
	 * @return {string} translation.
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

	/*
	 * export
	 */
	return {
		key: moduleKEY		
		, say: function(key) {return say(key);}
		, load: function(keys) {return load(keys);}
	}

})();

