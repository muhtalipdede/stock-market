using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using StockMarket.Models;

namespace StockMarket.Pages.Prices
{
    public class DetailModel : PageModel
    {
        private readonly PriceDbContext _db;
        public Price? Price { get; set; }
        public DetailModel(PriceDbContext db)
        {
            _db = db;
        }
        public IActionResult OnGet(int id)
        {
            Price = _db.Prices.Include(p => p.History).FirstOrDefault(p => p.Id == id);
            if (Price == null)
                return NotFound();
            return Page();
        }
    }
}
