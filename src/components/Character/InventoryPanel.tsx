import { useState } from 'react';
import type { Inventory } from '../../lib/inventory';
import {
  calculateTotalWeight,
  getTotalCurrencyInGold,
  getEquippedItems,
} from '../../lib/inventory';

interface InventoryPanelProps {
  inventory: Inventory;
  maxWeight?: number;
  onRemoveItem?: (itemId: string, quantity: number) => void;
  onEquipItem?: (itemId: string) => void;
  readonly?: boolean;
}

export const InventoryPanel = ({
  inventory,
  maxWeight = 300,
  onRemoveItem,
  onEquipItem,
  readonly = false,
}: InventoryPanelProps) => {
  const [filter, setFilter] = useState<'all' | 'equipped' | 'consumable'>('all');
  const [showAdd, setShowAdd] = useState(false);

  const totalWeight = calculateTotalWeight(inventory.items);
  const totalGold = getTotalCurrencyInGold(inventory);
  const weightPercent = (totalWeight / maxWeight) * 100;

  const filteredItems =
    filter === 'equipped'
      ? getEquippedItems(inventory)
      : inventory.items;

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'Common':
        return '#ccc';
      case 'Uncommon':
        return '#4ade80';
      case 'Rare':
        return '#0ea5e9';
      case 'Very Rare':
        return '#a855f7';
      case 'Legendary':
        return '#fbbf24';
      default:
        return '#999';
    }
  };

  return (
    <div className="inventory-panel">
      <div className="inventory-header">
        <h3>🎒 Inventory</h3>
      </div>

      <div className="inventory-stats">
        <div className="stat-item">
          <label>Weight</label>
          <div className="weight-bar">
            <div
              className="weight-fill"
              style={{
                width: `${Math.min(weightPercent, 100)}%`,
                backgroundColor: weightPercent > 100 ? '#ef4444' : '#a855f7',
              }}
            ></div>
          </div>
          <span className={weightPercent > 100 ? 'error' : ''}>
            {totalWeight.toFixed(1)} / {maxWeight} lbs
          </span>
        </div>

        <div className="stat-item">
          <label>Currency</label>
          <div className="currency">
            <span className="gold">{inventory.gold} gp</span>
            <span className="silver">{inventory.silver} sp</span>
            <span className="copper">{inventory.copper} cp</span>
          </div>
          <span className="total">{totalGold.toFixed(2)} gp total</span>
        </div>
      </div>

      <div className="inventory-controls">
        <div className="filter-tabs">
          <button
            className={`tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({inventory.items.length})
          </button>
          <button
            className={`tab ${filter === 'equipped' ? 'active' : ''}`}
            onClick={() => setFilter('equipped')}
          >
            Equipped ({getEquippedItems(inventory).length})
          </button>
        </div>

        {!readonly && (
          <button
            className="btn-primary btn-small"
            onClick={() => setShowAdd(!showAdd)}
          >
            + Add Item
          </button>
        )}
      </div>

      {showAdd && !readonly && (
        <div className="add-item-form">
          <input type="text" placeholder="Item name" className="input-field" />
          <input type="number" placeholder="Quantity" defaultValue="1" className="input-field" />
          <button className="btn-primary" onClick={() => setShowAdd(false)}>
            Add
          </button>
        </div>
      )}

      <div className="inventory-list">
        {filteredItems.length === 0 ? (
          <p className="empty">No items</p>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="inventory-item">
              <div className="item-main">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  {item.rarity && (
                    <span
                      className="rarity"
                      style={{ color: getRarityColor(item.rarity) }}
                    >
                      {item.rarity}
                    </span>
                  )}
                </div>

                <div className="item-details">
                  <span className="quantity">x{item.quantity}</span>
                  {item.weight && <span className="weight">{item.weight * item.quantity} lbs</span>}
                  {item.equipped && <span className="equipped">⚔️ Equipped</span>}
                </div>
              </div>

              {!readonly && (
                <div className="item-actions">
                  {!item.equipped && (
                    <button
                      className="btn-small btn-secondary"
                      onClick={() => onEquipItem?.(item.id)}
                    >
                      Equip
                    </button>
                  )}
                  <button
                    className="btn-small btn-danger"
                    onClick={() => onRemoveItem?.(item.id, 1)}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <style>{`
        .inventory-panel {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 600px;
          overflow-y: auto;
        }

        .inventory-header h3 {
          margin: 0;
          font-size: 18px;
          color: #fff;
        }

        .inventory-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .stat-item label {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .weight-bar {
          width: 100%;
          height: 8px;
          background: #0d0d0d;
          border-radius: 4px;
          overflow: hidden;
        }

        .weight-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .stat-item span {
          font-size: 12px;
          color: #ccc;
        }

        .stat-item span.error {
          color: #ef4444;
          font-weight: 600;
        }

        .currency {
          display: flex;
          gap: 8px;
          font-size: 12px;
        }

        .currency .gold {
          color: #fbbf24;
        }

        .currency .silver {
          color: #cbd5e1;
        }

        .currency .copper {
          color: #ea580c;
        }

        .total {
          font-size: 11px;
          color: #999;
        }

        .inventory-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .filter-tabs {
          display: flex;
          gap: 8px;
        }

        .tab {
          padding: 6px 12px;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 4px;
          color: #999;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab:hover,
        .tab.active {
          border-color: #a855f7;
          color: #a855f7;
        }

        .add-item-form {
          display: flex;
          gap: 8px;
        }

        .add-item-form input,
        .add-item-form button {
          flex: 1;
          min-height: 32px;
          font-size: 12px;
        }

        .inventory-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
          overflow-y: auto;
        }

        .inventory-item {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .item-main {
          flex: 1;
        }

        .item-info h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          color: #fff;
        }

        .rarity {
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .item-details {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #999;
          margin-top: 6px;
        }

        .equipped {
          color: #a855f7;
          font-weight: 600;
        }

        .item-actions {
          display: flex;
          gap: 6px;
        }

        .empty {
          text-align: center;
          color: #666;
          font-size: 12px;
          padding: 20px;
        }
      `}</style>
    </div>
  );
};
