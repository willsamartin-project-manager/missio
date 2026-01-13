import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Congregation {
    id: string;
    name: string;
    created_at: string;
}

export const useCongregations = () => {
    const [congregations, setCongregations] = useState<Congregation[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCongregations = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('congregations')
                .select('*')
                .order('name');

            if (error) throw error;
            setCongregations(data || []);
        } catch (error) {
            console.error('Error fetching congregations:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const addCongregation = async (name: string) => {
        try {
            const { error } = await supabase
                .from('congregations')
                .insert([{ name }]);

            if (error) throw error;
            await fetchCongregations(); // Refresh list
        } catch (error) {
            console.error('Error adding congregation:', error);
            throw error;
        }
    };

    const deleteCongregation = async (id: string) => {
        try {
            const { error } = await supabase
                .from('congregations')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchCongregations(); // Refresh list
        } catch (error) {
            console.error('Error deleting congregation:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchCongregations();
    }, [fetchCongregations]);

    return {
        congregations,
        loading,
        addCongregation,
        deleteCongregation,
        refreshCongregations: fetchCongregations
    };
};
