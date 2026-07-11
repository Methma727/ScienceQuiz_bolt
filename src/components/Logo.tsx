import { useSettings } from '../context/SettingsContext';

/**
 * Brand mark — an animated gradient tile with a glowing "Q" and orbiting dot.
 */
export default function Logo({ size = 56 }: { size?: number }) {
  const { reducedMotion } = useSettings();
  return (
    <div
      className="qm-logo"
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.26),
        background: 'var(--accent-gradient)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 28px var(--accent-soft), inset 0 1px 0 rgba(255,255,255,0.25)',
      }}
    >
      <span
        className="font-display"
        style={{
          fontSize: size * 0.5,
          fontWeight: 800,
          color: 'white',
          lineHeight: 1,
          textShadow: '0 2px 8px rgba(0,0,0,0.25)',
        }}
      >
        Q
      </span>
      {!reducedMotion && (
        <span
          style={{
            position: 'absolute',
            top: -3,
            right: -3,
            width: size * 0.18,
            height: size * 0.18,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 0 12px #fff',
            animation: 'qmOrbit 4s linear infinite',
          }}
        />
      )}
      <style>{`
        @keyframes qmOrbit {
          from { transform: rotate(0deg) translateX(${size * 0.42}px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(${size * 0.42}px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}
