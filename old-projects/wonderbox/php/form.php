

<?php
$pagina = "../gracias.html";
Header("Location: $pagina");
?>
<?php
$para = 'alberpalmaces@gmail.com';
$asunto = 'Mensaje desde la web';
$nombre = $_POST['myname'];
$apellido = $_POST['mysurname'];
$mail = $_POST['myemail'];

$contenido = "Este mensaje fue enviado por " . $nombre . " " . $apellido . " \r\n";
$contenido .= "Su e-mail es: " . $mail . " \r\n";
mail($para, $asunto, $contenido);
?>