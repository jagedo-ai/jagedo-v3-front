/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAuthHeaders } from "@/utils/auth";

// Order Request Types
export interface OrderRequestData {
    orderType: string;
    skill: string;
    description: string;
    location: string;
    managedBy: string;
    startDate: string;
    endDate?: string;
    agreeToTerms: boolean;
    attachments: string[];
    customerNotes?: string;
}

export interface OrderRequestResponse {
    id: string;
    orderType: string;
    skill: string;
    description: string;
    location: string;
    managedBy: string;
    startDate: string;
    endDate?: string;
    status: string;
    amount?: number;
    attachments: string[];
    customerNotes?: string;
    createdAt: string;
    updatedAt: string;
}

// Get all order requests for Admin
export const getAdminOrderRequests = async (axiosInstance: any): Promise<any> => {
    try {
        const response = await axiosInstance.get(`${import.meta.env.VITE_SERVER_URL}/api/orders`, {
            headers: {
                Authorization: getAuthHeaders()
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch order requests");
    }
};

export const makeOrders = async (axiosInstance: any, data: any): Promise<any> => {
    try {
        const response = await axiosInstance.post(`${import.meta.env.VITE_SERVER_URL}/api/orders`, data, {
            headers: {
                Authorization: getAuthHeaders()
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch order requests");
    }
};

export const getOrderRequests = async (axiosInstance: any): Promise<any> => {
    try {
        const response = await axiosInstance.get(`${import.meta.env.VITE_SERVER_URL}/api/orders/customer`, {
            headers: {
                Authorization: getAuthHeaders()
            }
        });
        return response.data;
    } catch (error: any) {
        // Return empty fallback when backend is unavailable (e.g. mock/dev mode)
        console.warn("Could not fetch customer order requests:", error.message || error);
        return { success: true, hashSet: [] };
    }
};

export const RecallOrder = async (axiosInstance: any, id: string) => {
    try {
        const response = await axiosInstance.post(
            `${import.meta.env.VITE_SERVER_URL}/api/orders/${id}/recall`
        );
        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || "Failed to close job request"
        );
    }
};

export const updateStage = async (
    axiosInstance: any,
    id: string,
    stage: string
) => {
    try {
        const response = await axiosInstance.post(
            `${import.meta.env.VITE_SERVER_URL}/api/orders/${id}/stage`,
            {
                stage: stage
            }
        );
        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || "Failed to update stage"
        );
    }
};

//Post order admin notes
export const PostOrderAdminNotesandAttachments = async (axiosInstance: any, data: any, id: any): Promise<any> => {
    try {
        const response = await axiosInstance.post(`${import.meta.env.VITE_SERVER_URL}/api/orders/${id}/admin/add-notes`, data, {
            headers: {
                Authorization: getAuthHeaders()
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch order requests");
    }
};

export const getProviderOrderRequests = async (axiosInstance: any): Promise<any> => {
    try {
        const response = await axiosInstance.get(`${import.meta.env.VITE_SERVER_URL}/api/orders/service-provider`, {
            headers: {
                Authorization: getAuthHeaders()
            }
        });
        return response.data;
    } catch (error: any) {
        // Return empty fallback when backend is unavailable (e.g. mock/dev mode)
        console.warn("Could not fetch provider order requests:", error.message || error);
        return { success: true, hashSet: [] };
    }
};

export const getOrderRequestsById = async (axiosInstance: any, id: any): Promise<any> => {
    try {
        const response = await axiosInstance.get(`${import.meta.env.VITE_SERVER_URL}/api/orders/${id}`, {
            headers: {
                Authorization: getAuthHeaders()
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch order requests");
    }
};

export const getProvierOrderRequestsById = async (axiosInstance: any, id: any): Promise<any> => {
    try {
        const response = await axiosInstance.get(`${import.meta.env.VITE_SERVER_URL}/api/orders/${id}/providers`, {
            headers: {
                Authorization: getAuthHeaders()
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch order requests");
    }
};

export const assignOrderToProviders = async (axiosInstance: any, orderId: string, providerIds: string[]): Promise<any> => {
    try {
        const response = await axiosInstance.post(
            `${import.meta.env.VITE_SERVER_URL}/api/orders/${orderId}/assign-providers`,
            { providerIds },
            {
                headers: {
                    Authorization: getAuthHeaders()
                }
            }
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to assign order to providers");
    }
};