import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sliders,
  Check,
  Plus,
  Trash2,
  Calendar,
  User,
  BookOpen,
  FileText,
  Hash,
  School,
  X,
  Sparkles,
  Layers,
  Layout,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import {
  HeaderSettings,
  HeaderStyle,
  HeaderPosition,
  HeaderDensity,
  DateFormat,
  PageNumberPosition,
  PageNumberFormat,
  HeaderCustomField,
  Assignment,
} from '../types';
import { HEADER_PRESETS, applyPreset, getDefaultDateString } from '../lib/headerEngine';

interface PageHeaderSettingsPanelProps {
  headerSettings: HeaderSettings;
  onChange: (updated: HeaderSettings) => void;
  assignment?: Partial<Assignment>;
  onClose?: () => void;
}

export const PageHeaderSettingsPanel: React.FC<PageHeaderSettingsPanelProps> = ({
  headerSettings,
  onChange,
  assignment,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'fields' | 'style' | 'pageNumber'>('fields');
  const [newCustomLabel, setNewCustomLabel] = useState('');
  const [newCustomValue, setNewCustomValue] = useState('');

  const updateField = (
    fieldKey: keyof HeaderSettings['fields'],
    updates: Partial<{ enabled: boolean; value: string; format?: any; position?: any }>
  ) => {
    const updatedFields = {
      ...headerSettings.fields,
      [fieldKey]: {
        ...headerSettings.fields[fieldKey],
        ...updates,
      },
    };
    onChange({
      ...headerSettings,
      fields: updatedFields,
    });
  };

  const handlePresetSelect = (presetKey: keyof typeof HEADER_PRESETS) => {
    const updated = applyPreset(presetKey, headerSettings, assignment);
    onChange(updated);
  };

  const handleAddCustomField = () => {
    if (!newCustomLabel.trim()) return;
    const newField: HeaderCustomField = {
      id: 'cf_' + Math.random().toString(36).substring(2, 9),
      label: newCustomLabel.trim(),
      value: newCustomValue.trim(),
      enabled: true,
    };
    onChange({
      ...headerSettings,
      customFields: [...(headerSettings.customFields || []), newField],
    });
    setNewCustomLabel('');
    setNewCustomValue('');
  };

  const handleUpdateCustomField = (id: string, updates: Partial<HeaderCustomField>) => {
    const updated = (headerSettings.customFields || []).map((cf) =>
      cf.id === id ? { ...cf, ...updates } : cf
    );
    onChange({
      ...headerSettings,
      customFields: updated,
    });
  };

  const handleDeleteCustomField = (id: string) => {
    const updated = (headerSettings.customFields || []).filter((cf) => cf.id !== id);
    onChange({
      ...headerSettings,
      customFields: updated,
    });
  };

  return (
    <div id="page-header-settings-panel" className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl space-y-5 text-neutral-200 max-w-2xl w-full">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-800/50">
            <Layout className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Page & Header Settings
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono">
                Fully Customizable
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Control exactly what metadata appears on your assignment sheets.
            </p>
          </div>
        </div>

        {/* Master ON / OFF Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange({ ...headerSettings, enabled: !headerSettings.enabled })}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              headerSettings.enabled
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-neutral-800 border-neutral-700 text-neutral-400'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                headerSettings.enabled ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-neutral-500'
              }`}
            />
            <span>Header: {headerSettings.enabled ? 'ON' : 'OFF'}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Quick Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.entries(HEADER_PRESETS).map(([key, preset]) => {
            const isSelected =
              key === 'none'
                ? !headerSettings.enabled || headerSettings.style === 'none'
                : headerSettings.style === preset.style && headerSettings.position === preset.position;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handlePresetSelect(key as any)}
                className={`flex flex-col text-left p-2 rounded-xl text-xs border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/50 border-indigo-500/70 text-white shadow-xs'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                <span className="font-semibold text-[11.5px] truncate">{preset.name}</span>
                <span className="text-[9.5px] text-neutral-500 line-clamp-1 mt-0.5">{preset.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 gap-1 text-xs font-medium">
        {[
          { id: 'fields', label: 'Field Visibility & Values' },
          { id: 'style', label: 'Header Style & Density' },
          { id: 'pageNumber', label: 'Page Number & Date' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-500 text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: FIELD VISIBILITY & VALUES */}
      {activeTab === 'fields' && (
        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
          {/* Student details section */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              Student Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Student Name */}
              <div className="flex items-center gap-2 p-2 bg-neutral-950 border border-neutral-800 rounded-xl">
                <input
                  type="checkbox"
                  id="toggle-studentName"
                  checked={!!headerSettings.fields.studentName?.enabled}
                  onChange={(e) => updateField('studentName', { enabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-neutral-700 bg-neutral-900 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <label htmlFor="toggle-studentName" className="block text-[11px] font-semibold text-neutral-400 cursor-pointer">
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={headerSettings.fields.studentName?.value || ''}
                    onChange={(e) => updateField('studentName', { value: e.target.value })}
                    placeholder="e.g. Jane Doe"
                    disabled={!headerSettings.fields.studentName?.enabled}
                    className="w-full bg-transparent text-xs text-white placeholder-neutral-600 border-none outline-none disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Roll Number */}
              <div className="flex items-center gap-2 p-2 bg-neutral-950 border border-neutral-800 rounded-xl">
                <input
                  type="checkbox"
                  id="toggle-rollNumber"
                  checked={!!headerSettings.fields.rollNumber?.enabled}
                  onChange={(e) => updateField('rollNumber', { enabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-neutral-700 bg-neutral-900 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <label htmlFor="toggle-rollNumber" className="block text-[11px] font-semibold text-neutral-400 cursor-pointer">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={headerSettings.fields.rollNumber?.value || ''}
                    onChange={(e) => updateField('rollNumber', { value: e.target.value })}
                    placeholder="e.g. 21CS042"
                    disabled={!headerSettings.fields.rollNumber?.enabled}
                    className="w-full bg-transparent text-xs text-white placeholder-neutral-600 border-none outline-none disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Register Number */}
              <div className="flex items-center gap-2 p-2 bg-neutral-950 border border-neutral-800 rounded-xl">
                <input
                  type="checkbox"
                  id="toggle-registerNumber"
                  checked={!!headerSettings.fields.registerNumber?.enabled}
                  onChange={(e) => updateField('registerNumber', { enabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-neutral-700 bg-neutral-900 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <label htmlFor="toggle-registerNumber" className="block text-[11px] font-semibold text-neutral-400 cursor-pointer">
                    Register Number
                  </label>
                  <input
                    type="text"
                    value={headerSettings.fields.registerNumber?.value || ''}
                    onChange={(e) => updateField('registerNumber', { value: e.target.value })}
                    placeholder="e.g. 71782101042"
                    disabled={!headerSettings.fields.registerNumber?.enabled}
                    className="w-full bg-transparent text-xs text-white placeholder-neutral-600 border-none outline-none disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="flex items-center gap-2 p-2 bg-neutral-950 border border-neutral-800 rounded-xl">
                <input
                  type="checkbox"
                  id="toggle-department"
                  checked={!!headerSettings.fields.department?.enabled}
                  onChange={(e) => updateField('department', { enabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-neutral-700 bg-neutral-900 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <label htmlFor="toggle-department" className="block text-[11px] font-semibold text-neutral-400 cursor-pointer">
                    Department
                  </label>
                  <input
                    type="text"
                    value={headerSettings.fields.department?.value || ''}
                    onChange={(e) => updateField('department', { value: e.target.value })}
                    placeholder="e.g. Computer Science"
                    disabled={!headerSettings.fields.department?.enabled}
                    className="w-full bg-transparent text-xs text-white placeholder-neutral-600 border-none outline-none disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Semester */}
              <div className="flex items-center gap-2 p-2 bg-neutral-950 border border-neutral-800 rounded-xl">
                <input
                  type="checkbox"
                  id="toggle-semester"
                  checked={!!headerSettings.fields.semester?.enabled}
                  onChange={(e) => updateField('semester', { enabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-neutral-700 bg-neutral-900 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <label htmlFor="toggle-semester" className="block text-[11px] font-semibold text-neutral-400 cursor-pointer">
                    Semester
                  </label>
                  <input
                    type="text"
                    value={headerSettings.fields.semester?.value || ''}
                    onChange={(e) => updateField('semester', { value: e.target.value })}
                    placeholder="e.g. Semester V"
                    disabled={!headerSettings.fields.semester?.enabled}
                    className="w-full bg-transparent text-xs text-white placeholder-neutral-600 border-none outline-none disabled:opacity-40"
                  />
                </div>
              </div>

              {/* College / Institution Name */}
              <div className="flex items-center gap-2 p-2 bg-neutral-950 border border-neutral-800 rounded-xl">
                <input
                  type="checkbox"
                  id="toggle-collegeName"
                  checked={!!headerSettings.fields.collegeName?.enabled}
                  onChange={(e) => updateField('collegeName', { enabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-neutral-700 bg-neutral-900 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <label htmlFor="toggle-collegeName" className="block text-[11px] font-semibold text-neutral-400 cursor-pointer">
                    College / Institution
                  </label>
                  <input
                    type="text"
                    value={headerSettings.fields.collegeName?.value || ''}
                    onChange={(e) => updateField('collegeName', { value: e.target.value })}
                    placeholder="e.g. MIT Institute of Tech"
                    disabled={!headerSettings.fields.collegeName?.enabled}
                    className="w-full bg-transparent text-xs text-white placeholder-neutral-600 border-none outline-none disabled:opacity-40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Subject & Title section */}
          <div className="space-y-2.5 pt-2 border-t border-neutral-800">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Subject & Title
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Subject */}
              <div className="flex items-center gap-2 p-2 bg-neutral-950 border border-neutral-800 rounded-xl">
                <input
                  type="checkbox"
                  id="toggle-subject"
                  checked={!!headerSettings.fields.subject?.enabled}
                  onChange={(e) => updateField('subject', { enabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-neutral-700 bg-neutral-900 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <label htmlFor="toggle-subject" className="block text-[11px] font-semibold text-neutral-400 cursor-pointer">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={headerSettings.fields.subject?.value || ''}
                    onChange={(e) => updateField('subject', { value: e.target.value })}
                    placeholder="e.g. Multimedia Animation"
                    disabled={!headerSettings.fields.subject?.enabled}
                    className="w-full bg-transparent text-xs text-white placeholder-neutral-600 border-none outline-none disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Assignment Title */}
              <div className="flex items-center gap-2 p-2 bg-neutral-950 border border-neutral-800 rounded-xl">
                <input
                  type="checkbox"
                  id="toggle-assignmentTitle"
                  checked={!!headerSettings.fields.assignmentTitle?.enabled}
                  onChange={(e) => updateField('assignmentTitle', { enabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-neutral-700 bg-neutral-900 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <label htmlFor="toggle-assignmentTitle" className="block text-[11px] font-semibold text-neutral-400 cursor-pointer">
                    Assignment Title
                  </label>
                  <input
                    type="text"
                    value={headerSettings.fields.assignmentTitle?.value || ''}
                    onChange={(e) => updateField('assignmentTitle', { value: e.target.value })}
                    placeholder="e.g. Unit 1 Assignment"
                    disabled={!headerSettings.fields.assignmentTitle?.enabled}
                    className="w-full bg-transparent text-xs text-white placeholder-neutral-600 border-none outline-none disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Subject Code */}
              <div className="flex items-center gap-2 p-2 bg-neutral-950 border border-neutral-800 rounded-xl">
                <input
                  type="checkbox"
                  id="toggle-subjectCode"
                  checked={!!headerSettings.fields.subjectCode?.enabled}
                  onChange={(e) => updateField('subjectCode', { enabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-neutral-700 bg-neutral-900 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <label htmlFor="toggle-subjectCode" className="block text-[11px] font-semibold text-neutral-400 cursor-pointer">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    value={headerSettings.fields.subjectCode?.value || ''}
                    onChange={(e) => updateField('subjectCode', { value: e.target.value })}
                    placeholder="e.g. CS8501"
                    disabled={!headerSettings.fields.subjectCode?.enabled}
                    className="w-full bg-transparent text-xs text-white placeholder-neutral-600 border-none outline-none disabled:opacity-40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Custom Fields section */}
          <div className="space-y-2.5 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                Custom Fields ({headerSettings.customFields?.length || 0})
              </h4>
            </div>

            {/* Existing custom fields */}
            {(headerSettings.customFields || []).map((cf) => (
              <div key={cf.id} className="flex items-center gap-2 p-2 bg-neutral-950 border border-neutral-800 rounded-xl">
                <input
                  type="checkbox"
                  checked={cf.enabled}
                  onChange={(e) => handleUpdateCustomField(cf.id, { enabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-neutral-700 bg-neutral-900 w-4 h-4 cursor-pointer"
                />
                <input
                  type="text"
                  value={cf.label}
                  onChange={(e) => handleUpdateCustomField(cf.id, { label: e.target.value })}
                  placeholder="Field Label (e.g. Faculty Name)"
                  className="w-1/3 bg-neutral-900 px-2 py-1 rounded text-xs text-white border border-neutral-700 outline-none"
                />
                <input
                  type="text"
                  value={cf.value}
                  onChange={(e) => handleUpdateCustomField(cf.id, { value: e.target.value })}
                  placeholder="Value (e.g. Dr. Kumar)"
                  className="flex-1 bg-neutral-900 px-2 py-1 rounded text-xs text-white border border-neutral-700 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteCustomField(cf.id)}
                  className="p-1 rounded text-neutral-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Add Custom Field row */}
            <div className="flex items-center gap-2 p-2 bg-neutral-950/60 border border-dashed border-neutral-800 rounded-xl">
              <input
                type="text"
                value={newCustomLabel}
                onChange={(e) => setNewCustomLabel(e.target.value)}
                placeholder="New Field (e.g. Section)"
                className="w-1/3 bg-neutral-900 px-2.5 py-1.5 rounded-lg text-xs text-white border border-neutral-700 outline-none"
              />
              <input
                type="text"
                value={newCustomValue}
                onChange={(e) => setNewCustomValue(e.target.value)}
                placeholder="Value (e.g. CSE-B)"
                className="flex-1 bg-neutral-900 px-2.5 py-1.5 rounded-lg text-xs text-white border border-neutral-700 outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomField}
                disabled={!newCustomLabel.trim()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HEADER STYLE & DENSITY */}
      {activeTab === 'style' && (
        <div className="space-y-4">
          {/* Header Style Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Header Style</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'minimal', label: 'Minimal', desc: 'Single clean hairline line' },
                { id: 'classic', label: 'Classic', desc: 'Traditional double rule' },
                { id: 'academic', label: 'Academic', desc: 'University structured divider' },
                { id: 'notebook', label: 'Notebook', desc: 'Ruled notebook accent line' },
                { id: 'custom', label: 'Custom Box', desc: 'Framed header card' },
                { id: 'none', label: 'None', desc: 'No header, start directly' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onChange({ ...headerSettings, style: st.id as HeaderStyle })}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    headerSettings.style === st.id
                      ? 'border-indigo-500 bg-indigo-950/40 text-white'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="font-semibold text-xs text-white">{st.label}</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">{st.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Header Position */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Header Alignment / Position</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'split', label: 'Split L/R' },
                { id: 'top-left', label: 'Top Left' },
                { id: 'top-center', label: 'Center' },
                { id: 'top-right', label: 'Top Right' },
                { id: 'full-width', label: 'Full Width' },
              ].map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => onChange({ ...headerSettings, position: pos.id as HeaderPosition })}
                  className={`p-2 rounded-xl text-center text-xs font-medium border transition-all cursor-pointer ${
                    headerSettings.position === pos.id
                      ? 'border-indigo-500 bg-indigo-950/40 text-white'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Header Density */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Vertical Density (Space Saving)</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'compact', label: 'Compact', desc: 'Minimal vertical space' },
                { id: 'normal', label: 'Normal', desc: 'Balanced academic look' },
                { id: 'spacious', label: 'Spacious', desc: 'Generous breathing room' },
              ].map((den) => (
                <button
                  key={den.id}
                  type="button"
                  onClick={() => onChange({ ...headerSettings, density: den.id as HeaderDensity })}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    headerSettings.density === den.id
                      ? 'border-indigo-500 bg-indigo-950/40 text-white'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="font-semibold text-xs text-white">{den.label}</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">{den.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Handwritten Values Toggle */}
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
            <div>
              <label htmlFor="toggle-handwritten-fields" className="text-xs font-semibold text-neutral-200 block cursor-pointer">
                Render Values in Handwritten Font
              </label>
              <p className="text-[11px] text-neutral-400">
                Matches the student's selected pen & ink for student-written values.
              </p>
            </div>
            <input
              type="checkbox"
              id="toggle-handwritten-fields"
              checked={!!headerSettings.handwrittenFields}
              onChange={(e) => onChange({ ...headerSettings, handwrittenFields: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500 border-neutral-700 bg-neutral-900 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* TAB 3: PAGE NUMBER & DATE */}
      {activeTab === 'pageNumber' && (
        <div className="space-y-4">
          {/* Page Number Settings */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="toggle-pageNumber" className="text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer">
                <Hash className="w-3.5 h-3.5 text-indigo-400" />
                Page Number
              </label>
              <input
                type="checkbox"
                id="toggle-pageNumber"
                checked={!!headerSettings.fields.pageNumber?.enabled}
                onChange={(e) =>
                  updateField('pageNumber', {
                    enabled: e.target.checked,
                    position: headerSettings.fields.pageNumber?.position || 'top-right',
                    format: headerSettings.fields.pageNumber?.format || 'Page 1',
                  })
                }
                className="rounded text-indigo-600 focus:ring-indigo-500 border-neutral-700 bg-neutral-900 w-4 h-4 cursor-pointer"
              />
            </div>

            {headerSettings.fields.pageNumber?.enabled && (
              <div className="space-y-3 pt-2 border-t border-neutral-800 text-xs">
                {/* Position */}
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1.5 font-semibold">
                    Page Number Position
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    {[
                      { id: 'top-right', label: 'Top Right' },
                      { id: 'top-center', label: 'Top Center' },
                      { id: 'bottom-right', label: 'Bottom Right' },
                      { id: 'bottom-center', label: 'Bottom Center' },
                      { id: 'bottom-left', label: 'Bottom Left' },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() =>
                          updateField('pageNumber', {
                            position: pos.id as PageNumberPosition,
                          })
                        }
                        className={`p-1.5 rounded-lg text-center font-medium border text-[11px] transition-all cursor-pointer ${
                          headerSettings.fields.pageNumber?.position === pos.id
                            ? 'border-indigo-500 bg-indigo-950 text-white'
                            : 'border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format */}
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1.5 font-semibold">Format</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Page 1', label: 'Page 1' },
                      { id: '1', label: '1 (Number only)' },
                      { id: 'Page 1 of 5', label: 'Page 1 of 5' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() =>
                          updateField('pageNumber', {
                            format: fmt.id as PageNumberFormat,
                          })
                        }
                        className={`p-2 rounded-lg text-center font-mono text-xs border transition-all cursor-pointer ${
                          headerSettings.fields.pageNumber?.format === fmt.id
                            ? 'border-indigo-500 bg-indigo-950 text-white'
                            : 'border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date Settings */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="toggle-date" className="text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Submission Date
              </label>
              <input
                type="checkbox"
                id="toggle-date"
                checked={!!headerSettings.fields.date?.enabled}
                onChange={(e) => updateField('date', { enabled: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 border-neutral-700 bg-neutral-900 w-4 h-4 cursor-pointer"
              />
            </div>

            {headerSettings.fields.date?.enabled && (
              <div className="space-y-3 pt-2 border-t border-neutral-800 text-xs">
                {/* Editable Date Input */}
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1 font-semibold">Date Value</label>
                  <input
                    type="text"
                    value={headerSettings.fields.date?.value || ''}
                    onChange={(e) => updateField('date', { value: e.target.value })}
                    placeholder={getDefaultDateString(headerSettings.fields.date?.format || 'DD-MM-YYYY')}
                    className="w-full bg-neutral-900 px-3 py-1.5 rounded-lg text-xs text-white border border-neutral-700 outline-none"
                  />
                </div>

                {/* Date Format */}
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1 font-semibold">Date Format</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
                      { id: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                      { id: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() =>
                          updateField('date', {
                            format: fmt.id as DateFormat,
                          })
                        }
                        className={`p-2 rounded-lg text-center font-mono text-xs border transition-all cursor-pointer ${
                          headerSettings.fields.date?.format === fmt.id
                            ? 'border-indigo-500 bg-indigo-950 text-white'
                            : 'border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
