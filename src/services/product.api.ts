import api from "@/lib/api";
import { mutate } from "swr";

export interface Product {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  category?: string | null;
  unitPrice?: number | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
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
  image?: File;
}

export interface UpdateProductData {
  name?: string;
  code?: string;
  description?: string | null;
  category?: string | null;
  unitPrice?: number | null;
  isActive?: boolean;
  image?: File;
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
    const formData = new FormData();
    
    // Add text fields (backend expects these)
    formData.append('name', data.name);
    formData.append('code', data.code);
    if (data.description !== undefined) formData.append('description', data.description ?? '');
    if (data.category !== undefined) formData.append('category', data.category ?? '');
    // Only send unitPrice if it has a valid value (not null/undefined)
    if (data.unitPrice !== undefined && data.unitPrice !== null) {
      formData.append('unitPrice', data.unitPrice.toString());
    }
    
    // Add image if provided (handled by multer middleware)
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await api.post<ProductResponse>("/api/products", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    await mutate('/api/products');
    return response.data;
  },

  async update(id: number, data: UpdateProductData): Promise<ProductResponse> {
    const formData = new FormData();
    
    // Add text fields (backend expects these)
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.code !== undefined) formData.append('code', data.code);
    if (data.description !== undefined) formData.append('description', data.description ?? '');
    if (data.category !== undefined) formData.append('category', data.category ?? '');
    // Only send unitPrice if it has a valid value (not null/undefined)
    if (data.unitPrice !== undefined && data.unitPrice !== null) {
      formData.append('unitPrice', data.unitPrice.toString());
    }
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());
    
    // Add image if provided (handled by multer middleware)
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await api.put<ProductResponse>(`/api/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    await mutate('/api/products');
    return response.data;
  },

  async toggleStatus(id: number): Promise<ProductResponse> {
    const response = await api.patch<ProductResponse>(`/api/products/${id}/toggle-status`);
    await mutate('/api/products');
    return response.data;
  },

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(`/api/products/${id}`);
    await mutate('/api/products');
    return response.data;
  },

  async deleteImage(id: number): Promise<ProductResponse> {
    const response = await api.delete<ProductResponse>(`/api/products/${id}/image`);
    await mutate('/api/products');
    return response.data;
  },
};
