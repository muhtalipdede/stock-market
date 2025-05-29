using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StockMarket.Hubs;
using StockMarket.Models;

namespace StockMarket
{
    public class PriceGenerator
    {
        private readonly IHubContext<PriceHub> _hubContext;
        private readonly Timer _timer;
        private readonly Random _random = new();
        private readonly List<string> _symbols = new() { "USD/TRY", "BTC/USDT", "ETH/USDT", "XRP/USDT", "BIST100" };
        private readonly IServiceScopeFactory _scopeFactory;

        public PriceGenerator(IHubContext<PriceHub> hubContext, IServiceScopeFactory scopeFactory)
        {
            _hubContext = hubContext;
            _scopeFactory = scopeFactory;
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<PriceDbContext>();
            foreach (var symbol in _symbols)
            {
                var price = new Price { Symbol = symbol, LastUpdated = DateTime.Now };
                price.History.Add(new PriceHistory { Value = _random.Next(100, 1000), Timestamp = DateTime.Now });
                db.Prices.Add(price);
            }
            db.SaveChanges();
            _timer = new Timer(UpdatePrices, null, 0, 2000);
        }

        private void UpdatePrices(object? state)
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<PriceDbContext>();
            foreach (var symbol in _symbols)
            {
                var priceEntity = db.Prices.Include(p => p.History).FirstOrDefault(p => p.Symbol == symbol);
                if (priceEntity != null)
                {
                    var lastValue = priceEntity.History.LastOrDefault()?.Value ?? _random.Next(100, 1000);
                    var change = (decimal)(_random.NextDouble() - 0.5) * 10;
                    var newValue = lastValue + change;
                    var history = new PriceHistory
                    {
                        Value = newValue,
                        Timestamp = DateTime.Now,
                        Price = priceEntity
                    };
                    priceEntity.History.Add(history);
                    priceEntity.LastUpdated = DateTime.Now;
                    db.SaveChanges();
                    _ = PriceHub.SendPriceUpdateToSubscribers(_hubContext, symbol, Math.Round(newValue, 2));
                }
            }
        }
    }
}
