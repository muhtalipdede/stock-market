namespace StockMarket.Models
{
    public class Price
    {
        public int Id { get; set; }
        public string Symbol { get; set; } = string.Empty;
        public DateTime LastUpdated { get; set; }
        public virtual List<PriceHistory> History { get; set; } = new();
    }
}
