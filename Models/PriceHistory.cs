namespace StockMarket.Models
{
    public class PriceHistory
    {
        public int Id { get; set; }
        public decimal Value { get; set; }
        public DateTime Timestamp { get; set; }
        public int PriceId { get; set; }
        public virtual Price? Price { get; set; }
    }
}
