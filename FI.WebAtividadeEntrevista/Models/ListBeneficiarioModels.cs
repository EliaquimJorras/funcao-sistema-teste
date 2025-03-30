using System.Collections.Generic;

namespace FI.WebAtividadeEntrevista.Models
{
    public class ListBeneficiarioModels
    {
        public long IdCliente { get; set; }

        public List<BeneficiarioModel> BeneficiarioModels { get; set; }
    }
}