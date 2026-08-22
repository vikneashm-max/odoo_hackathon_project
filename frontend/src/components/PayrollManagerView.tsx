import React, { useState } from 'react';
import { Plus, Check, Percent, Settings } from 'lucide-react';
import type { SalaryComponent } from '../types';

interface PayrollManagerViewProps {
  components: SalaryComponent[];
  pfRate: number;
  profTax: number;
  onUpdateSettings: (newPfRate: number, newProfTax: number) => void;
  onSaveComponent: (comp: SalaryComponent) => void;
}

export const PayrollManagerView: React.FC<PayrollManagerViewProps> = ({
  components,
  pfRate,
  profTax,
  onUpdateSettings,
  onSaveComponent,
}) => {
  const [currentPfRate, setCurrentPfRate] = useState<number>(pfRate || 12);
  const [currentProfTax, setCurrentProfTax] = useState<number>(profTax || 200);
  const [sampleGross, setSampleGross] = useState<number>(100000);

  // New Component Dialog State
  const [isAddCompOpen, setIsAddCompOpen] = useState(false);
  const [compName, setCompName] = useState('');
  const [compType, setCompType] = useState<'percentage' | 'fixed'>('percentage');
  const [compValue, setCompValue] = useState<number>(10);
  const [isDeduction, setIsDeduction] = useState(false);
  const [description, setDescription] = useState('');

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(currentPfRate, currentProfTax);
    alert('Statutory settings updated (PF & Professional Tax)!');
  };

  const handleCreateComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName) return;

    onSaveComponent({
      id: `sc-${Date.now()}`,
      name: compName,
      type: compType,
      value: compValue,
      isDeduction,
      description,
    });

    setCompName('');
    setDescription('');
    setIsAddCompOpen(false);
  };

  return (
    <div className="payroll-manager-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Payroll & Salary Engine</h1>
          <p>Configure salary components, statutory PF & Professional Tax rates, and auto-recalculation rules.</p>
        </div>

        <button className="btn-primary" onClick={() => setIsAddCompOpen(true)}>
          <Plus size={18} />
          <span>Add Component</span>
        </button>
      </div>

      {/* Statutory Rules Card */}
      <div className="card-container" style={{ padding: '24px', marginBottom: '28px' }}>
        <h2 className="font-serif" style={{ fontSize: '18px', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={20} color="#6d28d9" />
          <span>Global Statutory Settings</span>
        </h2>

        <form onSubmit={handleSettingsSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Provident Fund (PF) Rate (%)</label>
            <div className="input-with-icon">
              <input
                type="number"
                className="form-input"
                value={currentPfRate}
                onChange={(e) => setCurrentPfRate(Number(e.target.value))}
                min={0}
                max={30}
              />
              <span className="input-icon-right"><Percent size={16} /></span>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Professional Tax (PT ₹)</label>
            <div className="input-with-icon">
              <input
                type="number"
                className="form-input"
                value={currentProfTax}
                onChange={(e) => setCurrentProfTax(Number(e.target.value))}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
            <Check size={16} />
            <span>Save Settings</span>
          </button>
        </form>
      </div>

      {/* Salary Components Table */}
      <div className="card-container" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 className="font-serif" style={{ fontSize: '18px', color: '#111827' }}>
            Salary Component Rules & Auto-Recalculation
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>Sample Gross Wage:</span>
            <input
              type="number"
              className="form-input"
              style={{ width: '120px', padding: '6px 10px', fontSize: '13px' }}
              value={sampleGross}
              onChange={(e) => setSampleGross(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Component Name</th>
                <th>Type</th>
                <th>Rule / Value</th>
                <th>Calculated Sample (₹)</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {components.map((comp) => {
                const sampleAmt =
                  comp.type === 'percentage'
                    ? Math.round((sampleGross * comp.value) / 100)
                    : comp.value;

                return (
                  <tr key={comp.id}>
                    <td style={{ fontWeight: 600, color: '#111827' }}>
                      {comp.name}
                      {comp.isDeduction && (
                        <span className="badge badge-late" style={{ marginLeft: '8px', fontSize: '10px' }}>
                          Deduction
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-leave">
                        {comp.type === 'percentage' ? '% of Wage' : 'Fixed Amount'}
                      </span>
                    </td>
                    <td>
                      <strong>
                        {comp.type === 'percentage' ? `${comp.value}%` : `₹${comp.value.toLocaleString()}`}
                      </strong>
                    </td>
                    <td style={{ fontWeight: 700, color: comp.isDeduction ? '#dc2626' : '#166534' }}>
                      {comp.isDeduction ? '-' : ''}₹{sampleAmt.toLocaleString()}
                    </td>
                    <td style={{ fontSize: '12px', color: '#6b7280' }}>{comp.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Component Dialog Overlay */}
      {isAddCompOpen && (
        <div className="modal-overlay" onClick={() => setIsAddCompOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Salary Component</h3>
              <button className="modal-close-btn" onClick={() => setIsAddCompOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateComponent}>
              <div className="form-group">
                <label>Component Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Conveyance Allowance"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    className="form-select"
                    value={compType}
                    onChange={(e) => setCompType(e.target.value as 'percentage' | 'fixed')}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Value ({compType === 'percentage' ? '%' : '₹'})</label>
                  <input
                    type="number"
                    className="form-input"
                    value={compValue}
                    onChange={(e) => setCompValue(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isDeduction}
                    onChange={(e) => setIsDeduction(e.target.checked)}
                  />
                  <span>This component is a salary deduction</span>
                </label>
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Brief description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setIsAddCompOpen(false)} style={{ width: 'auto' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Component
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
