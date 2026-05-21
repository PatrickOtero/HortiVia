import { API_ENDPOINTS } from '../../../config/apiConfig';
import { apiClient } from '../../../services/api/apiClient';
import {
  toProductPayload,
  toPaginatedProductsResponse,
  toProductDetail,
} from '../mappers/product.mapper';
import type {
  CreateProductPayload,
  ListProductsParams,
  PaginatedResponse,
  ProductDetail,
  ProductListItem,
  UpdateProductPayload,
} from '../types/product';

export const PRODUCTS_PAGE_LIMIT = 20;

export const productsService = {
  async getProducts(
    params: ListProductsParams = {},
  ): Promise<PaginatedResponse<ProductListItem>> {
    const response = await apiClient.get(API_ENDPOINTS.products.list, {
      params,
    });

    return toPaginatedProductsResponse(response.data);
  },

  async listProducts(
    params: ListProductsParams = {},
  ): Promise<PaginatedResponse<ProductListItem>> {
    return this.getProducts(params);
  },

  async getProductById(productId: string): Promise<ProductDetail> {
    const response = await apiClient.get(API_ENDPOINTS.products.detail(productId));

    return toProductDetail(response.data);
  },

  async createProduct(payload: CreateProductPayload): Promise<ProductDetail> {
    const response = await apiClient.post(
      API_ENDPOINTS.products.list,
      toProductPayload(payload),
    );

    return toProductDetail(response.data);
  },

  async updateProduct(
    productId: string,
    payload: UpdateProductPayload,
  ): Promise<ProductDetail> {
    const response = await apiClient.patch(
      API_ENDPOINTS.products.detail(productId),
      toProductPayload({
        ...payload,
        name: payload.name ?? '',
        category: payload.category ?? 'FRUIT',
        shortDescription: payload.shortDescription ?? '',
      }),
    );

    return toProductDetail(response.data);
  },

  async deleteProduct(productId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.products.detail(productId));
  },
};
