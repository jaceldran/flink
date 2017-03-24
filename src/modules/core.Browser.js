/**
 * Browser 
 */
var Module = (function(){

	var moduleKEY = "Browser", iframe, status;

	/**
	 * call
	 * @param string method
	 * @param array args
	 */
	function call(method, args)
	{	
		switch(method) {
			case "load":
				load(args.join(""));
				break;
		}
	}


	/**
	 * listener function
	 */
	function onload()
	{
		status.style.display = "none";
	}

	/**
	 * load
	 * if from server,  remote resources require CORS header ??? 
	 * @param string url
	 */
	function load(url)
	{
		Flink.Frame.breadCrumb({url: {text: url}});		
		var main = Flink.Frame.node("main");
		main.innerHTML = "";
		iframe = document.createElement("iframe");
		status = document.createElement("div");
		status.className = "splash";
		status.style.whiteSpace = "nowrap";
		status.innerHTML = "((( " + url + " )))";
		main.appendChild(status);
		main.appendChild(iframe);		
		iframe.removeEventListener("load", onload);
		iframe.addEventListener("load", onload);
		iframe.src = url;
	}

	/**
	 * export
	 */
	return {
		key: moduleKEY
		, call: function(method, args) {call(method, args);}		
		, load: function(url) {load(url);}
	}

})();

