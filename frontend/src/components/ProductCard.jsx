export default function ProductCard({ product, onBuy }) {
  return (
    <div className="card">
      <img src="/cover.jpg" alt={product?.title || 'Cover'} />
      <div style={{ fontWeight: 700, marginTop: 6 }}>{product?.title}</div>
      <div style={{ fontSize: 12, opacity: .75, marginTop: 2 }}>SKU: {product?.sku}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <div style={{ fontWeight: 800 }}>{product?.price} RWF</div>
        <button className="btn" onClick={() => onBuy?.(product)}>Buy</button>
      </div>
    </div>
  )
}
 
