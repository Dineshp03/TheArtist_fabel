import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import ProductDetailClient from './ProductDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (!product) {
    return {
      title: 'Product Not Found | Fabel',
      description: 'The requested product could not be found.',
    };
  }

  return {
    title: `${product.name} | Fabel`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Fabel`,
      description: product.description,
      url: `https://fabel.com/products/${product.id}`,
      images: [
        {
          url: product.img,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Fabel`,
      description: product.description,
      images: [product.img],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  // If the product exists, inject Schema.org structured data 
  let jsonLd = null;
  if (product) {
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.images && product.images.length > 0 ? product.images : [product.img],
      description: product.description,
      brand: {
        '@type': 'Brand',
        name: 'Fabel',
      },
      offers: {
        '@type': 'Offer',
        url: `https://fabel.com/products/${product.id}`,
        priceCurrency: 'INR',
        price: product.price,
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
    };
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailClient />
    </>
  );
}
