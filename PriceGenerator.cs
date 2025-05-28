using Microsoft.AspNetCore.SignalR;
using StockMarket.Hubs;

namespace StockMarket
{
    public class PriceGenerator
    {
        private readonly IHubContext<PriceHub> _hubContext;
        private readonly Timer _timer;
        private readonly Random _random = new();
        private readonly List<string> _symbols = new() { "USD/TRY", "BTC/USDT", "ETH/USDT", "XRP/USDT", "BIST100" };
        private readonly Dictionary<string, decimal> _prices = new();

        public PriceGenerator(IHubContext<PriceHub> hubContext)
        {
            _hubContext = hubContext;
            foreach (var symbol in _symbols)
                _prices[symbol] = _random.Next(100, 1000);
            _timer = new Timer(UpdatePrices, null, 0, 2000);
        }

        private void UpdatePrices(object? state)
        {
            foreach (var symbol in _symbols)
            {
                var change = (decimal)(_random.NextDouble() - 0.5) * 10;
                _prices[symbol] += change;
                // Kullanıcıya özel bildirim
                _ = PriceHub.SendPriceUpdateToSubscribers(_hubContext, symbol, Math.Round(_prices[symbol], 2));
            }
        }
    }
}
