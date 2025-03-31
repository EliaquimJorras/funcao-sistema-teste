let BENEFICIARIO_LIST = []
let ALTER_BENF_INDEX = null
let ALTER_ORIGINAL_OBJ = null

$(document).ready(function () {
    MostrarPopUp();

    // fechar modal
    $(document).on('hidden.bs.modal', '#modalBeneficiarios', function () {
        $('#beneficiario-modal').focus();
        $('.modal-backdrop').remove();
    });

    // alterar beneficiario
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

    // excluir beneficiario
    $(document).on("click", ".excluir-button", function (e) {
        e.preventDefault();

        let indexBeneficiario = Number($(this).data("index"));

        if (isNaN(indexBeneficiario) || indexBeneficiario < 0 || indexBeneficiario >= BENEFICIARIO_LIST.length)
            return;

        let beneficiarioId = BENEFICIARIO_LIST[indexBeneficiario].Id;

        BENEFICIARIO_LIST.splice(indexBeneficiario, 1);

        localStorage.setItem("beneficiario-list", JSON.stringify(BENEFICIARIO_LIST));

        PreencherListaBeneficiarios();
        ResetarCamposModal();
        ResetarVariaveisEdicao();

        $.ajax({
            url: `/Cliente/ExcluirBeneficiario/${beneficiarioId}`,
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            success: function (response) {}
        });
    });
});

function MostrarPopUp() {
    $("#beneficiario-modal").on("click", function (e) {
        e.preventDefault();

        let url = e.currentTarget.baseURI.replace(/(Alterar|Incluir)/, "MostarBeneficiarioPopUp");
        let lastCaracterURI = url.slice(-1)

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
                    IncluirBeneficiario();
                } else {
                    console.error('Erro na resposta:', response);
                }
            }
        });
    });
}

function IncluirBeneficiario() {
    $("#incluir-button").on("click", function (e) {
        e.preventDefault();

        let cpfBeneficiario = $("#cpf-modal").val()
        let nomeBeneficiario = $("#nome-modal").val()

        if (ValidarCampos(cpfBeneficiario, nomeBeneficiario))
            return;

        if (ALTER_BENF_INDEX === null) {
            BENEFICIARIO_LIST.push({
                'CPF': cpfBeneficiario,
                'Nome': nomeBeneficiario
            });
        } else {
            const parsedList = JSON.parse(localStorage.getItem("beneficiario-list"))

            BENEFICIARIO_LIST[ALTER_BENF_INDEX] = {
                'Id': parsedList[ALTER_BENF_INDEX].Id,
                'CPF': cpfBeneficiario,
                'Nome': nomeBeneficiario,
                'IdCliente': parsedList[ALTER_BENF_INDEX].IdCliente,
            };
        }

        localStorage.setItem("beneficiario-list", JSON.stringify(BENEFICIARIO_LIST));

        PreencherListaBeneficiarios();
        ResetarCamposModal();
        ResetarVariaveisEdicao();
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
