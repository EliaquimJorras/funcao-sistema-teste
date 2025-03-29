using System.Text.RegularExpressions;

namespace FI.WebAtividadeEntrevista.Helpers
{
    public static class Utils
    {
        public static string RemoveNaoNumericos(string input)
        {
            return Regex.Replace(input ?? string.Empty, @"[^0-9]", string.Empty);
        }
    }
}