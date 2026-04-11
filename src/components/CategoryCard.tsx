import { Link } from 'react-router-dom';

interface CategoryCardProps {
  category: {
    name: string;
    href: string;
    image: string;
  };
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      to={`/catalog?category=${encodeURIComponent(category.name)}`}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg pottery-shadow mb-4">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <h3 className="font-sans text-pottery-sage font-medium text-center group-hover:text-pottery-sage-light transition-colors">
        {category.name}
      </h3>
    </Link>
  );
}