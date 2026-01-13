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

    return (
        <div className="glass-panel" style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '16px',
            background: 'rgba(15, 20, 30, 0.4)'
        }}>
            <div style={{
                padding: '25px 35px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: '900', letterSpacing: '1px' }}>INVENTÁRIO</h2>
                    <div style={{ fontSize: '0.6rem', color: '#555', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>BACKPACK & STORAGE</div>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(212,175,55,0.03)',
                    padding: '8px 15px',
                    borderRadius: '8px',
                    border: '1px solid rgba(212,175,55,0.1)'
                }}>
                    <Coins size={14} color="#d4af37" />
                    <span style={{ fontWeight: '900', color: '#d4af37', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                        {silver.toLocaleString()}
                    </span>
                </div>
            </div>

            <div className="scroll-container" style={{ padding: '30px 35px' }}>
                {/* Filters - HUB Style */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', flexWrap: 'wrap' }}>
                    {filterCategories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setFilter(cat.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                background: filter === cat.id ? 'var(--accent-soft)' : 'rgba(255,255,255,0.02)',
                                border: '1px solid',
                                borderColor: filter === cat.id ? 'var(--border-active)' : 'rgba(255,255,255,0.03)',
                                borderRadius: '6px',
                                color: filter === cat.id ? '#d4af37' : '#555',
                                fontSize: '0.65rem',
                                fontWeight: '900',
                                letterSpacing: '1px',
                                textTransform: 'uppercase'
                            }}
                        >
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>

                {/* Grid - Thinner & Clean */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: '12px',
                    paddingBottom: '100px'
                }}>
                    {filteredItems.map(([id, amount]) => {
                        const data = resolveItem(id);
                        const tierColor = getTierColor(data.tier || 1);
                        const qualityColor = data.rarityColor || '#fff'; // Usa a cor da raridade se existir

                        return (
                            <div key={id} style={{
                                background: 'rgba(0,0,0,0.2)',
                                border: `1px solid ${data.quality > 0 ? qualityColor : 'rgba(255,255,255,0.02)'}`, // Borda colorida para qualidade
                                borderRadius: '10px',
                                padding: '15px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative',
                                transition: '0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                cursor: 'default',
                                boxShadow: data.quality > 0 ? `0 0 10px ${qualityColor}20` : 'none'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: 8,
                                    left: 8,
                                    color: tierColor,
                                    fontSize: '0.6rem',
                                    fontWeight: '900',
                                    opacity: 0.8
                                }}>
                                    T{data.tier}
                                </div>

                                {data.quality > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        color: qualityColor,
                                        fontSize: '0.55rem',
                                        fontWeight: '900',
                                        textTransform: 'uppercase'
                                    }}>
                                        {data.qualityName}
                                    </div>
                                )}

                                <div style={{
                                    padding: '10px 0',
                                    color: tierColor,
                                    opacity: 0.9,
                                    position: 'relative'
                                }}>
                                    <Package size={28} />
                                    {/* Botão de Info (i) */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: -5,
                                            right: -20,
                                            opacity: 0.6,
                                            cursor: 'help',
                                            padding: '5px'
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onShowInfo(data);
                                        }}
                                    >
                                        <Info size={14} color="#fff" />
                                    </div>
                                </div>

                                <div style={{
                                    fontSize: '0.65rem',
                                    textAlign: 'center',
                                    fontWeight: '900',
                                    color: '#eee',
                                    height: '2.4em',
                                    overflow: 'hidden',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    marginBottom: '8px',
                                    lineHeight: '1.2'
                                }}>
                                    {data.name}
                                </div>

                                <div style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '900',
                                    color: '#d4af37',
                                    background: 'rgba(0,0,0,0.3)',
                                    width: '100%',
                                    textAlign: 'center',
                                    borderRadius: '6px',
                                    padding: '4px 0',
                                    fontFamily: 'monospace'
                                }}>
                                    {amount.toLocaleString()}
                                </div>

                                {/* Quick Actions Overlay (Hides and shows on selection or hover simulated) */}
                                <div style={{ width: '100%', marginTop: '10px' }}>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        {['WEAPON', 'ARMOR', 'HELMET', 'BOOTS', 'GLOVES', 'CAPE', 'OFF_HAND', 'TOOL', 'FOOD'].includes(data.type) && (
                                            <button
                                                onClick={() => socket.emit('equip_item', { itemId: id })}
                                                style={{
                                                    flex: 1,
                                                    background: 'rgba(76, 175, 80, 0.1)',
                                                    border: '1px solid rgba(76, 175, 80, 0.3)',
                                                    color: '#4caf50',
                                                    fontSize: '0.55rem',
                                                    padding: '6px 0',
                                                    borderRadius: '4px',
                                                    fontWeight: '900',
                                                    letterSpacing: '1px',
                                                    cursor: 'pointer'
                                                }}
                                            >EQUIPAR</button>
                                        )}
                                        <button
                                            onClick={() => socket.emit('sell_item', { itemId: id, quantity: 1 })}
                                            style={{
                                                flex: 1,
                                                background: 'rgba(255, 68, 68, 0.03)',
                                                border: '1px solid rgba(255, 68, 68, 0.1)',
                                                color: '#ff4d4d',
                                                fontSize: '0.55rem',
                                                padding: '6px 0',
                                                borderRadius: '4px',
                                                fontWeight: '900',
                                                letterSpacing: '1px',
                                                cursor: 'pointer'
                                            }}
                                        >VENDER</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredItems.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 0', color: '#444' }}>
                            <Package size={40} style={{ opacity: 0.1, marginBottom: '20px' }} />
                            <p style={{ fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>Vazio</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventoryPanel;
