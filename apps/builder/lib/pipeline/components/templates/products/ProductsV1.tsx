import React from 'react';

interface Product {
  name: string;
  price: number;
  description?: string;
  image_url?: string;
}

interface ProductsV1Props {
  title: string;
  products: Product[];
  styleTokens: {
    primary_color: string;
    card_style: 'shadow' | 'border' | 'flat';
  };
}

export default function ProductsV1({ title, products, styleTokens }: ProductsV1Props) {
  const cardClass = `product-card card-${styleTokens.card_style || 'shadow'}`;
  return (
    <section id="products" className="products-v1">
      <h2>{title}</h2>
      <div className="product-grid">
        {products.map((p, idx) => (
          <div key={idx} className={cardClass}>
            <img src={p.image_url || 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=400&q=80'} alt={p.name} className="product-image" />
            <h3 className="product-name">{p.name}</h3>
            {p.description && <p className="product-description">{p.description}</p>}
            <p className="product-price">₹{p.price.toLocaleString()}</p>
            <button className="add-to-cart" data-name={p.name} data-price={p.price}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
