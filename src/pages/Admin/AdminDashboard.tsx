import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, Product, Workshop } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Calendar, TrendingUp, Users } from 'lucide-react';

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, workshopsData] = await Promise.all([
          api.getProducts(),
          api.getWorkshops(),
        ]);
        setProducts(productsData);
        setWorkshops(workshopsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    {
      name: 'Всего товаров',
      value: products.length,
      icon: Package,
      href: '/admin/products',
      color: 'text-primary',
    },
    {
      name: 'В наличии',
      value: products.filter(p => p.inStock).length,
      icon: TrendingUp,
      href: '/admin/products',
      color: 'text-green-600',
    },
    {
      name: 'Мастер-классов',
      value: workshops.length,
      icon: Calendar,
      href: '/admin/workshops',
      color: 'text-blue-600',
    },
    {
      name: 'Участников записано',
      value: workshops.reduce((sum, w) => sum + w.currentParticipants, 0),
      icon: Users,
      href: '/admin/workshops',
      color: 'text-purple-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-semibold text-foreground">Панель управления</h1>
        <p className="text-muted-foreground mt-2">Добро пожаловать в административную панель Feia</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.name} to={stat.href}>
            <Card className="pottery-card hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Items */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Последние товары</span>
              <Link to="/admin/products" className="text-sm text-primary hover:underline">
                Все товары →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {products.slice(0, 5).map((product) => (
                <li key={product.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  <p className="font-medium">{product.price.toLocaleString('ru-RU')} ₽</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Upcoming Workshops */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Ближайшие мастер-классы</span>
              <Link to="/admin/workshops" className="text-sm text-primary hover:underline">
                Все МК →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {workshops.slice(0, 5).map((workshop) => (
                <li key={workshop.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{workshop.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {workshop.date} • {workshop.time}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {workshop.currentParticipants}/{workshop.maxParticipants}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
