-- DROP SCHEMA dbo;

CREATE SCHEMA dbo;
-- contadores.dbo.user_type definition

-- Drop table

-- DROP TABLE contadores.dbo.user_type GO

CREATE TABLE contadores.dbo.user_type (
	id_user_type int IDENTITY(1,1) NOT NULL,
	nombre varchar(25) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	activo tinyint NOT NULL,
	CONSTRAINT user_type_pk PRIMARY KEY (id_user_type)
) GO;


-- contadores.dbo.users definition

-- Drop table

-- DROP TABLE contadores.dbo.users GO

CREATE TABLE contadores.dbo.users (
	id_user int IDENTITY(1,1) NOT NULL,
	usuario varchar(25) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	pass varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	activo tinyint NOT NULL,
	nombre varchar(25) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	apellidos varchar(25) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	id_user_type int NOT NULL,
	CONSTRAINT users_pk PRIMARY KEY (id_user),
	CONSTRAINT users_user_type FOREIGN KEY (id_user_type) REFERENCES contadores.dbo.user_type(id_user_type)
) GO;


-- contadores.dbo.files definition

-- Drop table

-- DROP TABLE contadores.dbo.files GO

CREATE TABLE contadores.dbo.files (
	id_file int IDENTITY(1,1) NOT NULL,
	[path] varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	nombre varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	fecha date NOT NULL,
	maquina varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	n_serie varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	id_user int NOT NULL,
	CONSTRAINT files_pk PRIMARY KEY (id_file),
	CONSTRAINT file_users FOREIGN KEY (id_user) REFERENCES contadores.dbo.users(id_user)
) GO;
