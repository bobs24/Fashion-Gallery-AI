import React from 'react';
import { XIcon } from './icons'; // Assuming XIcon is in your icons file

// --- NEW, PROFESSIONAL ICONS FOR SPECIFIC SERVICES ---
const MetabaseIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H7v-4h4v4zm0-5H7V7h4v4zm5 5h-4v-4h4v4zm0-5h-4V7h4v4z" /></svg>);
const SupabaseIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 2.47c-5.4 0-9.45 4.35-9.45 9.53 0 4.17 2.22 7.35 5.58 8.85l.44.18.2.45c.42.93.81 1.76 1.15 2.52.2.45.44.93.64 1.34.2.42.4.81.56 1.17.16.36.3.68.42.98.13.3.24.57.32.8a.7.7 0 0 0 .66.42.7.7 0 0 0 .66-.42c.08-.23.19-.5.32-.8.13-.3.26-.62.42-.98.16-.36.35-.75.56-1.17.2-.4.44-.9.64-1.34.34-.76.73-1.6 1.15-2.52l.2-.45.44-.18c3.36-1.5 5.58-4.68 5.58-8.85C21.46 6.82 17.4 2.47 12.01 2.47Z" /></svg>);
const PythonIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 8.59L14 10l-2-2-2 2-1.41-1.41L10 7.17l-1.41-1.41-1.42 1.42L8.59 8.59 10 10l-2 2-2-2-1.41 1.41L7.17 14l-1.41 1.41 1.42 1.42L8.59 15.41 10 14l2 2 2-2 1.41 1.41L14 16.83l1.41 1.41 1.42-1.42L15.41 15.41 14 14l2-2 2 2 1.41-1.41L16.83 10l1.41-1.41-1.42-1.42L15.41 8.59z" /></svg>);
const ReactIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76l-2.12 2.12m-6.24 6.24l2.12-2.12m6.24-6.24L7.76 16.24m6.24-6.24l-2.12-2.12m-4.12 8.36L12 12"></path></svg>);
const GeminiIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.76 5.24L20 8.24l-4.24 4.24L16.76 18 12 15.24 7.24 18l1-5.52L4 8.24l5.24-1L12 2z" /></svg>);

// A generic box component for a service
const ServiceBox: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, icon, children }) => (
    <div className="flex items-center gap-4 p-4 bg-[#1C1C1C] rounded-lg border border-gray-700/50 w-full">
        <div className="flex-shrink-0 w-10 h-10">{icon}</div>
        <div>
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-xs text-gray-400">{children}</p>
        </div>
    </div>
);

// A simple horizontal line connector
const Connector = () => (
    <div className="w-full h-px bg-gray-600 my-4 md:hidden"></div>
);

const SystemArchitecture: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose} role="dialog">
            <div className="bg-[#0D0D0D] border border-gray-800 rounded-2xl w-full max-w-7xl h-auto max-h-[95vh] overflow-y-auto flex flex-col p-6 md:p-8 relative shadow-2xl" onClick={e => e.stopPropagation()}>
                
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-20" aria-label="Close">
                    <XIcon className="w-6 h-6" />
                </button>

                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-light text-white tracking-wider">Virtual Stylist: System Architecture</h2>
                    <p className="text-sm text-gray-500 mt-2">End-to-end data and application flow.</p>
                </div>

                <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-4 md:items-center">

                    {/* Stage 1: Data Sources */}
                    <div className="md:col-span-3">
                        <ServiceBox title="Data Sources" icon={<MetabaseIcon className="text-blue-400" />}>
                            Product metadata is pulled from Metabase.
                        </ServiceBox>
                    </div>

                    <div className="md:col-span-1 text-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></div>

                    {/* Stage 2: Processing & Storage */}
                    <div className="md:col-span-4 space-y-4">
                        <ServiceBox title="Offline Pipeline (Python)" icon={<PythonIcon className="text-yellow-400" />}>
                            A Python script processes product images with DinoV2 to generate vector embeddings.
                        </ServiceBox>
                        <ServiceBox title="Vector Database" icon={<SupabaseIcon className="text-green-400" />}>
                            Embeddings & metadata are stored in Supabase with pgvector for similarity search.
                        </ServiceBox>
                    </div>

                    <div className="md:col-span-1 text-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></div>

                    {/* Stage 3: Application Layer */}
                    <div className="md:col-span-3 space-y-4">
                        <ServiceBox title="User Frontend (React)" icon={<ReactIcon className="text-cyan-400" />}>
                            User interacts with the web app, selects products, and uploads photos.
                        </ServiceBox>
                        <ServiceBox title="Backend API (FastAPI)" icon={<PythonIcon className="text-teal-400" />}>
                            Handles requests, queries Supabase for similar items, and calls the generation model.
                        </ServiceBox>
                        <ServiceBox title="AI Generation (Gemini)" icon={<GeminiIcon className="text-purple-400" />}>
                            Receives user & product images to generate the final virtual try-on result.
                        </ServiceBox>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SystemArchitecture;