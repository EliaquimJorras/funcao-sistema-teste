let BENEFICIARIO_LIST = []

$(document).ready(function () {
    MostrarPopUp();

    // fechar modal
    $(document).on('hidden.bs.modal', '#modalBeneficiarios', function () {
        $('#beneficiario-modal').focus();

        $('.modal-backdrop').remove();
    });

    // excluir beneficiario
    $(document).on("click", ".excluir-button", function (e) {
        e.preventDefault();

        let indexBeneficiario = Number($(this).data("index"));

        if (isNaN(indexBeneficiario) || indexBeneficiario < 0 || indexBeneficiario >= BENEFICIARIO_LIST.length)
            return;

        BENEFICIARIO_LIST.splice(indexBeneficiario, 1);

        localStorage.setItem("beneficiario-list", JSON.stringify(BENEFICIARIO_LIST));

        $("table.table tbody").empty();
        PreencherListaBeneficiarios();
    });
});

function MostrarPopUp() {
    $("#beneficiario-modal").on("click", function (e) {
        e.preventDefault();

        let url = e.currentTarget.baseURI.replace(/(Alterar|Incluir)/, "MostarBeneficiarioPopUp");
        let lastCaracterURI = url.slice(-1)

        let data = {
            "IdCliente": Number.isInteger(lastCaracterURI) ? Number(lastCaracterURI) : 0
        }

        $.ajax({
            url: url,
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
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

        BENEFICIARIO_LIST.push({
            'CPF': cpfBeneficiario,
            'NOME': nomeBeneficiario
        });

        localStorage.setItem("beneficiario-list", JSON.stringify(BENEFICIARIO_LIST));

        AdicionarLinha(cpfBeneficiario, nomeBeneficiario, BENEFICIARIO_LIST.length - 1)

        $("#cpf-modal").val("")
        $("#nome-modal").val("")
    });
}

function ValidarCampos(cpf, nome) {
    let mensagemErro = "";

    if (cpf != "" && nome != "") {
        if (BENEFICIARIO_LIST.find(item => item.CPF === cpf))
            mensagemErro = "O CPF informado já foi cadastrado como beneficiário";
        else if (cpf.length != 14)
            mensagemErro = "O CPF informado está incompleto";
        else
            return false;
    }

    if (cpf == "")
        mensagemErro = "O CPF é obrigatório";

    if (nome == "")
        mensagemErro += "<br> O Nome é obrigatório";

    ModalDialog("Campo(s) Inválido(s)", mensagemErro);

    $('#beneficiario-modal').focus();

    return true;
}

function AdicionarLinha(cpf, nome, index) {
    let novaLinha = `
        <tr>
            <td data-label="CPF">${cpf}</td>
            <td class="nome-cell" data-label="Nome" title="${nome}">${nome}</td>
            <td data-label="Ações" style="justify-content: space-between; display: flex;">
                <button data-index="${index}" class="btn btn-primary">Alterar</button>
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

        if (Array.isArray(parsedList) && parsedList.length > 0) {
            parsedList.forEach((item, index) => {
                AdicionarLinha(item.CPF, item.NOME, index)
            })

            BENEFICIARIO_LIST = parsedList;
        }
    }
}