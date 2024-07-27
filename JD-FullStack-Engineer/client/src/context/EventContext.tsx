import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Event, EventResponse, Filter, Params } from '../types';
import { fetchEventsApi, fetchStatsApi } from '../utils/api';
import { ChartDataPoint } from '../types';


interface EventContextValue {
  events: Event[];
  fetchEvents: (params?: Params) => Promise<void>;
  totalPages: number;
  currentPage: number;
  filterValue: Filter;
  setFilterValue: (filter: Filter) => void;
  setCurrentPage: (page: number) => void;
  stats: ChartDataPoint[];
}

export const EventContext = createContext<EventContextValue>({
  events: [],
  fetchEvents: async () => { },
  totalPages: 0,
  currentPage: 1,
  filterValue: {},
  setFilterValue: () => { },
  setCurrentPage: () => { },
  stats: [],
});

interface EventProviderProps {
  children: React.ReactNode;
}

const EventProvider: React.FC<EventProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<ChartDataPoint[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filterValue, setFilterValue] = useState<Filter>({});

  const fetchEvents = useCallback(async (params: Params = {}) => {
    setIsLoading(true);
    try {
      const { page, limit, sortBy, sortOrder, filter } = params;
      const newParams = {
        page: page ?? currentPage,
        limit: limit ?? 10,
        sortBy: sortBy ?? 'createdAt',
        sortOrder: sortOrder ?? 'desc',
        filter: { ...filterValue, ...filter },
      };
      const data: EventResponse = await fetchEventsApi(newParams);
      setEvents(data.events);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filterValue]);

  const fetchStats = useCallback(async () => {
    try {
      const { stats } = await fetchStatsApi(filterValue);
      const data = stats.map((stat) => {
        const [field, value] = Object.values(stat);
        return { name: field as string, value: parseInt(value as string) };
      });
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  }, [filterValue]);

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, [fetchEvents, fetchStats]);

  useEffect(() => {
    fetchEvents({ filter: filterValue });
    fetchStats();
  }, [filterValue, fetchEvents, fetchStats]);

  useEffect(() => {
    fetchEvents({ page: currentPage });
  }, [currentPage, fetchEvents]);

  return (
    <EventContext.Provider
      value={{
        events,
        fetchEvents,
        totalPages,
        currentPage,
        filterValue,
        setFilterValue,
        setCurrentPage,
        stats,
      }}
    >
      {isLoading ? <div>Loading...</div> : children}
    </EventContext.Provider>
  );
};

export default EventProvider;
