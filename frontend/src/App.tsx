import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductSearch from './components/ProductSearch';
import VirtualTryOn from './components/VirtualTryOn';
import SystemArchitecture from './components/SystemArchitecture';
import type { EnrichedProduct } from './types';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<EnrichedProduct | null>(null);
  const [showArchitecture, setShowArchitecture] = useState(false);
  const [allProducts, setAllProducts] = useState<EnrichedProduct[]>([]);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [appError, setAppError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsAppLoading(true);
      setAppError(null);
      try {
        const response = await fetch('/api/products'); 

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Server responded with status: ${response.status}`);
        }

        const enrichedProducts: EnrichedProduct[] = await response.json();

        if (!enrichedProducts || enrichedProducts.length === 0) {
          setAppError("No product data returned from the server. Please check the backend connection and ensure the services are running correctly.");
          return;
        }
        
        setAllProducts(enrichedProducts);

      } catch (err: any) {
        console.error("Failed to load product data:", err);
        setAppError(`Failed to load product data: ${err.message}. Please check your backend logs for more details.`);
      } finally {
        setIsAppLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleProductSelect = (product: EnrichedProduct) => {
    setSelectedProduct(product);
  };

  const handleBackToSearch = () => {
    setSelectedProduct(null);
  };

  if (isAppLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-background)] text-[var(--color-text-primary)]">
          <Spinner />
          <p className="mt-4 text-lg">Loading Fashion Gallery...</p>
      </div>
    );
  }

  if (appError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-background)] text-[var(--color-text-primary)]">
            <div className="text-red-400 bg-red-900/50 p-6 rounded-lg text-center max-w-lg border border-red-800">
              <h2 className="font-bold text-xl mb-2">Application Error</h2>
              <p>{appError}</p>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] font-sans">
      <Header />
      <main className="container mx-auto px-4 py-12">
        {!selectedProduct ? (
          <ProductSearch
            products={allProducts}
            onProductSelect={handleProductSelect}
          />
        ) : (
          <VirtualTryOn
            product={selectedProduct}
            allProducts={allProducts}
            onBack={handleBackToSearch}
          />
        )}
      </main>
      <footer className="text-center py-8 text-[var(--color-text-secondary)] text-sm border-t border-[var(--color-panel-border)] mt-12">
        <p>Powered by Gemini, Supabase, and Metabase.</p>
        <button
          onClick={() => setShowArchitecture(true)}
          className="mt-4 text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
          aria-label="View System Architecture diagram"
        >
          View System Architecture
        </button>
      </footer>

      {showArchitecture && <SystemArchitecture onClose={() => setShowArchitecture(false)} />}
    </div>
  );
};

export default App;