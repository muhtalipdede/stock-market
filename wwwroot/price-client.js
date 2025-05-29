window.addEventListener('DOMContentLoaded', () => {
    const connection = new signalR.HubConnectionBuilder()
        .withUrl('/priceHub')
        .build();

    const previousPrices = {};
    const followedSymbols = new Set();

    function subscribeToSymbol(symbol) {
        if (!followedSymbols.has(symbol)) {
            connection.invoke('Subscribe', symbol);
            followedSymbols.add(symbol);
        }
    }

    function unsubscribeFromSymbol(symbol) {
        if (followedSymbols.has(symbol)) {
            connection.invoke('Unsubscribe', symbol);
            followedSymbols.delete(symbol);
        }
    }

    function updatePrice(symbol, price) {
        const priceElement = document.getElementById(`price-${symbol}`);
        if (priceElement) {
            priceElement.textContent = `Fiyat: ${price}`;
        } else {
            const newPriceElement = document.createElement('div');
            newPriceElement.id = `price-${symbol}`;
            newPriceElement.textContent = `Fiyat: ${price}`;
            document.getElementById('prices').appendChild(newPriceElement);
        }
    }

    const defaultSymbols = ["USD/TRY", "BTC/USDT", "ETH/USDT", "XRP/USDT", "BIST100"];
    // ekrana semolleri card içerisine ekle
    const symbolContainer = document.getElementById('symbol-container');
    defaultSymbols.forEach(symbol => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${symbol}</h5>
                <p id="price-${symbol}" class="card-text">Fiyat: Bekleniyor...</p>
                <button class="btn btn-primary" onclick="subscribeToSymbol('${symbol}')">Abone Ol</button>
                <button class="btn btn-secondary" onclick="unsubscribeFromSymbol('${symbol}')">Abonelikten Çık</button>
            </div>
        `;
        symbolContainer.appendChild(card);
    });

    connection.start().then(() => {
        console.log('PriceHub bağlantısı kuruldu');
    });

    connection.on('ReceivePriceUpdate', (symbol, price) => {
        updatePrice(symbol, price);
        if (previousPrices[symbol] !== price) {
            previousPrices[symbol] = price;
            console.log(`Fiyat güncellendi: ${symbol} - ${price}`);
        }
    });

    // Fonksiyonları global scope'a ekle
    window.subscribeToSymbol = subscribeToSymbol;
    window.unsubscribeFromSymbol = unsubscribeFromSymbol;
    window.updatePrice = updatePrice;
});
