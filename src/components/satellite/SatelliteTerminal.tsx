import { useEffect, useRef, useState, type FormEvent } from 'react';
import { satelliteService, type TerminalLine } from '@/services/satelliteService';
import type { SatelliteLinkStatus } from '@/types/models';

interface SatelliteTerminalProps {
  onStatusChange: (status: SatelliteLinkStatus) => void;
}

const WELCOME: TerminalLine[] = [
  { kind: 'output', text: 'DeepSecure360 Satellite Uplink Terminal v1.0' },
  { kind: 'output', text: 'Connects to public orbital telemetry only. Type HELP to begin.' },
];

export function SatelliteTerminal({ onStatusChange }: SatelliteTerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>(WELCOME);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [lines]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const command = input.trim();
    if (!command || busy) return;
    setInput('');
    setLines((l) => [...l, { kind: 'input', text: command }]);

    const upper = command.toUpperCase();
    if (upper === 'CLEAR') {
      setLines([]);
      return;
    }
    if (upper === 'SCAN' || upper.startsWith('CONNECT')) onStatusChange('acquiring');

    setBusy(true);
    const result = await satelliteService.run(command);
    setBusy(false);
    setLines((l) => [...l, ...result]);

    if (upper.startsWith('CONNECT')) onStatusChange(result.some((r) => r.kind === 'error') ? 'idle' : 'connected');
    if (upper === 'DISCONNECT') onStatusChange('idle');
  };

  return (
    <div className="terminal">
      <div className="terminal-titlebar">
        <span className="terminal-dot terminal-dot-r" /><span className="terminal-dot terminal-dot-y" /><span className="terminal-dot terminal-dot-g" />
        <span className="terminal-title">sat-uplink — bash</span>
      </div>
      <div className="terminal-body">
        {lines.map((l, i) => (
          <div key={i} className={`terminal-line terminal-${l.kind}`}>
            {l.kind === 'input' ? <><span className="terminal-prompt">ds360@uplink:~$</span> {l.text}</> : l.text}
          </div>
        ))}
        {busy && <div className="terminal-line terminal-output terminal-busy">working…</div>}
        <div ref={endRef} />
      </div>
      <form className="terminal-input-row" onSubmit={submit}>
        <span className="terminal-prompt">ds360@uplink:~$</span>
        <input
          className="terminal-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="type HELP"
          autoComplete="off"
          spellCheck={false}
          aria-label="Satellite uplink command input"
        />
      </form>
    </div>
  );
}
