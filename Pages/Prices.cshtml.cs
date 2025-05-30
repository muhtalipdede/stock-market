using Microsoft.AspNetCore.Mvc.RazorPages;
using StockMarket.Models;
using Microsoft.EntityFrameworkCore;

namespace StockMarket.Pages
{
    public class PricesModel : PageModel
    {
        private readonly PriceDbContext _db;
        public List<Price> Prices { get; set; } = new();
        public PricesModel(PriceDbContext db)
        {
            _db = db;
        }
        public void OnGet()
        {
            Prices = _db.Prices.Include(p => p.History).ToList();
        }
    }
}
