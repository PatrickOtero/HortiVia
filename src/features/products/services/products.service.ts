import { API_ENDPOINTS } from '../../../config/apiConfig';
import { apiClient } from '../../../services/api/apiClient';
import {
  toPaginatedProductsResponse,
  toProductDetail,
} from '../mappers/product.mapper';
import type {
  ListProductsParams,
  PaginatedResponse,
  ProductDetail,
  ProductListItem,
} from '../types/product';

export const PRODUCTS_PAGE_LIMIT = 20;

export const productsService = {
  async listProducts(
    params: ListProductsParams = {},
  ): Promise<PaginatedResponse<ProductListItem>> {
    const response = await apiClient.get(API_ENDPOINTS.products.list, {
      params,
    });

    return toPaginatedProductsResponse(response.data);
  },

  async getProductById(productId: string): Promise<ProductDetail> {
    const response = await apiClient.get(API_ENDPOINTS.products.detail(productId));

    return toProductDetail(response.data);
  },
};
