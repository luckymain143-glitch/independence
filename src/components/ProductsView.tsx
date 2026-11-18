import React, { useMemo, useState } from 'react';
import { Package, Search, X } from 'lucide-react';
import type { Product, ProductCategory } from '../types';
import type { AppRoute } from './Header';

interface ProductsViewProps {
  categories: ProductCategory[];
  products: Product[];
  onNavigate: (route: AppRoute) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  categories,
  products,
  onNavigate,
}) => {
  const [activeCat, setActiveCat] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const hasSampleProducts = products.some((p) => p.isSample);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (p.status !== 'published') return false;
      const catOk = activeCat === 'all' || p.categoryId === activeCat;
      const searchOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return catOk && searchOk;
    });
  }, [products, activeCat, search]);

  return (
    <div className="bg-slate-50 min-h-[75vh]">
      <div className="bg-white border-b border-slate-200 py-10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#EA580C] mb-2">
              FOOD &amp; BEVERAGE CATALOGUE
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0F2447] mb-2">
              Our FMCG Products
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Explore our 9 core food and beverage product categories engineered for retail velocity
              and Pan-India channel distribution.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or categories..."
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2447]"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-10 space-y-8">
        {hasSampleProducts && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-900">
            <strong>Configurable Sample Catalogue Notice:</strong> Representative sample SKUs are
            currently shown for catalogue demonstration. Authorized administrators can add, edit,
            publish, or remove official SKUs anytime from the Admin Dashboard.
          </div>
        )}

        {/* Category Segmented Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCat('all')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeCat === 'all'
                ? 'bg-[#0F2447] text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            All Categories ({products.filter((p) => p.status === 'published').length})
          </button>
          {categories
            .filter((c) => c.active)
            .map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCat(cat.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  activeCat === cat.id
                    ? 'bg-[#0F2447] text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
        </div>

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <Package className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No matching products found</h3>
            <p className="text-sm text-slate-600 mb-4">
              Try clearing your search filter or switching to another FMCG category.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCat('all');
                setSearch('');
              }}
              className="px-4 py-2 bg-[#0F2447] text-white text-xs font-semibold rounded-lg"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((prod) => (
              <div
                key={prod.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                    {prod.imageUrl ? (
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Package className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                      <span>{prod.categoryName}</span>
                      {prod.packSizes && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-tabular">{prod.packSizes}</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#0F2447] mb-2">
                      {prod.name}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {prod.description}
                    </p>
                  </div>
                </div>
                <div className="px-5 pb-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(prod)}
                    className="text-xs font-semibold text-[#0F2447] hover:text-[#EA580C]"
                  >
                    Product Specifications
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/opportunities/distributorship')}
                    className="text-xs font-semibold text-[#15803D] hover:underline"
                  >
                    Become a Distributor →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="font-display text-lg font-bold text-[#0F2447]">
                {selectedProduct.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                aria-label="Close product modal"
                className="p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selectedProduct.imageUrl && (
                <div className="aspect-[16/9] rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                <span>Category: {selectedProduct.categoryName}</span>
                {selectedProduct.packSizes && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Pack Sizes: {selectedProduct.packSizes}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span>Status: {selectedProduct.status}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {selectedProduct.description}
              </p>
              {selectedProduct.productInfo && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                  <strong>Product Information:</strong> {selectedProduct.productInfo}
                </div>
              )}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 border border-slate-300 text-xs font-semibold rounded-lg"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null);
                    onNavigate('/contact');
                  }}
                  className="px-4 py-2 bg-[#0F2447] text-white text-xs font-semibold rounded-lg"
                >
                  Enquire About This Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
