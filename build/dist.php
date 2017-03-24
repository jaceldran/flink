<?php header('content-type:text/plain;charset=utf-8');

/**
 * src => dist paths
 */

$src = '../src';
$dist = '../dist';
$response = ['content'=>'', 'copy'=>[]];

/**
 * core modules
 */
$path = "$src/modules"; // './modules';
$modules = array_diff(scandir($path), array('.','..'));
foreach($modules as $file) {
	if (  strtolower( substr($file,0,5) ) ==='core.') {
		$files[] = "$path/$file";
	}
}

/**
 * contenido de Flink.js
 * la variable SETTINGS se incrusta dentro de Flink.js
 */ 
$SETTINGS = file_get_contents( "$src/Flink.Settings.js"); 
$content = file_get_contents("$src/Flink.js");
$content = str_replace('var settings;',$SETTINGS, $content);
foreach($files as $file) {
	$content .= "\n\n/** [{$file}] **/\n\n";
	$content .= file_get_contents($file);
	$content .= "	
Flink[Module.key] = Module;
";
}

$now = date('d/m/y H:i:s');
$content = "

/*
 * -----------------------------------------------------------------------------
 * Flink [beta]
 * Build: $now
 * -----------------------------------------------------------------------------
 *                    _)                    |               
 *  __|   _ \   __ \   |  __ `__ \    _` |  __|   _ \   __| 
 * \__ \  (   |  |   |  |  |   |   |  (   |  |     __/  (    
 * ____/ \___/  _|  _| _| _|  _|  _| \__,_| \__| \___| \___| 
 *
 * wanna know more? -> http://cdn.zentric.es/demo/flink 
 * contact          -> jaceldran@gmail.com 
 * -----------------------------------------------------------------------------
 */

$content

";

if (file_put_contents("$dist/Flink.js", $content)) {	
	$response['content'] =  $content;
}

/**
 * copy target dist
 */
$move = ['css', 'templates', 'modules', 'locale'];
foreach ($move as $dir) {

	$files = array_diff(scandir("$src/$dir"), ['.','..']);

	foreach($files as $file) {

		$info = pathinfo($file);

		// omit sass work files 
		if ($info['extension'] === 'map' ) {
			continue;
		}

		// omit core modules (but let locales, same as css files)		
		if ( $dir === 'modules'
			&& $info['extension'] === 'js' 
			&& substr($file,0,5)==='core.') {
			continue;
		}		

		// copy source => target;
		$done = 0;
		$source = "$src/$dir/$file";
		$target = "$dist/$dir/$file";
		$done = copy($source, $target);
		$response['copy'][] = [
			'source' => $source
			, 'target' => $target
			, 'done' => $done
		]; 
		//"[COPY] $source => $target ($done)\n";
	}	
}

//$response['server'] = $_SERVER;

echo json_encode($response, JSON_PRETTY_PRINT);
