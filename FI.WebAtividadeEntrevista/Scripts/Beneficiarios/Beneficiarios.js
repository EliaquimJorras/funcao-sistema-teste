$(document).ready(function () {
    $("#beneficiario-modal").on("click", function (e) {
        e.preventDefault();

        let url = e.currentTarget.baseURI.replace(/(Alterar|Incluir)/, "MostarBeneficiarioPopUp");

        $.ajax({
            url: url,
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            data: null,
            success: function (response) {
                if (response.Status === undefined) {
                    $('#modal-container').html(response);
                    $('#modalBeneficiarios').modal('show');
                    $('#cpf').mask('000.000.000-00');
                } else {
                    console.error('Erro na resposta:', response);
                }
            }
        });
    });

    $(document).on('hidden.bs.modal', '#modalBeneficiarios', function () {
        $('#beneficiario-modal').focus();

        $('.modal-backdrop').remove();
    });
});