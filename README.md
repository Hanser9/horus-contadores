# horus-contadores

Esta codigo es la pagina web de horus contadores, esta pagina extrae datos de contadores, ya sea como impresiones, copias, etc, de equipos multifionconales de la compañia SHARP.

Este sistema solo funciona con logs en ingles britanico, ingles norte americano y español.

No se da indicaciones de como extraer el log de un equipo de copiado por temas legales, esta investigacion esta al alcance en google.

Se deja la muestra de un log dentro de la carpeta public/upload/

Para correr esta aplicacion es necesario contar con redis instalado y corriendo, sql server con una db "contadores", la creacion de tablas la pueden encontar en /documentacion/valkiria_create.sql

Esta version esta cortada en comunicacion a la base de datos por derechos de autor, ustedes pueden agregar su conexion en cada model dentro de /server/models/

Para correr esta aplicacion:

1. npm run build-js
2. npm start

Horus®
