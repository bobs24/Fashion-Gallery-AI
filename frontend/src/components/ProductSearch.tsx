import React, { useState, useRef, useMemo } from 'react';
import type { EnrichedProduct } from '../types';
import ProductCard from './ProductCard';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface ProductSearchProps {
  products: EnrichedProduct[];
  onProductSelect: (product: EnrichedProduct) => void;
}

const PAGE_SIZE = 30;

const ALLOWED_CATEGORIES = ['Bags', 'Clothes', 'Shoes'];
const ALLOWED_GENDERS = ['Men', 'Women'];

const getUniqueFilterOptions = (products: EnrichedProduct[], key: keyof EnrichedProduct) => {
    const allValues = products.map(p => p[key]).filter(Boolean) as string[];
    let uniqueValues = [...new Set(allValues)];

    if (key === 'CATEGORY') {
        uniqueValues = uniqueValues.filter(category => ALLOWED_CATEGORIES.includes(category));
    } 
    // --- MODIFIED: Also ensure the gender dropdown only shows Man and Woman ---
    else if (key === 'PRODUCT_GENDER') {
        uniqueValues = uniqueValues.filter(gender => ALLOWED_GENDERS.includes(gender));
    }

    return uniqueValues.sort();
};

const FilterSelect: React.FC<{ label: string; value: string; options: string[]; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; }> = ({ label, value, options, onChange }) => (
    <div className="flex flex-col">
        <label htmlFor={`filter-${label}`} className="text-xs text-[var(--color-text-secondary)] mb-1">{label}</label>
        <select
            id={`filter-${label}`}
            value={value}
            onChange={onChange}
            className="bg-[var(--color-panel)] border border-[var(--color-panel-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        >
            <option value="">All</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const ProductSearch: React.FC<ProductSearchProps> = ({ products, onProductSelect }) => {
  const [page, setPage] = useState(0);
  const topRef = useRef<HTMLHeadingElement>(null);

  const [filters, setFilters] = useState({
    BRAND_NAME: '',
    CATEGORY: '',
    SUBCATEGORY: '',
    PRODUCT_GENDER: '',
  });

  const filterOptions = useMemo(() => {
      // 1. Create a base list of products that are within the allowed categories and genders.
      const baseProducts = products
          .filter(p => p.CATEGORY && ALLOWED_CATEGORIES.includes(p.CATEGORY))
          .filter(p => p.PRODUCT_GENDER && ALLOWED_GENDERS.includes(p.PRODUCT_GENDER));

      // 2. Generate all unique options from this pre-filtered base list.
      // This ensures that Brand and Sub-Category options are already relevant.
      return {
          BRAND_NAME: getUniqueFilterOptions(baseProducts, 'BRAND_NAME'),
          CATEGORY: getUniqueFilterOptions(baseProducts, 'CATEGORY'),
          SUBCATEGORY: getUniqueFilterOptions(baseProducts, 'SUBCATEGORY'),
          PRODUCT_GENDER: getUniqueFilterOptions(baseProducts, 'PRODUCT_GENDER'),
      };
  }, [products]);

  const handleFilterChange = (filterName: keyof typeof filters) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters(prev => ({ ...prev, [filterName]: e.target.value }));
      setPage(0); // Reset to first page on filter change
  };

  const resetFilters = () => {
    setFilters({ BRAND_NAME: '', CATEGORY: '', SUBCATEGORY: '', PRODUCT_GENDER: '' });
    setPage(0);
  };

  const filteredProducts = useMemo(() => {
    let prods = products;

    // First, pre-filter the entire product list to only include allowed items.
    prods = prods.filter(product => product.CATEGORY && ALLOWED_CATEGORIES.includes(product.CATEGORY));
    // --- MODIFIED: Added gender pre-filter ---
    prods = prods.filter(product => product.PRODUCT_GENDER && ALLOWED_GENDERS.includes(product.PRODUCT_GENDER));
    
    // Then, apply the user's selected filters on top of that.
    if (Object.values(filters).some(f => f !== '')) {
        prods = prods.filter(product => {
            return (
                (filters.BRAND_NAME === '' || product.BRAND_NAME === filters.BRAND_NAME) &&
                (filters.CATEGORY === '' || product.CATEGORY === filters.CATEGORY) &&
                (filters.SUBCATEGORY === '' || product.SUBCATEGORY === filters.SUBCATEGORY) &&
                (filters.PRODUCT_GENDER === '' || product.PRODUCT_GENDER === filters.PRODUCT_GENDER)
            );
        });
    }
    return prods;
  }, [products, filters]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const displayedProducts = filteredProducts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };
 
  return (
    <section className="text-center">
      <h2 ref={topRef} className="text-3xl font-light tracking-wider mb-2 scroll-mt-8">Our Curated Collection</h2>
      <p className="text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">Browse our selection, or use the filters to find exactly what you're looking for.</p>
      
      <div className="sticky top-0 z-10 bg-[var(--color-background)] py-4 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl mx-auto items-end">
            <FilterSelect label="Brand" value={filters.BRAND_NAME} options={filterOptions.BRAND_NAME} onChange={handleFilterChange('BRAND_NAME')} />
            <FilterSelect label="Category" value={filters.CATEGORY} options={filterOptions.CATEGORY} onChange={handleFilterChange('CATEGORY')} />
            <FilterSelect label="Sub-Category" value={filters.SUBCATEGORY} options={filterOptions.SUBCATEGORY} onChange={handleFilterChange('SUBCATEGORY')} />
            <FilterSelect label="Gender" value={filters.PRODUCT_GENDER} options={filterOptions.PRODUCT_GENDER} onChange={handleFilterChange('PRODUCT_GENDER')} />
            <button
                onClick={resetFilters}
                className="col-span-2 lg:col-span-1 bg-transparent border border-[var(--color-panel-border)] rounded-md px-3 py-2 text-sm hover:border-[var(--color-accent)]"
            >
                Reset Filters
            </button>
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
            <p className="text-lg font-semibold">No products match your criteria</p>
            <p className="text-[var(--color-text-secondary)] mt-2">Try adjusting or resetting your filters.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 min-h-[500px]">
        {displayedProducts.map((product) => (
          <ProductCard key={product.product_id} product={product} onSelect={onProductSelect} />
        ))}
      </div>
      
      {filteredProducts.length > PAGE_SIZE && (
        <div className="flex justify-center items-center gap-6 mt-12">
          <button onClick={() => handlePageChange(page - 1)} disabled={page === 0} className="p-2 rounded-full bg-[var(--color-panel)] border border-[var(--color-panel-border)] hover:border-[var(--color-accent)] disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Previous page">
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <span className="text-[var(--color-text-secondary)] font-medium">Page {page + 1} of {totalPages}</span>
          <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1} className="p-2 rounded-full bg-[var(--color-panel)] border border-[var(--color-panel-border)] hover:border-[var(--color-accent)] disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Next page">
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductSearch;