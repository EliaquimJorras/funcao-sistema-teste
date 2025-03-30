﻿USE [C:\USERS\ELIAQ\SOURCE\REPOS\ELIAQUIMJORRAS\FUNCAO-SISTEMA-TESTE\FI.WEBATIVIDADEENTREVISTA\APP_DATA\BANCODEDADOS.MDF]
GO

CREATE OR ALTER PROC FI_SP_IncBeneficiario
    @NOME          VARCHAR (50),
    @CPF           VARCHAR (11),
	@IDCLIENTE     BIGINT
AS
BEGIN
	INSERT INTO BENEFICIARIOS (NOME, CPF, IDCLIENTE) VALUES (@NOME, @CPF, @IDCLIENTE)

	SELECT SCOPE_IDENTITY()
END