import { NewProduct, Product } from "../../domain/entities/Product";
import { ProductDataSource } from "./ProductDataSource";

export class MockProductDataSource implements ProductDataSource {
  async getProducts(): Promise<Product[]> {
    return [];
  }

  async getProductById(_id: string): Promise<Product | undefined> {
    return undefined;
  }

  async addProduct(_product: NewProduct): Promise<void> {}

  async updateProduct(_product: Product): Promise<void> {}

  async deleteProduct(_id: string): Promise<void> {}
}