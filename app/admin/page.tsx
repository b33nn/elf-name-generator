'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [config, setConfig] = useState({
    runanytimeApiKey: '',
    runanytimeBaseUrl: 'https://runanytime.hxi.me',
    runanytimeModel: 'claude-sonnet-4-5-20250929',
  });

  const [testInput, setTestInput] = useState({
    name: 'Elara',
    race: 'high-elf',
    gender: 'female',
  });

  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const res = await fetch('/api/admin/config');
    const data = await res.json();
    setConfig(data);
  };

  const saveConfig = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      setMessage(data.success ? '✅ 配置已保存，请重启服务器' : '❌ ' + data.error);
    } catch (error) {
      setMessage('❌ 保存失败');
    }
    setLoading(false);
  };

  const testOC = async () => {
    setLoading(true);
    setTestResult(null);
    setMessage('');
    try {
      const res = await fetch('/api/generate/oc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testInput),
      });
      const data = await res.json();
      setTestResult(data);
      setMessage(data.oc ? '✅ 生成成功' : '❌ 生成失败');
    } catch (error) {
      setMessage('❌ 测试失败');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">🔧 API 配置管理</h1>

        {/* API 配置 */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">RunAnytime API 配置</h2>

          <div>
            <label className="block text-sm font-medium mb-1">API Key</label>
            <input
              type="password"
              value={config.runanytimeApiKey}
              onChange={(e) => setConfig({ ...config, runanytimeApiKey: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="sk-xxxxx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Base URL</label>
            <input
              type="text"
              value={config.runanytimeBaseUrl}
              onChange={(e) => setConfig({ ...config, runanytimeBaseUrl: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <input
              type="text"
              value={config.runanytimeModel}
              onChange={(e) => setConfig({ ...config, runanytimeModel: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <button
            onClick={saveConfig}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存配置'}
          </button>
        </div>

        {/* OC 测试 */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">🧪 OC 生成测试</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">名字</label>
              <input
                type="text"
                value={testInput.name}
                onChange={(e) => setTestInput({ ...testInput, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">种族</label>
              <select
                value={testInput.race}
                onChange={(e) => setTestInput({ ...testInput, race: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="high-elf">高等精灵</option>
                <option value="wood-elf">木精灵</option>
                <option value="dark-elf">暗夜精灵</option>
                <option value="night-elf">黑暗精灵</option>
                <option value="blood-elf">血精灵</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">性别</label>
              <select
                value={testInput.gender}
                onChange={(e) => setTestInput({ ...testInput, gender: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="neutral">中性</option>
              </select>
            </div>
          </div>

          <button
            onClick={testOC}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? '生成中...' : '测试生成'}
          </button>

          {testResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">生成结果：</h3>
              <pre className="text-sm overflow-auto">{JSON.stringify(testResult, null, 2)}</pre>
            </div>
          )}
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${message.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
