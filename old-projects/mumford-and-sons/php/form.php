

<?php
$para = 'alberpalmaces@gmail.com';
$asunto = 'Mensaje desde la web';
$nombre = $_POST['myname'];
$apellido = $_POST['mysurname'];
$mail = $_POST['myemail'];
$mensaje = $_POST['myText'];

$contenido = "This message was sent by " . $nombre . " " . $apellido . " \r\n";
$contenido .= "Your e-mail is" . $mail . " \r\n";
$contenido .= "your message is: " . $mensaje . " \r\n";
$contenido .= "Thank you for your message!";
mail($para, $asunto, $contenido);
?>