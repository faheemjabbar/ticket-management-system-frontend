import { useState, useCallback } from 'react';
import { ticketAPI, type Ticket } from '@/lib/api';
import { handleApiError } from '@/utils/errorHandler';

/**
 * Custom hook for ticket data management
 * Centralizes all ticket-related API calls
 */
export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = useCallback(async (options?: { limit?: number; projectId?: string }) => {
    try {
      setLoading(true);
      const response = await ticketAPI.getAll(options || { limit: 100 });
      setTickets(response.tickets);
      return response.tickets;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTicketById = useCallback(async (ticketId: string) => {
    try {
      setLoading(true);
      const ticket = await ticketAPI.getById(ticketId);
      return ticket;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTicket = useCallback(async (ticketData: any) => {
    try {
      const newTicket = await ticketAPI.create(ticketData);
      setTickets(prev => [...prev, newTicket]);
      return newTicket;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }, []);

  const updateTicket = useCallback(async (ticketId: string, ticketData: any) => {
    try {
      const updatedTicket = await ticketAPI.update(ticketId, ticketData);
      setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
      return updatedTicket;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }, []);

  const deleteTicket = useCallback(async (ticketId: string) => {
    try {
      await ticketAPI.delete(ticketId);
      setTickets(prev => prev.filter(t => t.id !== ticketId));
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }, []);

  return {
    tickets,
    loading,
    fetchTickets,
    fetchTicketById,
    createTicket,
    updateTicket,
    deleteTicket,
  };
}
