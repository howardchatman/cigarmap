'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Mail, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLeads() {
  const supabase = createClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['admin-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const exportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['First Name', 'Last Name', 'Email', 'City', 'Cigar Brands', 'Source', 'Date'];
    const rows = leads.map((l) => [
      l.first_name,
      l.last_name,
      l.email,
      l.city,
      l.cigar_brands || '',
      l.source,
      new Date(l.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cigarmap-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Leads</h1>
          <p className="text-stone-500 mt-1">
            {leads.length} total lead{leads.length !== 1 ? 's' : ''} collected
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline" disabled={leads.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-lg border border-stone-200 p-12 text-center">
          <Mail className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-900 mb-2">No leads yet</h3>
          <p className="text-stone-500">Leads from the homepage popup will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50">
                  <th className="text-left px-4 py-3 font-medium text-stone-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-stone-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-stone-600">City</th>
                  <th className="text-left px-4 py-3 font-medium text-stone-600">Cigar Brands</th>
                  <th className="text-left px-4 py-3 font-medium text-stone-600">Source</th>
                  <th className="text-left px-4 py-3 font-medium text-stone-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="px-4 py-3 font-medium text-stone-900">
                      {lead.first_name} {lead.last_name}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      <a href={`mailto:${lead.email}`} className="text-amber-600 hover:underline">
                        {lead.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{lead.city}</td>
                    <td className="px-4 py-3 text-stone-600">{lead.cigar_brands || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
