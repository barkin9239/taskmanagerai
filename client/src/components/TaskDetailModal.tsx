import { useState } from 'react';
import type { Task, SubTask, TaskAnalysis, TaskPriority, TaskStatus } from '../types';
import { deleteTask, analyzeTask, updateTask } from '../services/taskService';
import type { UserSearchResult } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import AnalyzeModal from './AnalyzeModal';
import UserSearchInput from './UserSearchInput';

const PRIORITY_BADGE: Record<TaskPriority, string> = {
  Low:    'bg-gray-100 text-gray-500',
  Medium: 'bg-blue-100 text-blue-700',
  High:   'bg-orange-100 text-orange-700',
  Urgent: 'bg-red-100 text-red-700',
};

const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];
const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'Todo',       label: 'To Do' },
  { value: 'InProgress', label: 'In Progress' },
  { value: 'Done',       label: 'Done' },
];

interface Props {
  task: Task;
  onClose: () => void;
  onRefresh: () => void;
}

export default function TaskDetailModal({ task, onClose, onRefresh }: Props) {
  const { user } = useAuth();
  const isOwner    = user?.userId === task.userId;
  const isAssignee = !!task.assignedToUserId && user?.userId === task.assignedToUserId;
  // canEdit = true for both roles; canEditAll = only owner
  const canEditAll = isOwner;

  // Local subtask state (visual only)
  const [subtasks, setSubtasks] = useState<SubTask[]>(task.subTasks);

  // Edit mode — owner gets full form, assignee gets status-only form
  const [editMode, setEditMode]     = useState(false);
  const [editTitle, setEditTitle]   = useState(task.title);
  const [editDesc, setEditDesc]     = useState(task.description);
  const [editPriority, setEditPri]  = useState<TaskPriority>(task.priority);
  const [editStatus, setEditStatus] = useState<TaskStatus>(task.status);
  const [editDueDate, setEditDue]   = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );
  const [editAssignee, setEditAssignee] = useState<UserSearchResult | null>(
    task.assignedToUserId
      ? { id: task.assignedToUserId, email: task.assignedToUserName, name: task.assignedToUserName }
      : null
  );
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState('');

  // Delete (owner only)
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]           = useState(false);

  // AI analysis (owner or assignee)
  const [analysis, setAnalysis]       = useState<TaskAnalysis | null>(null);
  const [analyzeError, setAnalyzeErr] = useState('');
  const [analyzing, setAnalyzing]     = useState(false);
  const [showAnalyze, setShowAnalyze] = useState(false);

  const toggleSubtask = (id: string) =>
    setSubtasks((prev) => prev.map((s) => s.id === id ? { ...s, isCompleted: !s.isCompleted } : s));

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteTask(task.id); onClose(); onRefresh(); }
    catch { setDeleting(false); setConfirmDelete(false); }
  };

  const handleSave = async () => {
    setSaveError('');
    setSaving(true);
    try {
      await updateTask(task.id, {
        // Owner fields — backend silently ignores these for assignees
        title:            editTitle.trim(),
        description:      editDesc.trim() || undefined,
        priority:         editPriority,
        dueDate:          editDueDate ? new Date(editDueDate).toISOString() : null,
        assignedToUserId: editAssignee?.id ?? null,
        // Both roles can change status
        status: editStatus,
      });
      setEditMode(false);
      onRefresh();
    } catch { setSaveError('Failed to save changes.'); }
    finally { setSaving(false); }
  };

  const handleAnalyze = async () => {
    setAnalysis(null); setAnalyzeErr('');
    setAnalyzing(true); setShowAnalyze(true);
    try { const { data } = await analyzeTask(task.id, false); setAnalysis(data); }
    catch { setAnalyzeErr('Analysis failed. Check your Anthropic API key or try again.'); }
    finally { setAnalyzing(false); }
  };

  const handleApply = async () => {
    try { await analyzeTask(task.id, true); setShowAnalyze(false); onClose(); onRefresh(); }
    catch { setAnalyzeErr('Could not apply suggestions.'); }
  };

  const donCount = subtasks.filter((s) => s.isCompleted).length;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-40 p-4 pt-16 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mb-4">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            {editMode ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={!canEditAll}
                className="flex-1 text-base font-semibold text-gray-900 border-b border-indigo-300 focus:outline-none pb-0.5 mr-3 disabled:opacity-60"
                autoFocus={canEditAll}
              />
            ) : (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_BADGE[task.priority]}`}>
                    {task.priority}
                  </span>
                  <span className="text-xs text-gray-400">{task.status.replace('InProgress', 'In Progress')}</span>
                </div>
                <h2 className="text-base font-semibold text-gray-900 leading-snug">{task.title}</h2>
              </div>
            )}

            <div className="flex items-center gap-2 shrink-0">
              {/* Edit button: owner → full edit; assignee → status-only edit */}
              {!editMode && (isOwner || isAssignee) && (
                <button
                  onClick={() => setEditMode(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  {isOwner ? 'Edit' : 'Update Status'}
                </button>
              )}
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* ---- VIEW MODE ---- */}
            {!editMode && (
              <>
                {task.description && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{task.description}</p>
                  </div>
                )}

                {task.dueDate && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Due Date</p>
                    <p className="text-sm text-gray-700">
                      {new Date(task.dueDate).toLocaleDateString('en-GB', {
                        weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Assigned To</p>
                  <p className="text-sm text-gray-700">
                    {task.assignedToUserName || <span className="text-gray-400">Unassigned</span>}
                  </p>
                </div>

                {subtasks.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-500">Subtasks</p>
                      <span className="text-xs text-gray-400">{donCount}/{subtasks.length} done</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full mb-3 overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full transition-all" style={{ width: `${subtasks.length ? (donCount / subtasks.length) * 100 : 0}%` }}/>
                    </div>
                    <ul className="space-y-2">
                      {subtasks.map((s) => (
                        <li key={s.id} onClick={() => toggleSubtask(s.id)} className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center transition-colors ${s.isCompleted ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 group-hover:border-indigo-400'}`}>
                            {s.isCompleted && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                              </svg>
                            )}
                          </div>
                          <span className={`text-sm ${s.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {s.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-1">
                  {/* AI analyze — owner or assignee */}
                  {(isOwner || isAssignee) && (
                    <button
                      onClick={handleAnalyze}
                      className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/>
                      </svg>
                      Analyze with AI
                    </button>
                  )}

                  {/* Delete — owner only */}
                  {isOwner && (
                    !confirmDelete ? (
                      <button onClick={() => setConfirmDelete(true)} className="w-full py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium transition-colors">
                        Delete Task
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                        <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-semibold transition-colors">
                          {deleting ? 'Deleting…' : 'Yes, Delete'}
                        </button>
                      </div>
                    )
                  )}
                </div>
              </>
            )}

            {/* ---- EDIT MODE ---- */}
            {editMode && (
              <div className="space-y-4">
                {!isOwner && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    You are the assignee — only Status can be changed.
                  </p>
                )}

                {saveError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{saveError}</p>
                )}

                {/* Description — owner only */}
                {canEditAll && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
                    <textarea rows={3} value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"/>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {/* Priority — owner only */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Priority</label>
                    <select value={editPriority} onChange={(e) => setEditPri(e.target.value as TaskPriority)} disabled={!canEditAll}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400">
                      {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  {/* Status — both roles */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Status {!canEditAll && <span className="text-indigo-500">(editable)</span>}
                    </label>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Due date — owner only */}
                {canEditAll && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Due Date</label>
                    <input type="date" value={editDueDate} onChange={(e) => setEditDue(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                  </div>
                )}

                {/* Assign to — owner only */}
                {canEditAll && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Assign To <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <UserSearchInput value={editAssignee} onChange={setEditAssignee}/>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => { setEditMode(false); setSaveError(''); }}
                    className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="button" onClick={handleSave} disabled={saving || (canEditAll && !editTitle.trim())}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold transition-colors">
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnalyzeModal
        isOpen={showAnalyze}
        taskTitle={task.title}
        analysis={analysis}
        isLoading={analyzing}
        error={analyzeError}
        onClose={() => { setShowAnalyze(false); setAnalyzeErr(''); }}
        onApply={handleApply}
      />
    </>
  );
}
