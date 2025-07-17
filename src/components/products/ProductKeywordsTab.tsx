
import { Product } from "@/types/product";
import { KeywordsManager } from "./KeywordsManager";

interface ProductKeywordsTabProps {
  product: Product;
}

export const ProductKeywordsTab = ({ product }: ProductKeywordsTabProps) => {
  return <KeywordsManager productId={product.id} />;
};
