import { NewProduct, Product } from "../entities/Product";
import { ProductRepository } from "../repositories/ProductRepository";

/** Product operations used by the products presentation layer. */
export class ProductUseCases {
  constructor(private readonly repository: ProductRepository) {}

  getProducts(): Promise<Product[]> {
    return this.repository.getProducts();
  }

  forceRefresh(): Promise<Product[]> {
    return this.repository.forceRefresh();
  }

  getProductById(id: string): Promise<Product | undefined> {
    return this.repository.getProductById(id);
  }

  addProduct(product: NewProduct): Promise<void> {
    return this.repository.addProduct(product);
  }

  updateProduct(product: Product): Promise<void> {
    return this.repository.updateProduct(product);
  }

  deleteProduct(id: string): Promise<void> {
    return this.repository.deleteProduct(id);
  }
}
