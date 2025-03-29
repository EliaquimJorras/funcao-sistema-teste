function formatarCPF(cpf) {
    // Remove caracteres n�o num�ricos
    cpf = cpf.replace(/\D/g, '');

    // Aplica a m�scara no CPF (###.###.###-##)
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}