'use client';

import { useState } from 'react';

const aspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const styles = ['Photorealistic', 'Illustration', 'Oil Painting', 'Watercolor', 'Sketch', 'Anime', 'Cinematic', '3D Render'];
const moods = ['Dramatic', 'Serene', 'Energetic', 'Mysterious', 'Warm', 'Cool', 'Minimalist'];

const mockImages = [
  { id: 1, prompt: 'A futuristic city at sunset', style: 'Cinematic', created: '2h ago' },
  { id: 2, prompt: 'Abstract geometric patterns', style: 'Illustration', created: '5h ago' },
  { id: 3, prompt: 'Mountain landscape in fog', style: 'Oil Painting', created: '1d ago' },
  { id: 4, prompt: 'Portrait of a robot in nature', style: 'Photorealistic', created: '2d ago' },
];

export default function ImageStudioPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [selectedStyle, setSelectedStyle] = useState('Photorealistic');
  const [selectedMood, setSelectedMood] = useState('');
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2500));
    setGenerating(false);
  };

  return (
    <div className="page animate-fade-up">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Image Studio</h1>
          <p className="page-subtitle">Generate stunning AI images from text prompts</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge badge-ai">
            <span className="ai-dot" style={{ width: 5, height: 5 }} />
            AI Powered
          </span>
          <span className="badge badge-muted">Demo Mode</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 4, width: 'fit-content' }}>
        {(['generate', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn btn-sm ${activeTab === tab ? 'btn-ai' : 'btn-ghost'}`}
            style={{ textTransform: 'capitalize' }}
          >
            {tab === 'generate' ? '✦ Generate' : '◷ History'}
          </button>
        ))}
      </div>

      {activeTab === 'generate' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
          {/* Left — Canvas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Canvas area */}
            <div className="card-glow" style={{ aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', minHeight: 360 }}>
              {/* Ambient orbs */}
              <div className="orb orb-violet" style={{ width: 300, height: 300, top: -80, right: -80 }} />
              <div className="orb orb-purple" style={{ width: 200, height: 200, bottom: -60, left: -60 }} />

              {generating ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, zIndex: 1 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--ai-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, animation: 'spin-slow 2s linear infinite' }}>
                    ✦
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>Generating your image...</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>This may take a few seconds</div>
                  </div>
                  <div style={{ width: 200, height: 3, background: 'var(--bg-elevated)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--ai-gradient)', borderRadius: 10, animation: 'shimmer 1.5s ease infinite', backgroundSize: '400px 100%' }} />
                  </div>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: 0, zIndex: 1 }}>
                  <div className="empty-icon" style={{ width: 56, height: 56, fontSize: 24 }}>🎨</div>
                  <div className="empty-title">Your image will appear here</div>
                  <div className="empty-desc">Enter a prompt and click Generate to create your first image</div>
                </div>
              )}
            </div>

            {/* Prompt */}
            <div className="card" style={{ padding: 16 }}>
              <label className="label">Prompt</label>
              <textarea
                className="ai-input"
                rows={3}
                placeholder="Describe the image you want to generate... e.g. 'A serene mountain lake at golden hour, photorealistic, 8k'"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                style={{ resize: 'vertical', minHeight: 80 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{prompt.length}/500</span>
                <button
                  className="btn btn-ai"
                  onClick={handleGenerate}
                  disabled={generating || !prompt.trim()}
                  style={{ opacity: !prompt.trim() ? 0.5 : 1 }}
                >
                  {generating ? '⏳ Generating...' : '✦ Generate Image'}
                </button>
              </div>
            </div>
          </div>

          {/* Right — Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Aspect Ratio */}
            <div className="card" style={{ padding: 16 }}>
              <div className="card-title" style={{ marginBottom: 12 }}>Aspect Ratio</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {aspectRatios.map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedRatio(r)}
                    className={`btn btn-sm ${selectedRatio === r ? 'btn-ai' : 'btn-primary'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="card" style={{ padding: 16 }}>
              <div className="card-title" style={{ marginBottom: 12 }}>Style</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {styles.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedStyle(s)}
                    className={`btn btn-sm ${selectedStyle === s ? 'btn-ai' : 'btn-primary'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div className="card" style={{ padding: 16 }}>
              <div className="card-title" style={{ marginBottom: 12 }}>Mood <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 11 }}>optional</span></div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {moods.map(m => (
                  <button
                    key={m}
                    onClick={() => setSelectedMood(selectedMood === m ? '' : m)}
                    className={`btn btn-sm ${selectedMood === m ? 'btn-ai' : 'btn-primary'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Config summary */}
            <div className="ai-card" style={{ padding: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Current Config</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[['Ratio', selectedRatio], ['Style', selectedStyle], ['Mood', selectedMood || 'None']].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History tab */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {mockImages.map(img => (
            <div key={img.id} className="card" style={{ overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ aspectRatio: '1', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                🖼️
              </div>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {img.prompt}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-ai">{img.style}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{img.created}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
