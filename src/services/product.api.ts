import api from "@/lib/api";
import { mutate } from "swr";

export interface Product {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  category?: string | null;
  unitPrice?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceRecord {
  id: number;
  date: string;
  quantity: number;
  qualityScore: number;
  worker: {
    id: number;
    name: string;
  };
  productionLine: {
    id: number;
    name: string;
  };
}

export interface ProductWithPerformance extends Product {
  performanceRecords?: PerformanceRecord[];
}

export interface ProductResponse {
  success: boolean;
  message?: string;
  product: ProductWithPerformance;
}

export interface ProductListResponse {
  success: boolean;
  products: Product[];
}

export interface CreateProductData {
  name: string;
  code: string;
  description?: string | null;
  category?: string | null;
  unitPrice?: number | null;
}

export interface UpdateProductData {
  name?: string;
  code?: string;
  description?: string | null;
  category?: string | null;
  unitPrice?: number | null;
  isActive?: boolean;
}

export const productApi = {
  async getAll(): Promise<ProductListResponse> {
    const response = await api.get<ProductListResponse>("/api/products");
    return response.data;
  },

  async getById(id: number): Promise<ProductResponse> {
    const response = await api.get<ProductResponse>(`/api/products/${id}`);
    return response.data;
  },

  async create(data: CreateProductData): Promise<ProductResponse> {
    const response = await api.post<ProductResponse>("/api/products", data);
    await mutate('/api/products');
    return response.data;
  },

  async update(id: number, data: UpdateProductData): Promise<ProductResponse> {
    const response = await api.put<ProductResponse>(`/api/products/${id}`, data);
    await mutate('/api/products');
    return response.data;
  },

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(`/api/products/${id}`);
    await mutate('/api/products');
    return response.data;
  },
};
