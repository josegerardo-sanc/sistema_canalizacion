<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:m="http://schemas.microsoft.com/office/2004/12/omml">

<head>
    <meta http-equiv="Content-Language" content="es">
    <meta http-equiv="Content-Type" content="text/html; charset=windows-1252">
    <title>recovery password</title>
</head>

<body>
    <table>
        <tbody>
            <tr>
                <center>
                    <h3>
                        <strong>Hola! {{ $user['name'] }}</strong>
                    </h3>
                    <strong>Escuchamos que perdió su contrase&ntilde;a . ¡Lo siento por eso &#33;</strong>
                    <br>
                    Te enviamos una nueva que funciona para que puedas entrar a tu cuenta.
                </center>
            </tr>
            <tr>
                <th>
                    <strong>Nueva contrase&ntilde;a: </strong>
                    {{ $user['newPassword'] }}
                </th>
            </tr>
            <tr>
                Te recomendamos que cambies esta contrase&ntilde;a por una que recuerdes fácilmente.
            </tr>
        </tbody>
    </table>
</body>

</html>
