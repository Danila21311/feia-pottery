import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { ProductCard } from '@/components/Shop/ProductCard';
import { Product } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import productsData from '@/data/products.json';

export default function Catalog() {
  const products = productsData as Product[];
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showOnlyNew, setShowOnlyNew] = useState(false);

  // Handle URL parameters on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [location.search]);

  const categories = Array.from(new Set(products.map(p => p.category)));
  
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // New products filter
    if (showOnlyNew) {
      filtered = filtered.filter(product => product.isNew);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'new':
          return Number(b.isNew) - Number(a.isNew);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy, showOnlyNew]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold mb-4">Каталог керамики</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Откройте для себя уникальные изделия ручной работы, созданные с любовью и вниманием к деталям
        </p>
      </div>

      {/* Filters */}
      <div className="bg-secondary/50 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Поиск по каталогу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Все категории" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">По названию</SelectItem>
              <SelectItem value="price-low">Сначала дешевые</SelectItem>
              <SelectItem value="price-high">Сначала дорогие</SelectItem>
              <SelectItem value="new">Сначала новинки</SelectItem>
            </SelectContent>
          </Select>

          {/* New Products Toggle */}
          <Button
            variant={showOnlyNew ? "default" : "outline"}
            onClick={() => setShowOnlyNew(!showOnlyNew)}
            className="sage-gradient"
          >
            <Filter className="w-4 h-4 mr-2" />
            Только новинки
          </Button>
        </div>

        {/* Active Filters */}
        {(selectedCategory || showOnlyNew || searchQuery) && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Активные фильтры:</span>
            {selectedCategory && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedCategory('')}
                className="text-xs h-7"
              >
                {selectedCategory} ×
              </Button>
            )}
            {showOnlyNew && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowOnlyNew(false)}
                className="text-xs h-7"
              >
                Новинки ×
              </Button>
            )}
            {searchQuery && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="text-xs h-7"
              >
                "{searchQuery}" ×
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏺</div>
          <h3 className="text-xl font-serif font-semibold mb-2">Товары не найдены</h3>
          <p className="text-muted-foreground mb-6">
            Попробуйте изменить параметры поиска или фильтры
          </p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
              setShowOnlyNew(false);
              setSortBy('name');
            }}
            variant="outline"
          >
            Очистить все фильтры
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">
              Найдено {filteredAndSortedProducts.length} {
                filteredAndSortedProducts.length === 1 ? 'товар' :
                filteredAndSortedProducts.length < 5 ? 'товара' : 'товаров'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}