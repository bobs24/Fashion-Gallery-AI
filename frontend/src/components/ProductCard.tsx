
import React from 'react';
import type { EnrichedProduct } from '../types';

interface ProductCardProps {
  product: EnrichedProduct;
  onSelect: (product: EnrichedProduct) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(product)}
      className="group flex flex-col overflow-hidden rounded-lg bg-[var(--color-panel)] cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/50 animate-fade-in"
      role="button"
      aria-label={`Select product ${product.PRODUCT_NAME || product.product_id} for virtual try-on`}
    >
      <div className="relative">
        <img
          src={product.product_url}
          alt={product.PRODUCT_NAME || `Product ${product.product_id}`}
          className="w-full h-80 object-cover object-center"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white font-semibold tracking-wider border-2 border-white px-4 py-2 rounded-sm">
            Try On
          </span>
        </div>
      </div>
      <div className="p-4 text-left flex-grow flex flex-col">
        <h3 className="font-bold text-sm uppercase truncate text-[var(--color-text-primary)]">{product.BRAND_NAME || 'Unknown Brand'}</h3>
        <p className="text-sm mt-1 truncate text-[var(--color-text-primary)] flex-grow">{product.PRODUCT_NAME || 'Unnamed Product'}</p>
        <p className="text-xs mt-2 text-[var(--color-text-secondary)]">{product.SUBCATEGORY || 'General'}</p>
      </div>
    </div>
  );
};

export default ProductCard;
