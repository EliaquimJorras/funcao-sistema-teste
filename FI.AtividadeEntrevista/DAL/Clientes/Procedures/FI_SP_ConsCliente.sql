﻿USE [C:\USERS\ELIAQ\SOURCE\REPOS\ELIAQUIMJORRAS\FUNCAO-SISTEMA-TESTE\FI.WEBATIVIDADEENTREVISTA\APP_DATA\BANCODEDADOS.MDF]
GO

CREATE OR ALTER PROC FI_SP_ConsCliente
	@ID BIGINT
AS
BEGIN
	IF(ISNULL(@ID, 0) = 0)
		SELECT NOME, SOBRENOME, NACIONALIDADE, CEP, ESTADO, CIDADE, LOGRADOURO, EMAIL, TELEFONE, ID, CPF FROM CLIENTES WITH(NOLOCK)
	ELSE
		SELECT NOME, SOBRENOME, NACIONALIDADE, CEP, ESTADO, CIDADE, LOGRADOURO, EMAIL, TELEFONE, ID, CPF FROM CLIENTES WITH(NOLOCK) WHERE ID = @ID
END