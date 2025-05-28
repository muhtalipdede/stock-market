using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace StockMarket.Hubs
{
    public class PriceHub : Hub
    {
        // Kullanıcı -> Sembol listesi
        private static readonly ConcurrentDictionary<string, HashSet<string>> UserSymbols = new();

        // Kullanıcı bir sembolü takip etmek istediğinde çağrılır
        public Task Subscribe(string symbol)
        {
            var userId = Context.ConnectionId;
            Console.WriteLine($"User {userId} subscribed to {symbol}");
            var set = UserSymbols.GetOrAdd(userId, _ => new HashSet<string>());
            lock (set) { set.Add(symbol); }
            return Task.CompletedTask;
        }

        // Kullanıcı bir sembolü takipten çıkmak istediğinde çağrılır
        public Task Unsubscribe(string symbol)
        {
            var userId = Context.ConnectionId;
            Console.WriteLine($"User {userId} unsubscribed from {symbol}");
            if (UserSymbols.TryGetValue(userId, out var set))
            {
                lock (set) { set.Remove(symbol); }
            }
            return Task.CompletedTask;
        }

        // Bağlantı koparsa temizlik
        public override Task OnDisconnectedAsync(Exception? exception)
        {
            Console.WriteLine($"User {Context.ConnectionId} disconnected");
            UserSymbols.TryRemove(Context.ConnectionId, out _);
            return base.OnDisconnectedAsync(exception);
        }

        // Sunucu tarafından çağrılır: sadece ilgili kullanıcıya fiyat gönder
        public static async Task SendPriceUpdateToSubscribers(IHubContext<PriceHub> hub, string symbol, decimal price)
        {
            foreach (var kvp in UserSymbols.Where(kvp => kvp.Value.Contains(symbol)))
            {
                Console.WriteLine($"Sending price update for {symbol} to user {kvp.Key}: {price}");
                await hub.Clients.Client(kvp.Key).SendAsync("ReceivePriceUpdate", symbol, price);
            }
        }
    }
}
