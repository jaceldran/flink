/*
 * <moduleKEY> 
 */
var Module = (function(){

	/*
	 * global module vars 
	 */
	var moduleKEY = "<MODULE-KEY>";

	/*
	 * run
	 * allow use "method" and "args" if need "runable" actions
	 * i.e. action = <module>::<method>::<args>
	 * @param {string} method
	 * @param {array} args
	 */
	function run(method, args)
	{

	}

	/*
	 * events
	 * @param {string} event
	 * @param {string} element 
	 */
	function on(event, element)
	{
		/*// OPTIONAL
		// load locale files and, when done, register as 
		// menu element and action option in preferences
		if (event==="load") {
			var files = [moduleKEY + ".locale." + Flink.settings.locale.lang];
			Flink.Locale.load(files, function(event) {
				var moduleKEY = "<MODULE-KEY>";
				if (moduleKEY) {
					Flink.Preferences.addAction(moduleKEY);
					Flink.Menu.addElement({key: moduleKEY
						, text: moduleKEY, run: moduleKEY});
				}
			});
		}*/
	}

	/*
	 * export
	 */
	return {
		key: moduleKEY
		, run: function(method, args) {run(method, args);}
		, on: function(event, element) {on(event, element);}
	}

})();

