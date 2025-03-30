using FI.WebAtividadeEntrevista.Helpers;
using FI.WebAtividadeEntrevista.Validators;
using System.ComponentModel.DataAnnotations;

namespace FI.WebAtividadeEntrevista.Models
{
    public class BeneficiarioModel
    {
        public long Id { get; set; }

        [Required]
        public string Nome { get; set; }

        private string _cpf;

        [Required]
        [CPFValidator(ErrorMessage = "O CPF informado � inv�lido")]
        public string CPF
        {
            get => _cpf;
            set => _cpf = Utils.RemoveNaoNumericos(value);
        }

        public long IdCliente { get; set; }
    }
}