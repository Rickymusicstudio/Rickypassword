import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import ProductCard from '../components/ProductCard.jsx'

export default function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const prods = await api.products()
        setProducts(Array.isArray(prods) ? prods : [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    })()
  }, [])

  const handleBuy = async (product) => {
    try {
      const order = await api.checkoutDev({ sku: product.sku })
      alert(`Dev checkout OK. order_id: ${order?.order_id || 'N/A'}`)
      // TODO: redirect to success and trigger secure download
    } catch (e) {
      console.error(e)
      alert('Checkout failed in dev mode.')
    }
  }

  return (
    <section className="container" style={{ padding: '64px 0' }}>
      <h1 className="h2" style={{ color: '#fff', marginBottom: 24 }}>Shop</h1>
      {loading ? (
        <div style={{ opacity: .75 }}>Loading…</div>
      ) : (
        <div className="shop-grid">
          {products.map(p => <ProductCard key={p.sku} product={p} onBuy={handleBuy} />)}
        </div>
      )}
    </section>
  )
}
 
