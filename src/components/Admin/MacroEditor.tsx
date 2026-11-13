import { useState } from 'react';
import type { Macro, MacroType } from '../../lib/macros';
import { executeMacro, validateMacroCode, MACRO_TEMPLATES, createMacro } from '../../lib/macros';

interface MacroEditorProps {
  macro?: Macro;
  onSave?: (macro: Macro) => void;
  onDelete?: (macroId: string) => void;
  currentUser?: string;
}

export const MacroEditor = ({
  macro,
  onSave,
  onDelete,
  currentUser = 'User',
}: MacroEditorProps) => {
  const [name, setName] = useState(macro?.name || '');
  const [type, setType] = useState<MacroType>(macro?.type || 'script');
  const [code, setCode] = useState(macro?.code || '');
  const [description, setDescription] = useState(macro?.description || '');
  const [icon, setIcon] = useState(macro?.icon || '');
  const [color, setColor] = useState(macro?.color || '#a855f7');

  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const validation = validateMacroCode(code);

  const handleExecute = async () => {
    setExecuting(true);
    setErrors([]);
    setResult(null);

    try {
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }

      const testMacro = createMacro(name, type, code, currentUser);
      const execResult = executeMacro(testMacro);

      if (execResult.success) {
        setResult({
          output: execResult.output,
          executionTime: execResult.executionTime,
        });
      } else {
        setErrors([execResult.error || 'Unknown execution error']);
      }
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Execution failed']);
    } finally {
      setExecuting(false);
    }
  };

  const handleSave = () => {
    if (!name.trim() || !code.trim()) {
      setErrors(['Name and code are required']);
      return;
    }

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    const newMacro: Macro = {
      id: macro?.id || `macro_${Date.now()}`,
      name,
      type,
      code,
      description: description || undefined,
      icon: icon || undefined,
      color,
      createdBy: macro?.createdBy || currentUser,
      createdAt: macro?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave?.(newMacro);
  };

  const applyTemplate = (templateKey: string) => {
    const template = MACRO_TEMPLATES[templateKey];
    if (template) {
      setName(template.name || '');
      setCode(template.code || '');
      setIcon(template.icon || '');
      setColor(template.color || '#a855f7');
    }
  };

  return (
    <div className="macro-editor">
      <div className="editor-header">
        <h2>⚙️ {macro ? 'Edit' : 'New'} Macro</h2>
      </div>

      <div className="editor-layout">
        <div className="editor-left">
          <div className="input-group">
            <label>Macro Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Roll Initiative"
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label>Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MacroType)}
              className="select-input"
            >
              <option value="script">Script</option>
              <option value="chat">Chat</option>
              <option value="dice">Dice Roll</option>
              <option value="ability">Ability Check</option>
            </select>
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this macro do?"
              className="textarea-field"
              rows={2}
            />
          </div>

          <div className="input-group">
            <label>Icon & Color</label>
            <div className="icon-color">
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🎲"
                className="input-field icon-input"
              />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="color-input"
              />
            </div>
          </div>

          <div className="templates">
            <label>Quick Templates</label>
            <div className="template-buttons">
              {Object.entries(MACRO_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  className="template-btn"
                  onClick={() => applyTemplate(key)}
                  title={template.description}
                >
                  {template.icon} {template.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="editor-right">
          <div className="code-section">
            <label>Code *</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Write your macro code here\nreturn 'Hello, World!'"
              className="code-textarea"
              spellCheck={false}
            />
          </div>

          {!validation.valid && (
            <div className="error-box">
              <h4>⚠️ Syntax Errors</h4>
              <ul>
                {validation.errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {result && (
            <div className="result-box">
              <h4>✓ Execution Result</h4>
              <div className="result-content">
                <p className="execution-time">
                  Executed in {result.executionTime.toFixed(2)}ms
                </p>
                <pre className="result-output">
                  {typeof result.output === 'string'
                    ? result.output
                    : JSON.stringify(result.output, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {errors.length > 0 && !validation.valid && (
            <div className="error-box">
              <h4>❌ Errors</h4>
              <ul>
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="editor-actions">
        <button
          className="btn-execute"
          onClick={handleExecute}
          disabled={!code.trim() || executing}
        >
          {executing ? '⏳ Executing...' : '▶️ Test Execute'}
        </button>
        <button className="btn-save" onClick={handleSave}>
          💾 Save Macro
        </button>
        {macro && (
          <button className="btn-delete" onClick={() => onDelete?.(macro.id)}>
            🗑️ Delete
          </button>
        )}
      </div>

      <div className="macro-help">
        <h4>📚 Available Variables</h4>
        <div className="variables-list">
          <div className="var">
            <code>actor</code> - Current actor object
          </div>
          <div className="var">
            <code>token</code> - Current token object
          </div>
          <div className="var">
            <code>scene</code> - Current scene object
          </div>
          <div className="var">
            <code>user</code> - Current user object
          </div>
          <div className="var">
            <code>data</code> - Custom data object
          </div>
          <div className="var">
            <code>Math</code> - JavaScript Math object
          </div>
        </div>
      </div>

      <style>{`
        .macro-editor {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-height: 1000px;
          overflow-y: auto;
        }

        .editor-header h2 {
          margin: 0;
          font-size: 24px;
          color: #fff;
        }

        .editor-layout {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 24px;
          flex: 1;
        }

        .editor-left,
        .editor-right {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .input-field,
        .select-input,
        .textarea-field {
          padding: 8px 12px;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          color: #ccc;
          font-size: 12px;
          font-family: inherit;
        }

        .input-field:focus,
        .select-input:focus,
        .textarea-field:focus {
          outline: none;
          border-color: #a855f7;
        }

        .icon-color {
          display: flex;
          gap: 8px;
        }

        .icon-input {
          flex: 1;
        }

        .color-input {
          width: 50px;
          height: 36px;
          border: 1px solid #333;
          border-radius: 6px;
          cursor: pointer;
        }

        .templates {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .templates label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .template-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }

        .template-btn {
          padding: 8px;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 4px;
          color: #ccc;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .template-btn:hover {
          border-color: #a855f7;
          color: #a855f7;
        }

        .code-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .code-section label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .code-textarea {
          flex: 1;
          padding: 12px;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          color: #ccc;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          resize: none;
          line-height: 1.5;
          min-height: 300px;
        }

        .code-textarea:focus {
          outline: none;
          border-color: #a855f7;
        }

        .error-box,
        .result-box {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 12px;
        }

        .error-box {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }

        .error-box h4 {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #ef4444;
        }

        .error-box ul {
          margin: 0;
          padding-left: 20px;
          list-style: none;
          color: #ef4444;
          font-size: 11px;
        }

        .error-box li {
          margin-bottom: 4px;
        }

        .result-box {
          border-color: #4ade80;
          background: rgba(74, 222, 128, 0.05);
        }

        .result-box h4 {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #4ade80;
        }

        .execution-time {
          margin: 0 0 8px 0;
          font-size: 11px;
          color: #999;
        }

        .result-output {
          margin: 0;
          padding: 8px;
          background: #1a1a1a;
          border-radius: 4px;
          color: #4ade80;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          max-height: 200px;
          overflow-y: auto;
        }

        .editor-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-execute,
        .btn-save,
        .btn-delete {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 12px;
        }

        .btn-execute {
          background: #0ea5e9;
          color: #fff;
        }

        .btn-execute:hover:not(:disabled) {
          background: #0284c7;
        }

        .btn-execute:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-save {
          background: #a855f7;
          color: #fff;
        }

        .btn-save:hover {
          background: #9333ea;
        }

        .btn-delete {
          background: #ef4444;
          color: #fff;
        }

        .btn-delete:hover {
          background: #dc2626;
        }

        .macro-help {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 12px;
        }

        .macro-help h4 {
          margin: 0 0 12px 0;
          font-size: 12px;
          color: #a855f7;
          text-transform: uppercase;
          font-weight: 600;
        }

        .variables-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .var {
          font-size: 11px;
          color: #ccc;
          padding: 6px;
          background: #1a1a1a;
          border-radius: 4px;
          border-left: 2px solid #a855f7;
          padding-left: 8px;
        }

        .var code {
          color: #4ade80;
          font-family: 'Courier New', monospace;
        }

        @media (max-width: 1024px) {
          .editor-layout {
            grid-template-columns: 1fr;
          }

          .template-buttons {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
