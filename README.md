# Finansal Takip Uygulaması (.NET 9 + SignalR)

Bu uygulama, .NET 9 ve SignalR ile hisse senedi, döviz ve kripto para fiyatlarını gerçek zamanlı izleyebileceğiniz, kullanıcıya özel fiyat takibi ve bildirimler sunan bir web uygulamasıdır.

## Özellikler

- Gerçek zamanlı fiyat güncellemeleri (SignalR)
- Kullanıcıya özel sembol takibi (abone ol/abonelikten çık)

## Kurulum

1. .NET 9 SDK kurulu olmalı.
2. Terminalde proje klasöründe:

   ```sh
   dotnet restore
   dotnet run
   ```

3. Tarayıcıda `https://localhost:5001` adresine gidin.

## Temel Dosya ve Klasörler

- `Hubs/PriceHub.cs` — Kullanıcıya özel fiyat güncellemeleri için SignalR hub
- `PriceGenerator.cs` — Rastgele fiyat üreten arka plan servisi
- `Pages/Index.cshtml` — Ana arayüz (Razor Page)
- `wwwroot/price-client.js` — Fiyat güncellemeleri ve abone işlemleri için istemci kodu

## PriceHub (SignalR Hub) Detayı

- Kullanıcılar, istedikleri sembole abone olabilir veya abonelikten çıkabilir.
- Her kullanıcı sadece abone olduğu sembollerin fiyat güncellemelerini alır.
- Bağlantı koparsa ilgili kullanıcının sembol listesi temizlenir.
- Sunucu, sadece ilgili sembolü takip eden kullanıcılara fiyat gönderir.

### Temel Metotlar

- `Subscribe(string symbol)` — Sembol takibi başlatır.
- `Unsubscribe(string symbol)` — Sembol takibini bırakır.
- `SendPriceUpdateToSubscribers(...)` — Sadece ilgili kullanıcılara fiyat güncellemesi gönderir.

## Kullanım

- Ana sayfada tüm semboller kart olarak listelenir.
- Her kartta "Abone Ol" ve "Abonelikten Çık" butonları bulunur.
- Abone olunan sembollerin fiyatı anlık olarak güncellenir.

## Genişletilebilirlik

- Favori yönetimi, bildirim hub'ı, canlı sohbet gibi ek SignalR hub'ları kolayca eklenebilir.
- Kimlik doğrulama ve yetkilendirme ile güvenlik artırılabilir.

## Lisans

Açık kaynak, dilediğiniz gibi geliştirebilir ve kullanabilirsiniz.
