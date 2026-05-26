import { API_ENDPOINTS } from '../../../config/apiConfig';
import { apiClient } from '../../../services/api/apiClient';
import {
  buildMultipartFormData,
  buildSingleFileUploadFormData,
} from '../../../services/api/uploadFormData';
import type { ImageUploadFile } from '../../../utils/images/imagePicker';
import {
  toProductGuideImage,
  toProductGuideSectionPayload,
  toProductPayload,
  toProductImagePayload,
  toPaginatedProductsResponse,
  toFavoriteProductsResponse,
  toProductDetail,
  toSingleProductGuideSection,
} from '../mappers/product.mapper';
import type {
  CreateProductGuideSectionPayload,
  CreateProductImagePayload,
  FavoriteProductsResponse,
  CreateProductPayload,
  ListProductsParams,
  PaginatedResponse,
  ProductDetail,
  ProductGuideSection,
  ProductGuideImage,
  ProductListItem,
  UpdateProductGuideSectionPayload,
  UpdateProductImagePayload,
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

  async uploadProductImage(
    productId: string,
    file: ImageUploadFile,
  ): Promise<ProductDetail> {
    const response = await apiClient.post(
      API_ENDPOINTS.products.image(productId),
      buildSingleFileUploadFormData('image', file, 'product-image.jpg'),
    );

    return toProductDetail(response.data);
  },

  async deleteProduct(productId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.products.detail(productId));
  },

  async favoriteProduct(productId: string): Promise<{ message: string }> {
    const response = await apiClient.post(
      API_ENDPOINTS.products.favorite(productId),
    );

    return response.data;
  },

  async unfavoriteProduct(productId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(
      API_ENDPOINTS.products.favorite(productId),
    );

    return response.data;
  },

  async listFavoriteProducts(params?: {
    page?: number;
    limit?: number;
  }): Promise<FavoriteProductsResponse> {
    const response = await apiClient.get(API_ENDPOINTS.favorites.products, {
      params,
    });

    return toFavoriteProductsResponse(response.data);
  },

  async createProductImage(
    productId: string,
    payload: CreateProductImagePayload,
  ): Promise<ProductGuideImage> {
    const response = await apiClient.post(
      API_ENDPOINTS.products.images(productId),
      toProductImagePayload(payload),
    );

    return toProductGuideImage(response.data)!;
  },

  async updateProductImage(
    productId: string,
    imageId: string,
    payload: UpdateProductImagePayload,
  ): Promise<ProductGuideImage> {
    const response = await apiClient.patch(
      API_ENDPOINTS.products.imageDetail(productId, imageId),
      toProductImagePayload(payload),
    );

    return toProductGuideImage(response.data)!;
  },

  async deleteProductImage(productId: string, imageId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.products.imageDetail(productId, imageId));
  },

  async createProductImageWithUpload(
    productId: string,
    file: ImageUploadFile,
    payload: CreateProductImagePayload,
  ): Promise<ProductGuideImage> {
    const fields = {
      kind: payload.kind,
      alt: payload.alt,
      caption: payload.caption,
      sortOrder: payload.sortOrder,
      isPrimary: payload.isPrimary,
    };

    const response = await apiClient.post(
      API_ENDPOINTS.products.imagesUpload(productId),
      buildMultipartFormData({
        fileFieldName: 'image',
        file,
        fallbackFileName: 'product-gallery-image.jpg',
        fields,
      }),
    );

    return toProductGuideImage(response.data)!;
  },

  async replaceProductImageFile(
    productId: string,
    imageId: string,
    file: ImageUploadFile,
    payload: UpdateProductImagePayload = {},
  ): Promise<ProductGuideImage> {
    const fields = {
      kind: payload.kind,
      alt: payload.alt,
      caption: payload.caption,
      sortOrder: payload.sortOrder,
      isPrimary: payload.isPrimary,
    };

    const response = await apiClient.post(
      API_ENDPOINTS.products.imageFile(productId, imageId),
      buildMultipartFormData({
        fileFieldName: 'image',
        file,
        fallbackFileName: 'product-gallery-image.jpg',
        fields,
      }),
    );

    return toProductGuideImage(response.data)!;
  },

  async createProductGuideSection(
    productId: string,
    payload: CreateProductGuideSectionPayload,
  ): Promise<ProductGuideSection> {
    const response = await apiClient.post(
      API_ENDPOINTS.products.guideSections(productId),
      toProductGuideSectionPayload(payload),
    );

    return toSingleProductGuideSection(response.data)!;
  },

  async updateProductGuideSection(
    productId: string,
    sectionId: string,
    payload: UpdateProductGuideSectionPayload,
  ): Promise<ProductGuideSection> {
    const response = await apiClient.patch(
      API_ENDPOINTS.products.guideSectionDetail(productId, sectionId),
      toProductGuideSectionPayload(payload),
    );

    return toSingleProductGuideSection(response.data)!;
  },

  async deleteProductGuideSection(
    productId: string,
    sectionId: string,
  ): Promise<void> {
    await apiClient.delete(
      API_ENDPOINTS.products.guideSectionDetail(productId, sectionId),
    );
  },

  async uploadProductGuideSectionImage(
    productId: string,
    sectionId: string,
    file: ImageUploadFile,
  ): Promise<ProductGuideSection> {
    const response = await apiClient.post(
      API_ENDPOINTS.products.guideSectionImage(productId, sectionId),
      buildSingleFileUploadFormData('image', file, 'product-guide-section.jpg'),
    );

    return toSingleProductGuideSection(response.data)!;
  },

  async removeProductGuideSectionImage(
    productId: string,
    sectionId: string,
  ): Promise<ProductGuideSection> {
    const response = await apiClient.delete(
      API_ENDPOINTS.products.guideSectionImage(productId, sectionId),
    );

    return toSingleProductGuideSection(response.data)!;
  },
};
