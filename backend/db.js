const mysql = require("mysql2");


// Configuración de la conexión a Mysql

const conexion = mysql.createConnection({
    host: "localhost",  // Servidor local
    user: "root",       // Usuario de MSQL (por defecto en xamp)
    database: "tienda"  // Nombre de nuestra Base de datos
});


// Comprobar si la conexión fue exitosa

conexion.connect((error) => {
    if (error){
        console.error("Error al conectar con MySQL:", error);
        return;
    }
    console.log("Conexión exitosa con MYSQll");
});

// exportar la conexion para reutilizarla en las rutas del servidor

module.exports = conexion;
