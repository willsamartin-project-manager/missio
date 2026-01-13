import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Contact {
    id: string;
    name: string;
    phone: string;
    address: string;
    spiritualStatus: 'Curioso' | 'Aberto' | 'Decidido' | '';
    observation: string;
}

export interface EventResult {
    approachedCount: number;
    collaboratorCount: number;
    decisionsCount: number;
    contacts: Contact[];
    notes: string;
    feedbackPositive: string;
    feedbackImprove: string;
}

export interface Event {
    id: string;
    what: string;
    why: string;
    where: string;
    when: string;
    who: string;
    how: string;
    howMuch: string;
    congregation: string;
    status: 'planned' | 'in-progress' | 'completed';
    result?: EventResult;
    loading?: boolean;
}

export const useEvents = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const { profile, isAdmin, loading: authLoading } = useAuth();

    const fetchEvents = useCallback(async () => {
        if (authLoading) return;

        setLoading(true);
        try {
            // Start building the query
            let query = supabase
                .from('events')
                .select('*')
                .order('created_at', { ascending: false });

            // Apply filter for non-admins
            if (!isAdmin && profile?.congregation) {
                query = query.eq('congregation', profile.congregation);
            }

            // Fetch events
            const { data: eventsData, error: eventsError } = await query;

            if (eventsError) throw eventsError;

            // If user is not admin and has no congregation, they shouldn't see any events (or maybe all? assuming restricted)
            // But if they are just registered and 'pending', they might not have a congregation set yet?
            // The registration flow enforces congregation selection now.

            if (!eventsData) {
                setEvents([]);
                return;
            }

            // Fetch contacts for all events (could be optimized, but fine for POC)
            const { data: contactsData, error: contactsError } = await supabase
                .from('contacts')
                .select('*');

            if (contactsError) throw contactsError;

            // Map DB snake_case to TS camelCase
            const mappedEvents: Event[] = eventsData.map((e: any) => {
                const eventContacts = contactsData?.filter((c: any) => c.event_id === e.id).map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    phone: c.phone || '',
                    address: c.address || '',
                    spiritualStatus: c.spiritual_status || '',
                    observation: c.observation || ''
                })) || [];

                const result: EventResult | undefined = e.status === 'completed' ? {
                    approachedCount: e.approached_count || 0,
                    collaboratorCount: e.collaborator_count || 0,
                    decisionsCount: e.decisions_count || 0,
                    contacts: eventContacts,
                    notes: e.result_notes || '',
                    feedbackPositive: e.feedback_positive || '',
                    feedbackImprove: e.feedback_improve || ''
                } : undefined;

                return {
                    id: e.id,
                    what: e.what,
                    why: e.why,
                    where: e.where,
                    when: e.when,
                    who: e.who,
                    how: e.how || '',
                    howMuch: e.how_much || '',
                    congregation: e.congregation || '',
                    status: e.status as 'planned' | 'in-progress' | 'completed',
                    result
                };
            });

            setEvents(mappedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    }, [profile, isAdmin, authLoading]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const addEvent = async (event: Omit<Event, 'id' | 'status'>) => {
        try {
            const { error } = await supabase
                .from('events')
                .insert([{
                    what: event.what,
                    why: event.why,
                    where: event.where,
                    when: event.when,
                    who: event.who,
                    how: event.how,
                    how_much: event.howMuch,
                    congregation: event.congregation,
                    status: 'planned'
                }]);

            if (error) throw error;
            await fetchEvents(); // Refresh list
        } catch (error) {
            console.error('Error adding event:', error);
            throw error;
        }
    };

    const addResult = async (eventId: string, result: EventResult) => {
        try {
            // Update event result fields
            const { error: eventError } = await supabase
                .from('events')
                .update({
                    status: 'completed',
                    approached_count: result.approachedCount,
                    collaborator_count: result.collaboratorCount,
                    decisions_count: result.decisionsCount,
                    result_notes: result.notes,
                    feedback_positive: result.feedbackPositive,
                    feedback_improve: result.feedbackImprove
                })
                .eq('id', eventId);

            if (eventError) throw eventError;

            // Handle contacts: simpler to delete old references for this event and insert new ones
            const { error: deleteError } = await supabase.from('contacts').delete().eq('event_id', eventId);
            if (deleteError) throw deleteError;

            // Insert all current contacts
            if (result.contacts.length > 0) {
                const contactsToInsert = result.contacts.map(c => ({
                    event_id: eventId,
                    name: c.name,
                    phone: c.phone,
                    address: c.address,
                    spiritual_status: c.spiritualStatus,
                    observation: c.observation
                }));

                const { error: contactsError } = await supabase
                    .from('contacts')
                    .insert(contactsToInsert);

                if (contactsError) throw contactsError;
            }

            await fetchEvents(); // Refresh list
        } catch (error) {
            console.error('Error adding result:', error);
            throw error;
        }
    };

    const deleteEvent = async (id: string) => {
        try {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchEvents(); // Refresh list
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    };

    const getEvent = (id: string) => events.find(e => e.id === id);

    const updateEvent = async (id: string, updates: Partial<Event>) => {
        try {
            const { error } = await supabase
                .from('events')
                .update({
                    what: updates.what,
                    why: updates.why,
                    where: updates.where,
                    when: updates.when,
                    who: updates.who,
                    how: updates.how,
                    how_much: updates.howMuch,
                    congregation: updates.congregation,
                })
                .eq('id', id);

            if (error) throw error;
            await fetchEvents();
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    };

    return { events, loading, addEvent, updateEvent, addResult, deleteEvent, getEvent };
};
