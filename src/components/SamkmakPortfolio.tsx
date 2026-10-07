import React, { useState } from 'react';
import {
  Code2,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  Github,
  Mail,
  Send,
  Zap,
  CheckCircle,
  Database,
  Globe,
  Radio,
  Workflow,
  Shield,
  Palette,
  Laptop
} from 'lucide-react';

interface SamkmakPortfolioProps {
  onBackToSystem?: () => void;
}

export const SamkmakPortfolio: React.FC<SamkmakPortfolioProps> = ({ onBackToSystem }) => {
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<Array<{ cmd: string; output: string }>>([
    { cmd: 'whoami', output: 'Samkmak — Creative Full-Stack & Cyber UI/UX Architect.' },
    { cmd: 'status', output: 'SYSTEM ONLINE: Neural network active. Real-time synchronization engaged.' },
  ]);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    let output = '';
    switch (cmd) {
      case 'help':
        output = 'Available commands: whoami, skills, projects, stack, contact, clear, date';
        break;
      case 'whoami':
        output = 'Samkmak: Creative Developer crafting futuristic, ultra-responsive digital products & cyber systems.';
        break;
      case 'skills':
        output = 'React, TypeScript, Realtime WebSockets, Firebase RTDB, Tailwind CSS, Glassmorphism UI/UX, Cyberpunk Interfaces, Node.js';
        break;
      case 'projects':
        output = '1. Quantum Real-Time Seafood OS | 2. CyberPulse Billing Matrix | 3. HoloUI Glassmorphic Design System | 4. Distributed State Syncer';
        break;
      case 'stack':
        output = 'Frontend: React 19 + TypeScript + Tailwind CSS | Backend: Node.js + Express + WebSocket + Firebase';
        break;
      case 'contact':
        output = 'Email: samkmak.dev@matrix.net | GitHub: github.com/samkmak | Status: Open for innovative projects';
        break;
      case 'clear':
        setTerminalHistory([]);
        setTerminalInput('');
        return;
      case 'date':
        output = new Date().toUTCString();
        break;
      default:
        output = `Command not recognized: '${cmd}'. Type 'help' for available commands.`;
    }

    setTerminalHistory((prev) => [...prev, { cmd: terminalInput, output }]);
    setTerminalInput('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactName && contactMessage) {
      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        setContactName('');
        setContactEmail('');
        setContactMessage('');
      }, 3500);
    }
  };

  const projects = [
    {
      id: 'proj-1',
      title: 'Quantum Seafood Orders OS',
      subtitle: 'نظام إدارة الطلبات والمزامنة اللحظية الفورية',
      category: 'Realtime Architecture',
      description: 'نظام إدارة سحابي فائق السرعة يدعم المزامنة متعددة المستخدمين بدون تأخير عبر WebSockets و Firebase RTDB مع طباعة فواتير PDF مجمعة.',
      tags: ['React', 'TypeScript', 'WebSockets', 'Firebase RTDB', 'Glassmorphism'],
      badge: 'Active Production',
      stats: '100% Real-time sync',
      action: onBackToSystem,
      actionText: 'معاينة وتشغيل النظام',
    },
    {
      id: 'proj-2',
      title: 'HoloUI Cyber Design System',
      subtitle: 'مكتبة مكونات النيون والزجاج المصنفر',
      category: 'UI/UX Engineering',
      description: 'نظام واجهات استخدام متطور يعتمد على تأثيرات Glassmorphism الفائقة، وتوهجات النيون السيان والزرقاء، مع تجربة مستخدم سريعة الاستجابة.',
      tags: ['Tailwind CSS', 'Micro-interactions', 'Dark Mode', 'Cyberpunk'],
      badge: 'Design System',
      stats: '60+ Cyber Components',
    },
    {
      id: 'proj-3',
      title: 'Distributed State Protocol',
      subtitle: 'بروتوكول التزامن فائق الكفاءة',
      category: 'High-Tech Backend',
      description: 'محرك مزامنة مركزي يضمن سلامة البيانات عبر الأجهزة والجوالات، مع تقنيات Server-Sent Events و Local Broadcast Channels الاحتياطية.',
      tags: ['Node.js', 'Express', 'SSE', 'State Synchronization'],
      badge: 'Protocol v3.0',
      stats: '< 15ms Latency',
    },
    {
      id: 'proj-4',
      title: 'CyberMatrix Analytics Engine',
      subtitle: 'محرك التحليلات المالية الفورية والتلخيص الذكي',
      category: 'Financial Tech',
      description: 'لوحة قياس مدمجة لحساب إجماليات المبيعات، وموازين الأصناف الدقيقة بالجرام، مع تصدير تقارير محاسبية فورية لأصحاب الأعمال.',
      tags: ['Analytics', 'Real-time Calculations', 'Data Visualization'],
      badge: 'FinTech Suite',
      stats: 'Automated Accounting',
    },
  ];

  const skills = [
    { name: 'Creative Frontend & UI/UX Design', level: 98, icon: Palette, category: 'Visual Architecture' },
    { name: 'React 19 & TypeScript Ecosystem', level: 96, icon: Code2, category: 'Core Development' },
    { name: 'Glassmorphism & Cyberpunk Theming', level: 99, icon: Layers, category: 'Styling & Aesthetics' },
    { name: 'Real-time WebSockets & Firebase', level: 94, icon: Radio, category: 'Live Telemetry' },
    { name: 'Distributed Systems & State Sync', level: 92, icon: Workflow, category: 'Architecture' },
    { name: 'High-Performance Responsive Layouts', level: 97, icon: Laptop, category: 'Engineering' },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-500">
      
      {/* 1. Hero Section: Glowing Cyber Headliner */}
      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-10 md:p-14 backdrop-blur-2xl bg-slate-950/60 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] transition-all">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          <div className="flex-1 text-center lg:text-right space-y-5">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-semibold tracking-wider">SAMKMAK // CREATIVE DEVELOPER</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              نصنع واجهات المستقبل برؤية{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                تكنولوجية فائقة التطور
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed">
              مرحباً بك في عالم <span className="text-cyan-400 font-bold">Samkmak</span>، حيث تجتمع هندسة البرمجيات الإبداعية مع أحدث صيحات التصميم الرقمي: نمط مستقبلي مظلم، ألواح زجاجية مصنفرة (Glassmorphism)، وإضاءات نيون سيان متوهجة مستوحاة من لوحات التحكم المستقبلية.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              {onBackToSystem && (
                <button
                  type="button"
                  onClick={onBackToSystem}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all flex items-center gap-2 group"
                >
                  <Cpu className="w-4 h-4 text-slate-950 group-hover:rotate-180 transition-transform duration-500" />
                  <span>استكشاف نظام التحكم الفوري</span>
                </button>
              )}

              <a
                href="#projects-section"
                className="px-6 py-3 rounded-xl backdrop-blur-md bg-slate-900/60 hover:bg-slate-800/80 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white font-semibold text-sm transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>المشاريع المبتكرة</span>
              </a>

              <a
                href="#contact-section"
                className="px-6 py-3 rounded-xl backdrop-blur-md bg-slate-950/70 hover:bg-slate-900 border border-slate-700/80 hover:border-blue-400 text-slate-300 hover:text-white font-semibold text-sm transition-all flex items-center gap-2"
              >
                <Terminal className="w-4 h-4 text-blue-400" />
                <span>وحدة الاتصال الفوري</span>
              </a>
            </div>
          </div>

          {/* Holographic Cyber Avatar Card */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="relative rounded-2xl p-6 backdrop-blur-xl bg-slate-900/40 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:border-cyan-300 transition-all group">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4 text-xs font-mono text-cyan-400">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  CORE ENGINE v4.2
                </span>
                <span className="text-emerald-400">CONNECTED</span>
              </div>

              {/* Holographic Visualizer Display */}
              <div className="h-44 rounded-xl bg-slate-950/80 border border-cyan-500/20 p-4 relative overflow-hidden flex flex-col justify-between font-mono text-xs">
                <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:12px_12px] opacity-20 pointer-events-none" />
                
                <div className="flex items-center justify-between text-[11px] text-cyan-300/80">
                  <span>DEV: SAMKMAK</span>
                  <span>FPS: 60.0</span>
                </div>

                <div className="text-center my-auto py-2">
                  <div className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-400 tracking-wider">
                    &lt;CREATIVE /&gt;
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono tracking-widest mt-1">
                    CYBERNETIC ARCHITECT
                  </div>
                </div>

                {/* Micro Stats Bar */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-cyan-500/20 text-center text-[10px]">
                  <div>
                    <span className="block text-slate-500">PROJECTS</span>
                    <span className="font-bold text-cyan-300 font-mono">18+</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">UPTIME</span>
                    <span className="font-bold text-emerald-400 font-mono">99.9%</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">SPEED</span>
                    <span className="font-bold text-blue-400 font-mono">⚡ 12ms</span>
                  </div>
                </div>
              </div>

              {/* Status Chips */}
              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-800 text-cyan-300">
                  #Dark_Cyber
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-950/40 border border-blue-800 text-blue-300">
                  #Glassmorphism
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-sky-950/40 border border-sky-800 text-sky-300">
                  #Neon_Aesthetics
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Terminal Console (High-Tech HUD) */}
      <section className="rounded-2xl p-5 sm:p-7 backdrop-blur-xl bg-slate-950/80 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.12)]">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="font-bold">SAMKMAK INTERACTIVE CYBER TERMINAL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
        </div>

        <div className="font-mono text-xs text-slate-300 space-y-2 max-h-56 overflow-y-auto pr-1">
          <p className="text-slate-500">// جرب كتابة أوامر مثل: 'help' أو 'skills' أو 'projects' أو 'whoami' أو 'contact'</p>
          {terminalHistory.map((item, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="flex items-center gap-2 text-cyan-400">
                <span className="text-blue-500 font-bold">samkmak@cyber-core:~$</span>
                <span className="text-white font-semibold">{item.cmd}</span>
              </div>
              <div className="text-slate-300 pl-4 border-r-2 border-cyan-500/40 pr-2">
                {item.output}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleTerminalSubmit} className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-800">
          <span className="text-cyan-400 font-mono text-xs font-bold shrink-0">guest@matrix:~$</span>
          <input
            type="text"
            value={terminalInput}
            onChange={(e) => setTerminalInput(e.target.value)}
            placeholder="اكتب أمراً هنا واضغط Enter (مثال: help)..."
            className="flex-1 bg-transparent border-0 outline-none text-xs text-white font-mono placeholder:text-slate-600 focus:ring-0"
          />
          <button
            type="submit"
            className="px-3 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono transition-colors"
          >
            EXEC
          </button>
        </form>
      </section>

      {/* 3. Featured Projects Showcase with Glassmorphism */}
      <section id="projects-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>SHOWCASE & ARTIFACTS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              أبرز المشروعات والأنظمة الرقمية
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            أنظمة رقمية متكاملة تجمع بين السرعة الفائقة والجمال المستقبلي والتفاعل اللحظي الموثوق.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative rounded-2xl p-6 backdrop-blur-xl bg-slate-900/40 border border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.12)] hover:shadow-[0_0_35px_rgba(6,182,212,0.25)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Subtle neon gradient bar on top of card */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 opacity-60 group-hover:opacity-100 transition-opacity" />

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-800/80 px-2.5 py-0.5 rounded-full">
                    {project.category}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {project.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {project.title}
                  </h3>
                  <div className="text-xs text-cyan-400/90 font-medium mt-0.5">
                    {project.subtitle}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/70 border border-slate-800 text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom footer of card */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  {project.stats}
                </span>

                {project.action ? (
                  <button
                    type="button"
                    onClick={project.action}
                    className="inline-flex items-center gap-1.5 text-cyan-300 hover:text-white font-bold bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 px-3 py-1.5 rounded-lg transition-colors shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                  >
                    <span>{project.actionText}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-cyan-400/60 text-[11px] font-mono flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    HIGH TECH SPEC
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Tech Stack & Skills Cyber Matrix */}
      <section className="rounded-3xl p-6 sm:p-10 backdrop-blur-2xl bg-slate-950/70 border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>NEURAL MATRIX & EXPERTISE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            المهارات والتقنيات الأساسية لـ Samkmak
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            توليفة فريدة تجمع بين أداء الواجهات اللحظي، حماية البيانات، والجمالية المستقبلية الفائقة.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skills.map((skill, index) => {
            const Icon = skill.icon;
            return (
              <div
                key={index}
                className="p-5 rounded-2xl backdrop-blur-xl bg-slate-900/40 border border-cyan-500/20 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.08)] hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-600/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {skill.level}%
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">
                    {skill.name}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {skill.category}
                  </span>
                </div>

                {/* Futuristic Glowing Progress Bar */}
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Contact Console (Direct Transmission) */}
      <section id="contact-section" className="rounded-3xl p-6 sm:p-10 backdrop-blur-2xl bg-slate-950/60 border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        <div className="max-w-2xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>TRANSMISSION CHANNEL</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            تواصل تكنولوجي مباشر مع Samkmak
          </h2>

          <p className="text-xs sm:text-sm text-slate-300">
            جاهزون لبناء أفكارك الرقمية، وتصميم لوحات تحكم مستقبلية فائقة السرعة والأناقة.
          </p>

          {isSent ? (
            <div className="p-6 rounded-2xl bg-cyan-950/70 border border-cyan-400 text-cyan-200 text-sm font-bold flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(6,182,212,0.3)] animate-in zoom-in-95 duration-200">
              <CheckCircle className="w-6 h-6 text-cyan-400" />
              <span>تم استلام رسالتك وتأكيد الإرسال عبر البوابة الرقمية لـ Samkmak بنجاح!</span>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-4 text-right">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">الاسم / الهوية:</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="مثال: المهندس أحمد"
                    className="w-full rounded-xl bg-slate-900/60 border border-slate-700/80 focus:border-cyan-400 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-cyan-400 shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">البريد الإلكتروني:</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full rounded-xl bg-slate-900/60 border border-slate-700/80 focus:border-cyan-400 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-cyan-400 shadow-inner dir-ltr text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">تفاصيل المشروع أو الرسالة:</label>
                <textarea
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="اكتب رسالتك أو متطلبات مشروعك المستقبلي هنا..."
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-700/80 focus:border-cyan-400 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-cyan-400 shadow-inner resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all flex items-center justify-center gap-2 mx-auto"
              >
                <Send className="w-4 h-4 text-slate-950" />
                <span>إرسال الإشارة الرقمية (Transmission)</span>
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
};
