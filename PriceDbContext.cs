using Microsoft.EntityFrameworkCore;
using StockMarket.Models;

namespace StockMarket
{
    public class PriceDbContext : DbContext
    {
        public PriceDbContext(DbContextOptions<PriceDbContext> options) : base(options) { }
        public DbSet<Price> Prices => Set<Price>();
        public DbSet<PriceHistory> PriceHistories => Set<PriceHistory>();
    }
}
