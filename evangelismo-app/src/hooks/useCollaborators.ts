import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Collaborator {
    id: string;
    name: string;
    contact: string;
    congregation: string;
    observation: string;
}

export const useCollaborators = () => {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCollaborators = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('collaborators')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setCollaborators(data || []);
        } catch (error) {
            console.error('Error fetching collaborators:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCollaborators();
    }, [fetchCollaborators]);

    const addCollaborator = async (collaborator: Omit<Collaborator, 'id'>) => {
        try {
            const { error } = await supabase
                .from('collaborators')
                .insert([collaborator]);

            if (error) throw error;
            await fetchCollaborators();
        } catch (error) {
            console.error('Error adding collaborator:', error);
            throw error;
        }
    };

    const deleteCollaborator = async (id: string) => {
        try {
            const { error } = await supabase
                .from('collaborators')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchCollaborators();
        } catch (error) {
            console.error('Error deleting collaborator:', error);
            throw error;
        }
    };

    return { collaborators, loading, addCollaborator, deleteCollaborator, fetchCollaborators };
};
