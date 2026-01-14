import React, { useState, useEffect } from 'react';
import {
    Tag, ShoppingBag, Package, Search,
    Coins, ArrowRight, User, Info, Trash2,
    Shield, Zap, Apple, Box, Clock, Check, AlertTriangle, X
} from 'lucide-react';
import { resolveItem, getTierColor } from '../data/items';

const MarketPanel = ({ socket, gameState, silver, onShowInfo }) => {
    const [activeTab, setActiveTab] = useState('BUY'); // 'BUY', 'SELL', 'MY_ORDERS', 'CLAIM'
    const [listings, setListings] = useState([]);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL'); // 'ALL', 'EQUIPMENT', 'RESOURCE', 'REFINED', 'CONSUMABLE'
    const [sellPrice, setSellPrice] = useState('');
    const [sellAmount, setSellAmount] = useState('1');
    const [selectedItemToSell, setSelectedItemToSell] = useState(null);
    const [notification, setNotification] = useState(null);
    const [confirmModal, setConfirmModal] = useState(null);

    // Auto-dismiss notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        // Fetch listings on mount
        socket.emit('get_market_listings');

        const handleUpdate = (newListings) => {
            setListings(newListings);
        };

        const handleSuccess = (result) => {
            setNotification({ type: 'success', message: result.message || 'Action completed successfully!' });
            socket.emit('get_market_listings');
            setSelectedItemToSell(null);
            setSellPrice('');
            setSellAmount('1');
        };

        const handleError = (err) => {
            setNotification({ type: 'error', message: err.message || 'An error occurred.' });
        };

        socket.on('market_listings_update', handleUpdate);
        socket.on('market_action_success', handleSuccess);
        socket.on('error', handleError);

        return () => {
            socket.off('market_listings_update', handleUpdate);
            socket.off('market_action_success', handleSuccess);
            socket.off('error', handleError);
        };
    }, [socket]);

    const handleBuy = (listingId) => {
        setConfirmModal({
            message: 'Are you sure you want to buy this item?',
            subtext: 'Silver will be deducted immediately.',
            onConfirm: () => {
                socket.emit('buy_market_item', { listingId });
                setConfirmModal(null);
            }
        });
    };

    const handleCancel = (listingId) => {
        setConfirmModal({
            message: 'Cancel this listing?',
            subtext: 'The item will be returned to your Claim tab.',
            onConfirm: () => {
                socket.emit('cancel_listing', { listingId });
                setConfirmModal(null);
            }
        });
    };

    const handleList = () => {
        if (!selectedItemToSell || !sellPrice || !sellAmount) return;
        socket.emit('list_market_item', {
            itemId: selectedItemToSell,
            amount: parseInt(sellAmount),
            price: parseInt(sellPrice)
        });
    };

    const handleClaim = (claimId) => {
        socket.emit('claim_market_item', { claimId });
    };

    const myOrders = listings.filter(l => l.seller_id === gameState.user_id);
    const buyListings = listings.filter(l => l.seller_id !== gameState.user_id);

    // Filter Logic
    const activeBuyListings = buyListings.filter(l => {
        const matchesSearch = l.item_id.toLowerCase().includes(search.toLowerCase()) ||
            l.item_data.name.toLowerCase().includes(search.toLowerCase());

        // Category Filter Logic
        let matchesCategory = true;
        if (filterCategory === 'EQUIPMENT') {
            matchesCategory = ['WEAPON', 'ARMOR', 'HELMET', 'BOOTS', 'OFF_HAND', 'GLOVES', 'CAPE'].includes(l.item_data.type);
        } else if (filterCategory === 'RESOURCE') {
            matchesCategory = l.item_data.type === 'RESOURCE' || l.item_data.type === 'RAW';
        } else if (filterCategory === 'REFINED') {
            matchesCategory = l.item_data.type === 'REFINED';
        } else if (filterCategory === 'CONSUMABLE') {
            matchesCategory = l.item_data.type === 'FOOD' || l.item_data.type === 'POTION';
        }

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="content-area" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="panel" style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                overflow: 'hidden',
                background: 'var(--panel-bg)',
                borderRadius: '12px',
                padding: '24px' // Consistent padding
            }}>

                {/* HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                        <h2 style={{ color: 'var(--accent)', margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Tag size={24} /> MARKETPLACE
                        </h2>
                        <p style={{ margin: '5px 0px 0px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>Shared world trade system</p>
                    </div>

                    {/* TOP TABS */}
                    <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '12px', padding: '4px' }}>
                        <button
                            onClick={() => setActiveTab('BUY')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                background: activeTab === 'BUY' ? 'var(--accent)' : 'transparent',
                                color: activeTab === 'BUY' ? '#000' : 'var(--text-dim)',
                                transition: '0.2s'
                            }}>
                            Browse
                        </button>
                        <button
                            onClick={() => setActiveTab('MY_ORDERS')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                background: activeTab === 'MY_ORDERS' ? 'var(--accent)' : 'transparent',
                                color: activeTab === 'MY_ORDERS' ? '#000' : 'var(--text-dim)',
                                transition: '0.2s'
                            }}>
                            My Listings
                        </button>
                        <button
                            onClick={() => setActiveTab('SELL')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                background: activeTab === 'SELL' ? 'var(--accent)' : 'transparent',
                                color: activeTab === 'SELL' ? '#000' : 'var(--text-dim)',
                                transition: '0.2s'
                            }}>
                            Sell
                        </button>
                        <button
                            onClick={() => setActiveTab('CLAIM')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                background: activeTab === 'CLAIM' ? 'var(--accent)' : 'transparent',
                                color: activeTab === 'CLAIM' ? '#000' : 'var(--text-dim)',
                                transition: '0.2s',
                                position: 'relative'
                            }}>
                            Claim
                            {gameState.state?.claims?.length > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-2px',
                                    right: '-2px',
                                    background: '#ff4444',
                                    color: '#fff',
                                    borderRadius: '50%',
                                    width: '16px',
                                    height: '16px',
                                    fontSize: '0.65rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>{gameState.state.claims.length}</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* SEARCH AND FILTERS (Only visible in BUY tab) */}
                {activeTab === 'BUY' && (
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Search Input */}
                        <div style={{ flex: '1 1 0%', position: 'relative', minWidth: '200px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                            <input
                                placeholder="Search items..."
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'rgba(0, 0, 0, 0.3)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    padding: '10px 10px 10px 40px',
                                    color: '#fff',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px', flex: '2 1 0%' }}>
                            {[
                                { id: 'ALL', label: 'All Items', icon: <ShoppingBag size={14} /> },
                                { id: 'EQUIPMENT', label: 'Equipment', icon: <Shield size={14} /> },
                                { id: 'RESOURCE', label: 'Resources', icon: <Package size={14} /> },
                                { id: 'REFINED', label: 'Refined', icon: <Zap size={14} /> },
                                { id: 'CONSUMABLE', label: 'Consumables', icon: <Apple size={14} /> }
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFilterCategory(cat.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid',
                                        borderColor: filterCategory === cat.id ? 'var(--accent)' : 'var(--border)',
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.8rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        background: filterCategory === cat.id ? 'rgba(212, 175, 55, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                                        color: filterCategory === cat.id ? 'var(--accent)' : 'var(--text-dim)'
                                    }}
                                >
                                    {cat.icon} {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* CONTENT AREA */}
                <div className="scroll-container" style={{ flex: '1 1 0%', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '5px' }}>

                    {/* View: BUY */}
                    {activeTab === 'BUY' && (
                        <>
                            {activeBuyListings.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-dim)' }}>
                                    <ShoppingBag size={48} style={{ marginBottom: '15px', opacity: 0.3, margin: '0 auto' }} />
                                    <p>No listings found matching your criteria.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                                    {activeBuyListings.map(l => (
                                        <div key={l.id} style={{
                                            background: 'rgba(255, 255, 255, 0.02)',
                                            borderColor: 'rgba(255, 255, 255, 0.1)',
                                            borderWidth: '1px',
                                            borderStyle: 'solid',
                                            padding: '12px 20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '15px',
                                            transition: '0.2s',
                                            position: 'relative',
                                            flexWrap: 'wrap',
                                            borderRadius: '8px'
                                        }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                background: 'rgba(0, 0, 0, 0.4)',
                                                borderRadius: '6px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: `1px solid ${l.item_data.rarityColor || 'rgba(255, 255, 255, 0.1)'}`,
                                                flexShrink: 0
                                            }}>
                                                <span style={{ fontSize: '1rem', fontWeight: 'bold', color: getTierColor(l.item_data.tier) }}>T{l.item_data.tier}</span>
                                            </div>

                                            <div style={{ flex: '2 1 0%', minWidth: '150px' }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: l.item_data.rarityColor || 'rgb(255, 255, 255)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                    <span>{l.item_data.name}</span>
                                                    <button onClick={() => onShowInfo(l.item_data)} style={{ background: 'none', border: 'none', padding: '0', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex' }}>
                                                        <Info size={14} />
                                                    </button>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px', display: 'flex', gap: '15px' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <User size={12} /> {l.seller_name}
                                                    </span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Clock size={12} /> {new Date(l.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ flex: '1 1 0%', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '120px' }}>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '2px' }}>{l.amount}x units</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                                                    <Coins size={16} /> {l.price.toLocaleString()}
                                                </div>
                                            </div>

                                            <div style={{ marginLeft: '10px' }}>
                                                <button
                                                    onClick={() => handleBuy(l.id)}
                                                    disabled={silver < l.price}
                                                    style={{
                                                        padding: '8px 16px',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        cursor: silver < l.price ? 'not-allowed' : 'pointer',
                                                        background: silver < l.price ? 'rgba(255, 255, 255, 0.05)' : 'rgba(76, 175, 80, 0.15)',
                                                        color: silver < l.price ? 'var(--text-dim)' : '#4caf50',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.8rem',
                                                        minWidth: '100px',
                                                        border: `1px solid ${silver < l.price ? 'transparent' : 'rgba(76, 175, 80, 0.3)'}`
                                                    }}
                                                >
                                                    {silver < l.price ? 'No Funds' : 'BUY'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* View: SELL */}
                    {activeTab === 'SELL' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px', height: '100%' }}>
                            {/* Inventory Grid */}
                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '20px', overflowY: 'auto' }}>
                                <h4 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Box size={16} /> Select Item to Sell
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', gap: '8px' }}>
                                    {Object.entries(gameState.state?.inventory || {}).map(([id, qty]) => {
                                        const data = resolveItem(id);
                                        const isSelected = selectedItemToSell === id;
                                        const tierColor = getTierColor(data.tier);
                                        return (
                                            <button
                                                key={id}
                                                onClick={() => setSelectedItemToSell(id)}
                                                style={{
                                                    width: '100%',
                                                    aspectRatio: '1/1',
                                                    background: isSelected ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.03)',
                                                    border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                                                    borderRadius: '10px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    transition: '0.2s',
                                                    padding: '5px'
                                                }}
                                            >
                                                <div style={{ position: 'relative', marginBottom: '2px' }}>
                                                    <Package size={24} color={tierColor} />
                                                </div>
                                                <span style={{
                                                    fontSize: '0.65rem',
                                                    color: isSelected ? '#fff' : 'var(--text-dim)',
                                                    fontWeight: 'bold',
                                                    textAlign: 'center',
                                                    lineHeight: '1.1',
                                                    width: '100%',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: '2',
                                                    WebkitBoxOrient: 'vertical'
                                                }}>
                                                    {data.name}
                                                </span>
                                                <span style={{ position: 'absolute', top: 4, right: 6, fontSize: '0.7rem', color: '#fff', fontWeight: 'bold' }}>{qty}</span>
                                                <span style={{ position: 'absolute', top: 4, left: 6, fontSize: '0.6rem', color: tierColor, fontWeight: 'bold' }}>T{data.tier}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Sell Form */}
                            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
                                {selectedItemToSell ? (
                                    <>
                                        <div style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                                            <div style={{
                                                width: '80px',
                                                height: '80px',
                                                margin: '0 auto 15px',
                                                background: 'rgba(0,0,0,0.3)',
                                                borderRadius: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: `2px solid ${getTierColor(resolveItem(selectedItemToSell).tier)} `
                                            }}>
                                                <Package size={40} color={getTierColor(resolveItem(selectedItemToSell).tier)} />
                                            </div>
                                            <div style={{ fontWeight: '900', fontSize: '1.1rem', color: '#fff', marginBottom: '5px' }}>{resolveItem(selectedItemToSell).name}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>In Inventory: <span style={{ color: '#fff' }}>{gameState.state.inventory[selectedItemToSell]}</span></div>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Quantity</label>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button onClick={() => setSellAmount('1')} style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-dim)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.7rem' }}>MIN</button>
                                                <button onClick={() => setSellAmount(String(Math.max(1, parseInt(sellAmount || 0) - 1)))} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                                                <input
                                                    type="number"
                                                    value={sellAmount}
                                                    onChange={(e) => setSellAmount(e.target.value)}
                                                    style={{
                                                        flex: 1,
                                                        background: 'rgba(0,0,0,0.2)',
                                                        border: '1px solid var(--border)',
                                                        padding: '12px',
                                                        borderRadius: '8px',
                                                        color: '#fff',
                                                        fontSize: '1rem',
                                                        fontWeight: 'bold',
                                                        textAlign: 'center'
                                                    }}
                                                />
                                                <button onClick={() => setSellAmount(String(Math.min(gameState.state.inventory[selectedItemToSell], parseInt(sellAmount || 0) + 1)))} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                                                <button onClick={() => setSellAmount(String(gameState.state.inventory[selectedItemToSell]))} style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-dim)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.7rem' }}>MAX</button>
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Price (Silver)</label>
                                            <div style={{ position: 'relative' }}>
                                                <Coins size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)' }} />
                                                <input
                                                    type="number"
                                                    value={sellPrice}
                                                    onChange={(e) => setSellPrice(e.target.value)}
                                                    placeholder="0"
                                                    style={{
                                                        width: '100%',
                                                        background: 'rgba(0,0,0,0.2)',
                                                        border: '1px solid var(--border)',
                                                        padding: '12px 12px 12px 35px',
                                                        borderRadius: '8px',
                                                        color: 'var(--accent)',
                                                        fontWeight: 'bold',
                                                        fontSize: '1rem'
                                                    }}
                                                />
                                            </div>
                                            {sellPrice && (
                                                <div style={{ marginTop: '10px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                                    <div style={{ color: 'var(--text-dim)' }}>Tax (6%):</div>
                                                    <div style={{ color: '#ff4444' }}>- {Math.floor(sellPrice * 0.06).toLocaleString()}</div>
                                                </div>
                                            )}
                                            {sellPrice && (
                                                <div style={{ marginTop: '5px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
                                                    <div style={{ fontWeight: 'bold', color: '#4caf50' }}>Estimated Profit:</div>
                                                    <div style={{ fontWeight: 'bold', color: '#4caf50' }}>+ {(sellPrice - Math.floor(sellPrice * 0.06)).toLocaleString()}</div>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleList}
                                            style={{
                                                width: '100%',
                                                background: 'var(--accent)',
                                                border: 'none',
                                                padding: '16px',
                                                borderRadius: '8px',
                                                color: '#000',
                                                fontWeight: '900',
                                                fontSize: '0.9rem',
                                                letterSpacing: '0.5px',
                                                cursor: 'pointer',
                                                marginTop: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            LIST ITEM
                                        </button>
                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', opacity: 0.3, padding: '40px 0' }}>
                                        <ArrowRight size={48} style={{ marginBottom: '20px' }} />
                                        <p style={{ fontSize: '0.9rem' }}>Select an item to sell</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* View: MY LISTINGS */}
                    {activeTab === 'MY_ORDERS' && (
                        <>
                            {myOrders.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-dim)' }}>
                                    <Tag size={48} style={{ marginBottom: '15px', opacity: 0.3, margin: '0 auto' }} />
                                    <p>You have no active listings.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                                    {myOrders.map(l => (
                                        <div key={l.id} style={{
                                            background: 'rgba(255, 255, 255, 0.02)',
                                            borderColor: 'rgba(255, 255, 255, 0.1)',
                                            borderWidth: '1px',
                                            borderStyle: 'solid',
                                            padding: '12px 20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '15px',
                                            transition: '0.2s',
                                            position: 'relative',
                                            flexWrap: 'wrap',
                                            borderRadius: '8px'
                                        }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                background: 'rgba(0, 0, 0, 0.4)',
                                                borderRadius: '6px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: `1px solid ${l.item_data.rarityColor || 'rgba(255, 255, 255, 0.1)'}`,
                                                flexShrink: 0
                                            }}>
                                                <span style={{ fontSize: '1rem', fontWeight: 'bold', color: getTierColor(l.item_data.tier) }}>T{l.item_data.tier}</span>
                                            </div>

                                            <div style={{ flex: '2 1 0%', minWidth: '150px' }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: l.item_data.rarityColor || 'rgb(255, 255, 255)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                    <span>{l.item_data.name}</span>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px', display: 'flex', gap: '15px' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Clock size={12} /> {new Date(l.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ flex: '1 1 0%', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '120px' }}>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '2px' }}>{l.amount}x units</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                                                    <Coins size={16} /> {l.price.toLocaleString()}
                                                </div>
                                            </div>

                                            <div style={{ marginLeft: '10px' }}>
                                                <button
                                                    onClick={() => handleCancel(l.id)}
                                                    style={{
                                                        padding: '8px 16px',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        background: 'rgba(255, 68, 68, 0.1)',
                                                        color: '#ff4444',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.8rem',
                                                        minWidth: '100px',
                                                        border: '1px solid rgba(255, 68, 68, 0.3)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '5px'
                                                    }}
                                                >
                                                    <Trash2 size={12} /> CANCEL
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* View: CLAIM */}
                    {activeTab === 'CLAIM' && (
                        <>
                            {(!gameState.state?.claims || gameState.state.claims.length === 0) ? (
                                <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-dim)' }}>
                                    <ShoppingBag size={48} style={{ marginBottom: '15px', opacity: 0.3, margin: '0 auto' }} />
                                    <p>Nothing to claim.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                                    {gameState.state.claims.map(c => {
                                        let icon = <Coins size={24} color="var(--accent)" />;
                                        let tierColor = '#fff';
                                        let isItem = c.type === 'BOUGHT_ITEM' || c.type === 'CANCELLED_LISTING';
                                        let name = c.name || 'Item';

                                        if (c.type === 'SOLD_ITEM') name = `Sold: ${c.item}`;

                                        if (isItem) {
                                            const data = resolveItem(c.itemId);
                                            tierColor = getTierColor(data.tier);
                                            icon = <Package size={24} color={tierColor} />;
                                        }

                                        return (
                                            <div key={c.id} style={{
                                                background: 'rgba(255, 255, 255, 0.02)',
                                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                                borderWidth: '1px',
                                                borderStyle: 'solid',
                                                padding: '12px 20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '15px',
                                                transition: '0.2s',
                                                position: 'relative',
                                                flexWrap: 'wrap',
                                                borderRadius: '8px'
                                            }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    background: 'rgba(0, 0, 0, 0.4)',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: isItem ? `1px solid ${tierColor}` : '1px solid var(--accent)',
                                                    flexShrink: 0
                                                }}>
                                                    {icon}
                                                </div>
                                                <div style={{ flex: '2 1 0%', minWidth: '150px' }}>
                                                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                        <span>{name}</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px', display: 'flex', gap: '15px' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Clock size={12} /> {new Date(c.timestamp).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div style={{ flex: '1 1 0%', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '120px' }}>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '2px' }}>
                                                        {c.type === 'SOLD_ITEM' && `Quantity: ${c.amount}`}
                                                        {c.type === 'BOUGHT_ITEM' && `Bought x${c.amount}`}
                                                        {c.type === 'CANCELLED_LISTING' && `Retrieved x${c.amount}`}
                                                    </div>
                                                    {c.silver ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                                                            <Coins size={16} /> +{c.silver.toLocaleString()}
                                                        </div>
                                                    ) : (
                                                        <div style={{ height: '24px' }}></div>
                                                    )}
                                                </div>

                                                <div style={{ marginLeft: '10px' }}>
                                                    <button
                                                        onClick={() => {
                                                            // Direct claim without confirm as receiving items is always good
                                                            handleClaim(c.id);
                                                        }}
                                                        style={{
                                                            padding: '8px 16px',
                                                            borderRadius: '6px',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            background: 'rgba(76, 175, 80, 0.15)',
                                                            color: '#4caf50',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.8rem',
                                                            minWidth: '100px',
                                                            border: '1px solid rgba(76, 175, 80, 0.3)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '5px'
                                                        }}
                                                    >
                                                        CLAIM
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}

                </div>

                {/* NOTIFICATIONS */}
                {notification && (
                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: notification.type === 'error' ? 'rgba(255, 68, 68, 0.9)' : 'rgba(76, 175, 80, 0.9)',
                        color: '#fff',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        zIndex: 100,
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        minWidth: '300px',
                        justifyContent: 'center'
                    }}>
                        {notification.type === 'error' ? <AlertTriangle size={20} /> : <Check size={20} />}
                        <span style={{ fontWeight: '500' }}>{notification.message}</span>
                    </div>
                )}

                {/* CONFIRM MODAL */}
                {confirmModal && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 200,
                        backdropFilter: 'blur(2px)'
                    }} onClick={(e) => {
                        if (e.target === e.currentTarget) setConfirmModal(null);
                    }}>
                        <div style={{
                            background: '#1a1a1a',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '24px',
                            width: '90%',
                            maxWidth: '400px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                        }}>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#fff' }}>{confirmModal.message}</h3>
                            {confirmModal.subtext && <p style={{ margin: '0 0 20px 0', color: 'var(--text-dim)', fontSize: '0.9rem' }}>{confirmModal.subtext}</p>}

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setConfirmModal(null)}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        background: 'transparent',
                                        color: 'var(--text-dim)',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmModal.onConfirm}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: 'var(--accent)',
                                        color: '#000',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketPanel;
