import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Department {
    id: string;
    name: string;
}

export const useDepartments = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDepartments = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('departments')
                .select('*')
                .order('name');

            if (error) throw error;
            setDepartments(data || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    const addDepartment = async (name: string) => {
        try {
            const { error } = await supabase
                .from('departments')
                .insert([{ name }]);

            if (error) throw error;
            await fetchDepartments();
        } catch (error) {
            console.error('Error adding department:', error);
            throw error;
        }
    };

    const deleteDepartment = async (id: string) => {
        try {
            const { error } = await supabase
                .from('departments')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchDepartments();
        } catch (error) {
            console.error('Error deleting department:', error);
            throw error;
        }
    };

    return { departments, loading, addDepartment, deleteDepartment };
};
