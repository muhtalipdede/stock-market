window.addEventListener('DOMContentLoaded', () => {
    const connection = new signalR.HubConnectionBuilder()
        .withUrl('/priceHub')
        .build();

    const previousPrices = {};
    const followedSymbols = new Set();
    const lowerLimits = {}; // { symbol: alt limit }
    const upperLimits = {}; // { symbol: üst limit }

    // Toast mesajı için basit fonksiyon
    function showToast(message) {
        let toast = document.getElementById('toast-message');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-message';
            toast.style.position = 'fixed';
            toast.style.bottom = '30px';
            toast.style.right = '30px';
            toast.style.background = '#333';
            toast.style.color = '#fff';
            toast.style.padding = '16px 24px';
            toast.style.borderRadius = '8px';
            toast.style.zIndex = 9999;
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 3500);
    }

    // Alt ve üst limit butonlarını render et
    function renderLimitButtons(symbol) {
        const container = document.createElement('div');
        container.className = 'd-flex gap-2';
        // Alt limit butonu
        const lowerBtn = document.createElement('button');
        lowerBtn.className = 'btn btn-sm btn-outline-primary';
        lowerBtn.textContent = lowerLimits[symbol] !== undefined ? `Alt Limit ✓ (${lowerLimits[symbol]})` : 'Alt Limit';
        lowerBtn.onclick = () => {
            if (lowerLimits[symbol] !== undefined) {
                delete lowerLimits[symbol];
                lowerBtn.textContent = 'Alt Limit';
            } else {
                const limit = prompt('Alt fiyat limiti girin (örn: 500):');
                if (limit && !isNaN(Number(limit))) {
                    lowerLimits[symbol] = Number(limit);
                    lowerBtn.textContent = `Alt Limit ✓ (${lowerLimits[symbol]})`;
                }
            }
        };
        // Üst limit butonu
        const upperBtn = document.createElement('button');
        upperBtn.className = 'btn btn-sm btn-outline-danger';
        upperBtn.textContent = upperLimits[symbol] !== undefined ? `Üst Limit ✓ (${upperLimits[symbol]})` : 'Üst Limit';
        upperBtn.onclick = () => {
            if (upperLimits[symbol] !== undefined) {
                delete upperLimits[symbol];
                upperBtn.textContent = 'Üst Limit';
            } else {
                const limit = prompt('Üst fiyat limiti girin (örn: 900):');
                if (limit && !isNaN(Number(limit))) {
                    upperLimits[symbol] = Number(limit);
                    upperBtn.textContent = `Üst Limit ✓ (${upperLimits[symbol]})`;
                }
            }
        };
        container.appendChild(lowerBtn);
        container.appendChild(upperBtn);
        return container;
    }

    const defaultSymbols = ["USD/TRY", "BTC/USDT", "ETH/USDT", "XRP/USDT", "BIST100"];
    connection.start().then(() => {
        defaultSymbols.forEach(symbol => {
            connection.invoke('Subscribe', symbol);
            followedSymbols.add(symbol);
        });
    });

    connection.on('ReceivePriceUpdate', (symbol, price) => {
        if (!followedSymbols.has(symbol)) return;
        const cards = document.getElementById('price-cards');
        let card = document.getElementById('card-' + symbol);
        const prev = previousPrices[symbol];
        previousPrices[symbol] = price;
        let percent = '';
        let diff = '';
        if (prev !== undefined && prev !== 0) {
            const change = price - prev;
            percent = ((change / prev) * 100).toFixed(2);
            diff = (change >= 0 ? '+' : '') + change.toFixed(2);
        }
        if (!card) {
            card = document.createElement('div');
            card.className = 'col-12 col-md-4';
            card.id = 'card-' + symbol;
            card.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title d-flex align-items-center" id="title-${symbol}">${symbol}</h5>
                        <p class="card-text mb-1">Fiyat: <span id="price-${symbol}">${price}</span></p>
                        <p class="card-text mb-1">Önceki: <span id="prev-${symbol}">${prev ?? '-'}</span></p>
                        <p class="card-text">Değişim: <span id="diff-${symbol}">${diff}</span> <span id="percent-${symbol}">${percent ? '(' + percent + '%)' : ''}</span></p>
                        <div id="limit-btn-container-${symbol}"></div>
                    </div>
                </div>
            `;
            cards.appendChild(card);
            // Limit butonlarını ekle
            document.getElementById(`limit-btn-container-${symbol}`).appendChild(renderLimitButtons(symbol));
        } else {
            document.getElementById('price-' + symbol).textContent = price;
            document.getElementById('prev-' + symbol).textContent = prev ?? '-';
            document.getElementById('diff-' + symbol).textContent = diff;
            document.getElementById('percent-' + symbol).textContent = percent ? '(' + percent + '%)' : '';
        }
        // Limit butonlarını güncelle
        const limitBtnContainer = document.getElementById(`limit-btn-container-${symbol}`);
        if (limitBtnContainer && limitBtnContainer.childElementCount === 0) {
            limitBtnContainer.appendChild(renderLimitButtons(symbol));
        }
        // Alt ve üst limit kontrolü
        if (lowerLimits[symbol] !== undefined && price < lowerLimits[symbol]) {
            showToast(`${symbol} fiyatı alt limitin altına düştü! (${price} < ${lowerLimits[symbol]})`);
        }
        if (upperLimits[symbol] !== undefined && price > upperLimits[symbol]) {
            showToast(`${symbol} fiyatı üst limiti aştı! (${price} > ${upperLimits[symbol]})`);
        }
        // Basit bildirim
        if (window.Notification && Notification.permission === 'granted') {
            new Notification(`${symbol} fiyatı güncellendi: ${price}`);
        }
    });

    if (window.Notification && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
});
