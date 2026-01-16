import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingBag, ExternalLink, Star } from 'lucide-react';

interface AffiliateProduct {
  id: string;
  product_name: string;
  product_url: string;
  partner_name: string | null;
}

interface AffiliateProductsDisplayProps {
  contentId: string;
}

const AffiliateProductsDisplay = ({ contentId }: AffiliateProductsDisplayProps) => {
  const { language } = useLanguage();
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('affiliate_links')
          .select('id, product_name, product_url, partner_name')
          .eq('content_id', contentId)
          .eq('is_active', true);

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error loading affiliate products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [contentId]);

  const handleProductClick = async (product: AffiliateProduct) => {
    // Track click - increment manually
    try {
      const { data } = await supabase
        .from('affiliate_links')
        .select('click_count')
        .eq('id', product.id)
        .single();
      
      if (data) {
        await supabase
          .from('affiliate_links')
          .update({ click_count: (data.click_count || 0) + 1 })
          .eq('id', product.id);
      }
    } catch (error) {
      // Silent fail for tracking
    }
    
    // Open product URL
    window.open(product.product_url, '_blank');
  };

  if (isLoading || products.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border-indigo-100">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-black">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          {language === 'hu' ? 'Szakértő Ajánlott Eszközök' : 'Expert Recommended Gear'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-3 pb-2">
            {products.map((product) => (
              <Button
                key={product.id}
                variant="outline"
                onClick={() => handleProductClick(product)}
                className="flex-shrink-0 h-auto py-3 px-4 border-indigo-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-indigo-600" />
                  <div className="text-left">
                    <p className="font-medium text-black text-sm whitespace-normal max-w-[150px]">
                      {product.product_name}
                    </p>
                    {product.partner_name && (
                      <Badge variant="secondary" className="text-xs mt-1 bg-indigo-100 text-indigo-700">
                        {product.partner_name}
                      </Badge>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-black/40" />
                </div>
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <p className="text-xs text-black/40 mt-2">
          {language === 'hu' 
            ? '💡 A szakértő által ajánlott termékek a programhoz'
            : '💡 Products recommended by the expert for this program'}
        </p>
      </CardContent>
    </Card>
  );
};

export default AffiliateProductsDisplay;
