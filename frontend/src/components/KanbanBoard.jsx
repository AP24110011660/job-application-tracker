import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Briefcase, Edit2, Trash2, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';

const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected'];

const KanbanCard = ({ job, index, onEdit, onDelete }) => (
  <Draggable draggableId={job._id} index={index}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={`glass-card bg-white p-4 transition-all duration-200 group ${
          snapshot.isDragging ? 'shadow-2xl scale-105 border-indigo-500 z-50 rotating-card relative' : 'shadow-sm hover:border-indigo-500/30 hover:shadow-md'
        }`}
        style={{ borderRadius: '12px', ...provided.draggableProps.style }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <p className="font-semibold text-slate-800 text-sm truncate">{job.company}</p>
            <p className="text-slate-500 text-xs mt-0.5 truncate">{job.role}</p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(job); }} 
              className="w-7 h-7 rounded-lg bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center text-indigo-600"
            >
              <Edit2 size={12} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(job); }} 
              className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Calendar size={11} className="text-cyan-500" />
            {new Date(job.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
        {job.notes && (
          <p className="text-slate-500 text-xs mt-3 line-clamp-2 border-t border-slate-100 pt-2">
            {job.notes}
          </p>
        )}
      </div>
    )}
  </Draggable>
);

const KanbanBoard = ({ jobs, onStatusChange, onEdit, onDelete }) => {
  const jobsByStatus = STATUSES.reduce((acc, status) => {
    // Sort slightly so new additions flow to the bottom (as per index requirements usually for dragging clarity)
    acc[status] = jobs.filter(job => job.status === status);
    return acc;
  }, {});

  const statusColors = {
    Applied: 'border-t-blue-500',
    Interview: 'border-t-amber-500',
    Offer: 'border-t-emerald-500',
    Rejected: 'border-t-red-500',
  };

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return; 
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Send only the jobId and the new status to exactly match the external handler expectation
    onStatusChange(draggableId, destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 fade-in items-start">
        {STATUSES.map((status) => {
          const statusJobs = jobsByStatus[status] || [];
          
          return (
            <div key={status} className="flex flex-col h-full min-h-[300px]">
              {/* Status Header Mapping */}
              <div 
                className={`glass-card p-3 border-t-2 mb-3 bg-white ${statusColors[status]}`} 
                style={{ borderRadius: '12px' }}
              >
                <div className="flex items-center justify-between">
                  <StatusBadge status={status} />
                  <span className="text-xs text-slate-600 font-semibold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                    {statusJobs.length}
                  </span>
                </div>
              </div>

              {/* Strict Droppable Target Bins */}
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 rounded-xl transition-colors p-1.5 -m-1.5 space-y-3 min-h-[150px] ${
                      snapshot.isDraggingOver 
                        ? 'bg-slate-100/80 border-2 border-dashed border-indigo-300' 
                        : 'border-2 border-transparent'
                    }`}
                  >
                    {statusJobs.map((job, index) => (
                      <KanbanCard key={job._id} job={job} index={index} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                    {provided.placeholder}
                    
                    {/* Graceful native dynamic empty states strictly per bin */}
                    {statusJobs.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs bg-slate-50/50">
                        <Briefcase size={20} className="mb-2 opacity-50" />
                        Drop applications
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
