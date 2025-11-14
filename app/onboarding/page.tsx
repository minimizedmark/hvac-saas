'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function Onboarding() {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login');
      supabase.from('companies').select('id').eq('user_id', data.user?.id).single().then(({ data: c }) => {
        if (c) router.push('/dashboard');
      });
    });
  }, [supabase, router]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !file) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    const ext = file.name.split('.').pop();
    const path = `${user!.id}.${ext}`;

    const { error: up } = await supabase.storage.from('logos').upload(path, file, { upsert: true });
    if (up) { alert(up.message); setSaving(false); return; }

    const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path);

    await supabase.from('companies').insert({
      user_id: user!.id,
      name,
      logo_url: publicUrl,
    });

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Welcome to HVAC Flow</h1>
        <p className="text-center text-gray-600 mb-8">Add your company branding to get started</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="CoolBreeze HVAC LLC"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Company Logo</label>
            <input type="file" accept="image/*" onChange={handleFile} required className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {preview && <img src={preview} alt="preview" className="mt-4 h-24 w-auto rounded-lg mx-auto shadow" />}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition"
          >
            {saving ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
