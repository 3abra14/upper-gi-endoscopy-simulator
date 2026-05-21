import { Activity, Wind, Eye, Clock, Shield, Thermometer, MapPin, Zap, AlertCircle } from 'lucide-react';

export function UI({ controls, setControls }: { controls: any, setControls: any }) {
  const getLandmark = (depth: number) => {
    if (depth < 18) return "ESOPHAGUS (UPPER)";
    if (depth < 25) return "ESOPHAGUS (LOWER)";
    if (depth < 32) return "CARDIA / Z-LINE";
    if (depth < 45) return "STOMACH FUNDUS";
    if (depth < 60) return "STOMACH BODY";
    if (depth < 72) return "STOMACH ANTRUM";
    return "PYLORUS / DUODENUM";
  };

  return (
    <div className="ui-overlay">
      <div className="endoscope-frame">
        <div className="vignette-circle" />
        <div className="scan-line" />
      </div>

      <div className="header-bar">
        <div className="brand">
          <Shield className="pulse-slow" size={24} color="#00f2ff" />
          <div className="brand-text">
            <span className="main">OLYMPUS-X</span>
            <span className="sub">VISION MASTER v9.2</span>
          </div>
        </div>
        
        <div className="landmark-indicator glass-panel">
          <MapPin size={16} color="#00f2ff" />
          <span className="value text-glow">{getLandmark(controls.insertion)}</span>
        </div>

        <div className="system-time">
          <Clock size={16} />
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="vitals-sidebar">
        <div className="glass-panel vital-card">
          <div className="vital-header">
            <Activity size={16} color="#ff3366" />
            <span className="label">HEART RATE</span>
          </div>
          <div className="vital-value">
            <span className="num">72</span>
            <span className="unit">BPM</span>
          </div>
          <div className="vital-graph-container">
            <div className="vital-graph hr-graph" />
          </div>
        </div>

        <div className="glass-panel vital-card">
          <div className="vital-header">
            <Wind size={16} color="#00f2ff" />
            <span className="label">SpO2</span>
          </div>
          <div className="vital-value">
            <span className="num">99</span>
            <span className="unit">%</span>
          </div>
          <div className="vital-graph-container">
            <div className="vital-graph sp-graph" />
          </div>
        </div>
      </div>

      <div className="telemetry-sidebar">
        <div className="glass-panel telemetry-card clickable" onClick={() => setControls((c: any) => ({ ...c, nbi: !c.nbi }))}>
          <div className="telemetry-header">
            <Zap size={14} color={controls.nbi ? "#00f2ff" : "#888"} />
            <span className="label">IMAGING MODE</span>
          </div>
          <span className={`value ${controls.nbi ? 'text-cyan' : ''}`}>
            {controls.nbi ? 'NARROW BAND (NBI)' : 'WHITE LIGHT'}
          </span>
        </div>
        
        <div className="glass-panel telemetry-card clickable" onClick={() => setControls((c: any) => ({ ...c, scenario: c.scenario === 'ulcer' ? 'normal' : 'ulcer' }))}>
          <div className="telemetry-header">
            <AlertCircle size={14} color={controls.scenario === 'ulcer' ? "#ff3366" : "#888"} />
            <span className="label">SCENARIO</span>
          </div>
          <span className={`value ${controls.scenario === 'ulcer' ? 'text-red' : ''}`}>
            {controls.scenario === 'ulcer' ? 'GASTRIC ULCER' : 'NORMAL'}
          </span>
        </div>
      </div>

      <div className="bottom-ui">
        <div className="glass-panel steering-hud">
          <div className="steering-display">
            <div className="crosshair">
              <div className="dot" style={{ 
                transform: `translate(${controls.steering.x * 45}px, ${-controls.steering.y * 45}px)` 
              }} />
            </div>
            <span className="label">TIP ORIENTATION</span>
          </div>
        </div>

        <div className="glass-panel status-meters">
          <div className="meter-group">
            <div className="meter-label">
              <span>INSERTION DEPTH</span>
              <span className="value text-glow">{controls.insertion.toFixed(1)} cm</span>
            </div>
            <div className="meter-bar">
              <div className="fill" style={{ width: `${(controls.insertion / 80) * 100}%` }} />
            </div>
          </div>

          <div className="meter-group">
            <div className="meter-label">
              <span>INSUFFLATION</span>
              <span className="value text-glow">{(controls.insufflation * 15).toFixed(1)} mmHg</span>
            </div>
            <div className="meter-bar">
              <div className="fill air-fill" style={{ width: `${(controls.insufflation / 2.5) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="control-hints">
        <div className="hint"><span>W/A/S/D</span> TIP STEER</div>
        <div className="hint"><span>UP/DOWN</span> INSERTION</div>
        <div className="hint"><span>I/O</span> INSUFFLATION</div>
      </div>
    </div>
  );
}
