import { useState, useCallback, useRef } from 'react';
import { ticketAPI, type Ticket } from '@/lib/api';
import { handleApiError } from '@/utils/errorHandler';
import { cache, CACHE_KEYS } from '@/lib/cache';

/**
 * Custom hook for ticket data management with centralized caching
 * Prevents duplicate API calls and improves performance
 */
export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false);

  const fetchTickets = useCallback(async (options?: { limit?: number; projectId?: string }, forceRefresh = false) => {
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh) {
      const cached = cache.get<Ticket[]>(CACHE_KEYS.TICKETS);
      if (cached) {
        setTickets(cached);
        return cached;
      }
    }

    // Prevent duplicate simultaneous requests
    if (fetchingRef.current) {
      return tickets;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      const response = await ticketAPI.getAll(options || { limit: 100 });
      
      // Update cache
      cache.set(CACHE_KEYS.TICKETS, response.tickets);
      
      setTickets(response.tickets);
      return response.tickets;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [tickets]);

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
      cache.invalidate(CACHE_KEYS.TICKETS);
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
      cache.invalidate(CACHE_KEYS.TICKETS);
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
      cache.invalidate(CACHE_KEYS.TICKETS);
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
