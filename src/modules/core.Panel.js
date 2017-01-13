/*
 * Panel
 */
var Module = (function(){

	/*
	 * global module vars 
	 */
	var moduleKEY = "Panel";

	/*
	 * call
	 * allow use "method" and "args" if need "callable" actions
	 * i.e. action = <module>::<method>::<args>
	 * @param {string} method
	 * @param {array} args
	 */
	function call(method, args)
	{

	}

	/*
	 * events
	 * @param {string} event Name or type of event
	 * @param {object} element Usually a clicked element  
	 */
	function on(event, element)
	{
		if (event==="start") { // Flink.start 

			/*// do this to add as a menu option
			Flink.Menu.addElement({
				key: moduleKEY
				, text: moduleKEY
				, call: moduleKEY
			});*/

			/*// do this to add as preferences start option
			Flink.Preferences.addAction(moduleKEY);*/
		}
	}

	/*
	 * export
	 */
	return {
		key: moduleKEY
		, call: function(method, args) {call(method, args);}
		, on: function(event, element) {on(event, element);}
	}

})();

