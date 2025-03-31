﻿let BENEFICIARIO_LIST = []
let ALTER_BENF_INDEX = null
let ALTER_ORIGINAL_OBJ = null

$(document).ready(function () {
    MostrarPopUp();

    // fechar modal
    $(document).on('hidden.bs.modal', '#modalBeneficiarios', function () {
        $('#beneficiario-modal').focus();
        $('.modal-backdrop').remove();
    });

    // incluir/alterar beneficiario no javascript
    $(document).on("click", "#incluir-button", function (e) {
        e.preventDefault();

        let cpfBeneficiario = $("#cpf-modal").val()
        let nomeBeneficiario = $("#nome-modal").val()

        if (ValidarCampos(cpfBeneficiario, nomeBeneficiario))
            return;

        let fluxoAlterar = this.baseURI.includes("Alterar");

        if (ALTER_BENF_INDEX === null) {
            let novoBeneficiario = {
                'Id': 0,
                'CPF': cpfBeneficiario,
                'Nome': nomeBeneficiario,
                'IdCliente': fluxoAlterar ? Number(this.baseURI.slice(-1)) : 0
            }

            BENEFICIARIO_LIST.push(novoBeneficiario);

            if (fluxoAlterar)
                ProcessarBeneficiario(BENEFICIARIO_LIST[BENEFICIARIO_LIST.length - 1])
        } else {
            const parsedList = JSON.parse(localStorage.getItem("beneficiario-list"))

            BENEFICIARIO_LIST[ALTER_BENF_INDEX] = {
                'Id': parsedList[ALTER_BENF_INDEX].Id,
                'CPF': cpfBeneficiario,
                'Nome': nomeBeneficiario,
                'IdCliente': parsedList[ALTER_BENF_INDEX].IdCliente,
            };

            if (fluxoAlterar)
                ProcessarBeneficiario(BENEFICIARIO_LIST[ALTER_BENF_INDEX])
        }

        localStorage.setItem("beneficiario-list", JSON.stringify(BENEFICIARIO_LIST));

        PreencherListaBeneficiarios();
        ResetarCamposModal();
        ResetarVariaveisEdicao();
    });

    // preparar para alterar beneficiario no javascript
    $(document).on("click", ".alterar-button", function (e) {
        e.preventDefault();

        ALTER_BENF_INDEX = Number($(this).data("index"));

        let beneficiario = BENEFICIARIO_LIST[ALTER_BENF_INDEX];

        $("#cpf-modal").val(formatarCPF(beneficiario.CPF))
        $("#nome-modal").val(beneficiario.Nome)

        ALTER_ORIGINAL_OBJ = {
            'Id': beneficiario.Id,
            'CPF': beneficiario.CPF,
            'Nome': beneficiario.Nome,
            'IdCliente': beneficiario.IdCliente,
        }
    });

    // excluir beneficiario no javascript
    $(document).on("click", ".excluir-button", function (e) {
        e.preventDefault();

        const confirmacao = confirm("Tem certeza de que deseja excluir este beneficiário? Este processo é irreversível.");

        if (!confirmacao)
            return;

        let indexBeneficiario = Number($(this).data("index"));

        if (isNaN(indexBeneficiario) || indexBeneficiario < 0 || indexBeneficiario >= BENEFICIARIO_LIST.length)
            return;

        let beneficiario = BENEFICIARIO_LIST[indexBeneficiario];

        BENEFICIARIO_LIST.splice(indexBeneficiario, 1);

        localStorage.setItem("beneficiario-list", JSON.stringify(BENEFICIARIO_LIST));

        PreencherListaBeneficiarios();
        ResetarCamposModal();
        ResetarVariaveisEdicao();

        ExcluirBeneficiarioBanco(beneficiario.Id, beneficiario.IdCliente);
    });

    // resetar lista beneficiario no javascript
    $(document).on("click", "#beneficiario-modal", function (e) {
        e.preventDefault();

        const parsedList = JSON.parse(localStorage.getItem("beneficiario-list"))

        if (Array.isArray(parsedList) && parsedList.length > 0)
            BENEFICIARIO_LIST = parsedList;
        else
            BENEFICIARIO_LIST = []
    });

});

function MostrarPopUp() {
    $("#beneficiario-modal").on("click", function (e) {
        e.preventDefault();

        let url = e.currentTarget.baseURI.replace(/(Alterar|Incluir)/, "MostarBeneficiarioPopUp");

        $.ajax({
            url: url,
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({}),
            success: function (response) {
                if (response.Status === undefined) {
                    $('#modal-container').html(response);
                    $('#modalBeneficiarios').modal('show');
                    $('#cpf-modal').mask('000.000.000-00');

                    PreencherListaBeneficiarios();

                } else {
                    console.error('Erro na resposta:', response);
                }
            }
        });
    });
}

