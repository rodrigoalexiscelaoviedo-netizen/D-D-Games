import { useState } from 'react';
import type { MarketplaceListing, ItemRarity } from '../../lib/marketplace';
import { searchMarketplace, filterByRarity, filterByPriceRange, sortListings } from '../../lib/marketplace';

interface MarketplaceShopProps {
  listings: MarketplaceListing[];
  userGold: number;
  onPurchase?: (listing: MarketplaceListing, quantity: number) => void;
  onClose?: () => void;
}

export const MarketplaceShop = ({
  listings,
  userGold,
  onPurchase,
  onClose,
}: MarketplaceShopProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<ItemRarity | 'all'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'new' | 'rating'>('new');
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [cartItems, setCartItems] = useState<Array<{ listing: MarketplaceListing; quantity: number }>>([]);

  let filtered = [...listings];

  // Search
  if (searchQuery.trim()) {
    filtered = searchMarketplace(filtered, searchQuery);
  }

  // Filter by rarity
  if (selectedRarity !== 'all') {
    filtered = filterByRarity(filtered, selectedRarity);
  }

  // Filter by price
  filtered = filterByPriceRange(filtered, priceRange[0], priceRange[1]);

  // Sort
  filtered = sortListings(filtered, sortBy);

  const cartTotal = cartItems.reduce((total, item) => total + item.listing.item.price * item.quantity, 0);
  const canAfford = cartTotal <= userGold;

  const handleAddToCart = (listing: MarketplaceListing) => {
    const existing = cartItems.find((item) => item.listing.id === listing.id);

    if (existing) {
      existing.quantity += purchaseQuantity;
    } else {
      cartItems.push({ listing, quantity: purchaseQuantity });
    }

    setCartItems([...cartItems]);
    setPurchaseQuantity(1);
    setSelectedListing(null);
  };

  const handleRemoveFromCart = (listingId: string) => {
    setCartItems(cartItems.filter((item) => item.listing.id !== listingId));
  };

  const handleCheckout = () => {
    cartItems.forEach((item) => {
      onPurchase?.(item.listing, item.quantity);
    });
    setCartItems([]);
  };

  const getRarityColor = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'Common':
        return '#999';
      case 'Uncommon':
        return '#4ade80';
      case 'Rare':
        return '#0ea5e9';
      case 'Very Rare':
        return '#a855f7';
      case 'Legendary':
        return '#fbbf24';
      case 'Artifact':
        return '#ef4444';
      default:
        return '#ccc';
    }
  };

  return (
    <div className="marketplace-shop">
      <div className="shop-header">
        <h2>🏪 Marketplace</h2>
        <div className="user-gold">
          💰 {userGold} Gold
        </div>
      </div>

      <div className="shop-layout">
        <div className="listings-section">
          <div className="filters">
            <div className="filter-group">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <label>Rarity</label>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value as ItemRarity | 'all')}
                className="select-input"
              >
                <option value="all">All Rarities</option>
                <option value="Common">Common</option>
                <option value="Uncommon">Uncommon</option>
                <option value="Rare">Rare</option>
                <option value="Very Rare">Very Rare</option>
                <option value="Legendary">Legendary</option>
                <option value="Artifact">Artifact</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <div className="price-inputs">
                <input
                  type="number"
                  min="0"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="price-input"
                  placeholder="Min"
                />
                <span className="dash">-</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="price-input"
                  placeholder="Max"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="select-input"
              >
                <option value="new">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rating</option>
              </select>
            </div>
          </div>

          <div className="listings-grid">
            {filtered.length === 0 ? (
              <p className="empty">No items found matching your criteria</p>
            ) : (
              filtered.map((listing) => (
                <div
                  key={listing.id}
                  className={`listing-card ${selectedListing?.id === listing.id ? 'selected' : ''}`}
                  onClick={() => setSelectedListing(listing)}
                >
                  <div className="listing-header">
                    <h4>{listing.item.name}</h4>
                    <span
                      className="rarity-badge"
                      style={{
                        backgroundColor: getRarityColor(listing.item.rarity) + '30',
                        color: getRarityColor(listing.item.rarity),
                      }}
                    >
                      {listing.item.rarity}
                    </span>
                  </div>

                  <p className="item-category">{listing.item.category}</p>

                  <div className="seller-info">
                    <span className="seller-name">{listing.seller.name}</span>
                    <span className="rating">⭐ {listing.seller.rating.toFixed(1)}</span>
                  </div>

                  <div className="listing-footer">
                    <span className="price">{listing.item.price} gp</span>
                    <span className="quantity">Qty: {listing.quantity}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="details-section">
          {selectedListing ? (
            <div className="item-details">
              <h3>{selectedListing.item.name}</h3>

              <div className="details-grid">
                <div className="detail-item">
                  <label>Category</label>
                  <p>{selectedListing.item.category.toUpperCase()}</p>
                </div>

                <div className="detail-item">
                  <label>Rarity</label>
                  <p style={{ color: getRarityColor(selectedListing.item.rarity) }}>
                    {selectedListing.item.rarity}
                  </p>
                </div>

                <div className="detail-item">
                  <label>Price per Unit</label>
                  <p className="price">{selectedListing.item.price} gp</p>
                </div>

                <div className="detail-item">
                  <label>Available</label>
                  <p>{selectedListing.quantity}</p>
                </div>
              </div>

              <div className="description">
                <label>Description</label>
                <p>{selectedListing.item.description}</p>
              </div>

              {selectedListing.item.requiresAttunement && (
                <div className="note attunement">
                  ⚠️ Requires Attunement
                </div>
              )}

              <div className="seller-details">
                <h4>Seller</h4>
                <div className="seller-card">
                  <div className="seller-header">
                    <span className="name">{selectedListing.seller.name}</span>
                    <span className="rating">⭐ {selectedListing.seller.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="purchase-section">
                <label>Quantity</label>
                <div className="quantity-control">
                  <button onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}>-</button>
                  <input
                    type="number"
                    min="1"
                    value={purchaseQuantity}
                    onChange={(e) => setPurchaseQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <button onClick={() => setPurchaseQuantity(purchaseQuantity + 1)}>+</button>
                </div>

                <div className="total-cost">
                  <label>Total Cost</label>
                  <p>{selectedListing.item.price * purchaseQuantity} gp</p>
                </div>

                <button
                  className="btn-add-to-cart"
                  onClick={() => handleAddToCart(selectedListing)}
                  disabled={purchaseQuantity > selectedListing.quantity}
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-details">
              <p>Select an item to view details</p>
            </div>
          )}

          <div className="cart-section">
            <h3>🛒 Cart ({cartItems.length})</h3>

            {cartItems.length === 0 ? (
              <p className="empty">Cart is empty</p>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map((cartItem) => (
                    <div key={cartItem.listing.id} className="cart-item">
                      <div className="item-info">
                        <h5>{cartItem.listing.item.name}</h5>
                        <p className="quantity">Qty: {cartItem.quantity}</p>
                      </div>
                      <div className="item-price">
                        <p>{cartItem.listing.item.price * cartItem.quantity} gp</p>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveFromCart(cartItem.listing.id)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-total">
                  <label>Total</label>
                  <p className={!canAfford ? 'insufficient' : ''}>
                    {cartTotal} / {userGold} gp
                  </p>
                </div>

                <button
                  className="btn-checkout"
                  onClick={handleCheckout}
                  disabled={!canAfford}
                >
                  {canAfford ? '✓ Checkout' : '✗ Insufficient Gold'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {onClose && (
        <button className="btn-close" onClick={onClose}>
          Close
        </button>
      )}

      <style>{`
        .marketplace-shop {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 900px;
          overflow-y: auto;
        }

        .shop-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .shop-header h2 {
          margin: 0;
          font-size: 24px;
          color: #fff;
        }

        .user-gold {
          background: #fbbf24;
          color: #000;
          padding: 8px 12px;
          border-radius: 6px;
          font-weight: 600;
        }

        .shop-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .filters {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .filter-group label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .search-input,
        .select-input,
        .price-input {
          padding: 8px 12px;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          color: #ccc;
          font-size: 12px;
        }

        .price-inputs {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .price-input {
          flex: 1;
        }

        .dash {
          color: #999;
        }

        .listings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
          max-height: 600px;
          overflow-y: auto;
        }

        .listing-card {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .listing-card:hover {
          border-color: #a855f7;
          transform: translateY(-2px);
        }

        .listing-card.selected {
          border-color: #a855f7;
          background: rgba(168, 85, 247, 0.1);
        }

        .listing-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 8px;
        }

        .listing-card h4 {
          margin: 0;
          font-size: 13px;
          color: #fff;
          flex: 1;
        }

        .rarity-badge {
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 9px;
          font-weight: 600;
          white-space: nowrap;
        }

        .item-category {
          margin: 0 0 6px 0;
          font-size: 10px;
          color: #999;
          text-transform: uppercase;
        }

        .seller-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          margin-bottom: 8px;
        }

        .seller-name {
          color: #ccc;
        }

        .rating {
          color: #fbbf24;
        }

        .listing-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 8px;
          border-top: 1px solid #333;
        }

        .price {
          color: #4ade80;
          font-weight: 600;
        }

        .quantity {
          font-size: 11px;
          color: #999;
        }

        .details-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .item-details {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 16px;
        }

        .item-details h3 {
          margin: 0 0 12px 0;
          font-size: 18px;
          color: #fff;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-item label {
          font-size: 10px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .detail-item p {
          margin: 0;
          font-size: 12px;
          color: #ccc;
        }

        .description {
          margin-bottom: 12px;
        }

        .description label {
          display: block;
          font-size: 10px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .description p {
          margin: 0;
          font-size: 12px;
          color: #ccc;
          line-height: 1.4;
        }

        .note {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          border-radius: 4px;
          padding: 8px;
          color: #ef4444;
          font-size: 11px;
          margin-bottom: 12px;
        }

        .seller-details {
          margin-bottom: 12px;
        }

        .seller-details h4 {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #a855f7;
          text-transform: uppercase;
          font-weight: 600;
        }

        .seller-card {
          background: rgba(168, 85, 247, 0.05);
          border: 1px solid #333;
          border-radius: 4px;
          padding: 8px;
        }

        .seller-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .seller-header .name {
          color: #ccc;
        }

        .purchase-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .purchase-section label {
          font-size: 10px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .quantity-control {
          display: flex;
          gap: 8px;
        }

        .quantity-control button {
          width: 32px;
          height: 32px;
          background: #333;
          border: 1px solid #666;
          border-radius: 4px;
          color: #ccc;
          cursor: pointer;
        }

        .quantity-control input {
          flex: 1;
          padding: 6px;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 4px;
          color: #ccc;
          text-align: center;
          font-size: 12px;
        }

        .total-cost {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .total-cost p {
          margin: 0;
          font-size: 14px;
          color: #4ade80;
          font-weight: 600;
        }

        .btn-add-to-cart {
          padding: 10px 16px;
          background: #a855f7;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-add-to-cart:hover:not(:disabled) {
          background: #9333ea;
        }

        .btn-add-to-cart:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty-details {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 32px 16px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }

        .cart-section {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 16px;
        }

        .cart-section h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #fff;
        }

        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 200px;
          overflow-y: auto;
          margin-bottom: 12px;
        }

        .cart-item {
          background: #1a1a2e;
          border: 1px solid #333;
          border-radius: 4px;
          padding: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cart-item h5 {
          margin: 0 0 2px 0;
          font-size: 12px;
          color: #ccc;
        }

        .cart-item .quantity {
          margin: 0;
          font-size: 10px;
          color: #999;
        }

        .item-price {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .item-price p {
          margin: 0;
          font-size: 12px;
          color: #4ade80;
          font-weight: 600;
        }

        .remove-btn {
          background: #ef4444;
          color: #fff;
          border: none;
          width: 20px;
          height: 20px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 10px;
        }

        .cart-total {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-top: 1px solid #333;
          margin-bottom: 12px;
        }

        .cart-total label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .cart-total p {
          margin: 0;
          font-size: 14px;
          color: #4ade80;
          font-weight: 600;
        }

        .cart-total p.insufficient {
          color: #ef4444;
        }

        .btn-checkout {
          width: 100%;
          padding: 10px;
          background: #4ade80;
          color: #000;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-checkout:hover:not(:disabled) {
          background: #22c55e;
        }

        .btn-checkout:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty {
          text-align: center;
          color: #666;
          font-size: 12px;
          padding: 20px;
        }

        .btn-close {
          padding: 10px 16px;
          background: transparent;
          border: 1px solid #333;
          color: #999;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-close:hover {
          border-color: #a855f7;
          color: #a855f7;
        }

        @media (max-width: 1024px) {
          .shop-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
