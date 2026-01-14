import React, { useState } from 'react';
import {
    Package, Coins, Shield, Sword,
    Info, Tag, Utensils, Map as MapIcon,
    Layers, Box
} from 'lucide-react';
import { ITEMS, resolveItem, getTierColor } from '../data/items';

const InventoryPanel = ({ inventory = {}, socket, silver = 0, onShowInfo }) => {
    const [filter, setFilter] = useState('ALL');

    const filterCategories = [
        { id: 'ALL', label: 'Tudo', icon: <Package size={14} /> },
        { id: 'EQUIPMENT', label: 'Equipamentos', icon: <Sword size={14} /> },
        { id: 'RAW', label: 'Recursos', icon: <Box size={14} /> },
        { id: 'REFINED', label: 'Refinados', icon: <Layers size={14} /> },
        { id: 'CONSUMABLES', label: 'Comida', icon: <Utensils size={14} /> },
        { id: 'MAPS', label: 'Mapas', icon: <MapIcon size={14} /> }
    ];

    const filteredItems = Object.entries(inventory).filter(([id, amount]) => {
        if (amount <= 0) return false;
        const data = resolveItem(id);
        if (!data) return false;

        if (filter === 'ALL') return true;

        const isGear = ['WEAPON', 'ARMOR', 'HELMET', 'BOOTS', 'GLOVES', 'OFF_HAND', 'TOOL', 'CAPE'].includes(data.type);
        const isFood = data.type === 'FOOD' || id.includes('_FOOD');
        const isMap = data.type === 'MAP';
        const isRaw = id.includes('_WOOD') || id.includes('_ORE') || id.includes('_HIDE') || id.includes('_FIBER') || id.includes('_FISH');
        const isRefined = id.includes('_PLANK') || id.includes('_BAR') || id.includes('_LEATHER') || id.includes('_CLOTH');

        if (filter === 'EQUIPMENT') return isGear;
        if (filter === 'RAW') return isRaw;
        if (filter === 'REFINED') return isRefined;
        if (filter === 'CONSUMABLES') return isFood;
        if (filter === 'MAPS') return isMap;

        return true;
    });

    const totalSlots = 50;
    const usedSlots = Object.keys(inventory).length;

    // Heuristic price calculation for display
    const getSellPrice = (data) => (data.tier * 5) + ((data.quality || 0) * 10);

    return (
        <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{
                marginBottom: '1rem',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{ margin: 0, color: '#fff' }}>Inventory</h3>
            </div>

            <div style={{
                display: 'flex',
                gap: '6px',
                marginBottom: '12px',
                flexWrap: 'wrap',
                padding: '8px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px'
            }}>
                {filterCategories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setFilter(cat.id)}
                        style={{
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            border: filter === cat.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                            background: filter === cat.id ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                            color: filter === cat.id ? 'var(--accent)' : 'var(--text-dim)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: filter === cat.id ? 'bold' : 'normal',
                            transition: '0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        {cat.id === 'ALL' && <span>📦</span>}
                        {cat.id === 'EQUIPMENT' && <span>⚔️</span>}
                        {cat.id === 'RAW' && <span>🪨</span>}
                        {cat.id === 'REFINED' && <span>⚡</span>}
                        {cat.id === 'CONSUMABLES' && <span>🍖</span>}
                        {cat.id === 'MAPS' && <span>🗺️</span>}
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                <span>Slots Used:</span>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{usedSlots} / {totalSlots}</span>
            </div>

            <div className="inventory-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '6px',
                paddingBottom: '100px',
                width: '100%',
                overflowY: 'auto',
                flex: 1
            }}>
                {Array.from({ length: totalSlots }).map((_, index) => {
                    const itemEntry = filteredItems[index];

                    if (!itemEntry) {
                        return (
                            <div key={`empty-${index}`} style={{
                                aspectRatio: '1/1.3',
                                background: 'rgba(255, 255, 255, 0.02)',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.03)'
                            }}></div>
                        );
                    }

                    const [id, amount] = itemEntry;
                    const data = resolveItem(id);
                    const tierColor = getTierColor(data.tier || 1);
                    const qualityColor = data.rarityColor || '#fff';
                    const sellPrice = getSellPrice(data);

                    return (
                        <div key={id} style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '8px',
                            borderRadius: '6px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            fontSize: '0.65rem',
                            border: data.quality > 0 ? `1px solid ${qualityColor}` : '1px solid var(--border)',
                            aspectRatio: '1/1.3'
                        }}>
                            {/* Info Icon */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    cursor: 'pointer',
                                    color: 'var(--text-dim)',
                                    zIndex: 2,
                                    background: 'rgba(0, 0, 0, 0.5)',
                                    borderRadius: '50%',
                                    padding: '2px'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onShowInfo(data);
                                }}
                            >
                                <Info size={12} />
                            </div>

                            {/* Tier */}
                            <div style={{
                                position: 'absolute',
                                top: '4px',
                                left: '4px',
                                fontWeight: 'bold',
                                color: tierColor
                            }}>T{data.tier}</div>

                            {/* Name */}
                            <div style={{
                                textAlign: 'center',
                                overflow: 'hidden',
                                height: '2.4em',
                                lineHeight: '1.2em',
                                marginBottom: '4px',
                                width: '100%',
                                marginTop: '16px',
                                color: '#eee'
                            }}>
                                {data.name}
                            </div>

                            {/* Amount */}
                            <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginTop: '4px' }}>
                                x{amount >= 1000 ? (amount / 1000).toFixed(1) + 'k' : amount}
                            </div>

                            {/* Price/Value */}
                            <div style={{ display: 'flex', gap: '2px', alignItems: 'center', marginTop: '4px', color: 'var(--accent)', fontSize: '0.6rem' }}>
                                <Coins size={10} />
                                {sellPrice}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '2px', width: '100%', marginTop: 'auto', flexWrap: 'wrap', justifyContent: 'center' }}>

                                {/* EQUIP BUTTON */}
                                {['WEAPON', 'ARMOR', 'HELMET', 'BOOTS', 'GLOVES', 'CAPE', 'OFF_HAND', 'TOOL', 'FOOD', 'TOOL_AXE', 'TOOL_PICKAXE', 'TOOL_KNIFE', 'TOOL_SICKLE', 'TOOL_ROD'].includes(data.type) && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log('[InventoryPanel] Equip clicked:', id);
                                            if (!socket) {
                                                console.error('[InventoryPanel] Socket is null');
                                                return;
                                            }
                                            socket.emit('equip_item', { itemId: id });
                                        }}
                                        style={{
                                            flex: '1 1 0%',
                                            padding: '4px 0',
                                            fontSize: '0.55rem',
                                            background: 'var(--accent)',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            color: '#000',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        EQUIP
                                    </button>
                                )}

                                {/* SELL BUTTON */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('[InventoryPanel] Sell clicked:', id);
                                        if (window.confirm(`Vender ${data.name} por ${sellPrice} moedas?`)) {
                                            socket.emit('sell_item_vendor', { itemId: id, quantity: 1 });
                                        }
                                    }}
                                    style={{
                                        flex: '1 1 0%',
                                        padding: '4px 0',
                                        fontSize: '0.55rem',
                                        background: '#ff4444',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        color: '#fff',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    SELL
                                </button>
                                {/* List Button placeholder to match UI request */}
                                <button
                                    style={{
                                        flex: 1,
                                        padding: '4px 0',
                                        fontSize: '0.55rem',
                                        background: 'var(--accent)',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        color: '#000',
                                        fontWeight: 'bold',
                                        opacity: 0.5 // Disabled look for now
                                    }}
                                    disabled
                                >
                                    LIST
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default InventoryPanel;