function ProcessarBeneficiario(beneficiario) {
    $.ajax({
        url: `/Cliente/ProcessarBeneficiario`,
        type: 'POST',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(beneficiario),
        success: function (response) {
            if (response.Result === "OK") {
                ModalDialog(`Beneficiário Criado/Atualiazado`, response.Message);

                localStorage.setItem("beneficiario-list", JSON.stringify(response.BeneficiarioModels));
            }
            else
                ModalDialog(`Erro ao Criado/Atualiazado Beneficiário`, response.Message);
        }
    });
}

function ExcluirBeneficiarioBanco(beneficiarioId, idCliente) {
    $.ajax({
        url: `/Cliente/ExcluirBeneficiario`,
        type: 'POST',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({ "Id": beneficiarioId, "IdCliente": idCliente }),
        success: function (response) {
            if (response.Result === "OK") {
                ModalDialog("Beneficiário Excluído", response.Message);

                if (response.BeneficiarioModels)
                    localStorage.setItem("beneficiario-list", JSON.stringify(response.BeneficiarioModels));
            }
            else
                ModalDialog("Erro ao Excluir Beneficiário", response.Message);
        }
    });
}

function ValidarCampos(cpf, nome) {
    let mensagemErro = "";

    if (cpf && nome) {
        const beneficiarioExistente = BENEFICIARIO_LIST.find(item => item.CPF === cpf);

        if (beneficiarioExistente) {
            const salvandoAlteracao = ALTER_BENF_INDEX !== null && ALTER_ORIGINAL_OBJ !== null;

            if (salvandoAlteracao) {
                const foiAlteradoCPF = cpf !== ALTER_ORIGINAL_OBJ.CPF;
                const foiAlteradoNome = nome !== ALTER_ORIGINAL_OBJ.Nome;

                if (foiAlteradoCPF)
                    mensagemErro = "O CPF informado já foi cadastrado como beneficiário";

                else if (!foiAlteradoNome && !foiAlteradoCPF) {
                    mensagemErro = "Beneficiário com os dados informados já está cadastrado";
                    ResetarCamposModal();
                    ResetarVariaveisEdicao();
                }

                else if (foiAlteradoNome && !foiAlteradoCPF)
                    return false;

            } else
                mensagemErro = "O CPF informado já foi cadastrado como beneficiário";
        }
        else if (cpf.length !== 14)
            mensagemErro = "O CPF informado está incompleto";
        else
            return false;
    }

    if (!cpf)
        mensagemErro = "O CPF é obrigatório";

    if (!nome)
        mensagemErro += "<br> O Nome é obrigatório";

    ModalDialog("Campo(s) Inválido(s)", mensagemErro);

    $('#beneficiario-modal').focus();

    return true;

}

function AdicionarLinha(beneficiario, index) {
    let novaLinha = `
        <tr>
            <input type="hidden" id="id-benef" name="id-benef" value="${beneficiario.Id}">
            <input type="hidden" id="id-client" name="id-client" value="${beneficiario.IdCliente}">
            <td data-label="CPF">${formatarCPF(beneficiario.CPF)}</td>
            <td class="nome-cell" data-label="Nome" title="${beneficiario.Nome}">${beneficiario.Nome}</td>
            <td data-label="Ações" style="justify-content: space-between; display: flex;">
                <button data-index="${index}" class="btn btn-primary alterar-button">Alterar</button>
                <button data-index="${index}" class="btn btn-primary excluir-button">Excluir</button>
            </td>
        </tr>
    `;

    const $table = $("table.table");
    const $tbody = $table.find("tbody");

    $tbody.append(novaLinha);

    if ($table.hasClass("hidden"))
        $table.removeClass("hidden");
}

function PreencherListaBeneficiarios() {
    let beneficiarioList = localStorage.getItem("beneficiario-list")

    if (beneficiarioList) {
        const parsedList = JSON.parse(beneficiarioList)

        $("table.table tbody").empty();
        $("table.table").addClass("hidden");

        if (Array.isArray(parsedList) && parsedList.length > 0) {
            parsedList.forEach((item, index) => {
                AdicionarLinha(item, index)
            })

            BENEFICIARIO_LIST = parsedList;
        }
    }
}

function ResetarCamposModal() {
    $("#cpf-modal").val("");
    $("#nome-modal").val("");
}

function ResetarVariaveisEdicao() {
    ALTER_BENF_INDEX = null;
    ALTER_ORIGINAL_OBJ = null;
}
