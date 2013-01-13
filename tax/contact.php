<?php 

require_once './lib/Twig/Autoloader.php';
Twig_Autoloader::register();

$loader = new Twig_Loader_Filesystem('./templates');
$twig = new Twig_Environment($loader, array(
//   'cache' => './compilation_cache',
));

echo $twig->render('contact.html');

?>
