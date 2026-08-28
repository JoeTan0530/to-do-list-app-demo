'use client';

import React, { useState, useRef } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical, faEdit, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';

// ============================================================
// Types
// ============================================================
interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface CustomDraggableTableProps {
  /** Unique identifier for the table (for drag context) */
  tableId?: string;
  /** Array of column definitions */
  columns: Column[];
  /** Array of row data (must have a unique id field) */
  data: any[];
  /** Name of the field that holds the unique id (default: 'id') */
  rowKey?: string;
  /** Callback when order changes: receives the reordered array */
  onReorder?: (newData: any[]) => void;
  /** Callback for edit action */
  onEdit?: (item: any) => void;
  /** Callback for view action */
  onView?: (item: any) => void;
  /** Callback for delete action */
  onDelete?: (item: any) => void;
  /** Whether to show action buttons (default: true) */
  showActions?: boolean;
  /** Optional custom class for the table container */
  className?: string;
  /** Optional custom class for rows */
  rowClassName?: string;
  /** Optional custom class for cells */
  cellClassName?: string;
}

// ============================================================
// Draggable Row Component
// ============================================================
interface DraggableRowProps {
  row: any;
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
  columns: Column[];
  rowKey: string;
  showActions: boolean;
  onEdit?: (item: any) => void;
  onView?: (item: any) => void;
  onDelete?: (item: any) => void;
  rowClassName?: string;
  cellClassName?: string;
}

const DraggableRow: React.FC<DraggableRowProps> = ({
  row,
  index,
  moveRow,
  columns,
  rowKey,
  showActions,
  onEdit,
  onView,
  onDelete,
  rowClassName,
  cellClassName,
}) => {
  const ref = useRef<HTMLTableRowElement>(null);

  // Drag hook
  const [{ isDragging }, drag] = useDrag({
    type: 'ROW',
    item: { index, id: row[rowKey] },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Drop hook
  const [, drop] = useDrop({
    accept: 'ROW',
    hover(item: { index: number; id: string }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      // Time to actually perform the action
      moveRow(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  // Attach both drag and drop refs
  drag(drop(ref));

  const opacity = isDragging ? 0.4 : 1;

  return (
    <tr ref={ref} style={{ opacity }} className={`border-b ${rowClassName || ''}`}>
      {/* Drag Handle */}
      <td className={`p-2 text-center ${cellClassName || ''}`}>
        <span className="cursor-move text-gray-400 hover:text-gray-600">
          <FontAwesomeIcon icon={faGripVertical} />
        </span>
      </td>
      {/* Data Columns */}
      {columns.map((col) => (
        <td key={col.key} className={`p-2 ${cellClassName || ''}`}>
          {col.render ? col.render(row[col.key], row) : row[col.key]}
        </td>
      ))}
      {/* Action Buttons */}
      {showActions && (
        <td className={`p-2 text-center ${cellClassName || ''}`}>
          <div className="flex justify-center gap-2">
            {onView && (
              <button
                onClick={() => onView(row)}
                className="text-blue-500 hover:text-blue-700"
                title="View"
              >
                <FontAwesomeIcon icon={faEye} />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(row)}
                className="text-yellow-500 hover:text-yellow-700"
                title="Edit"
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(row)}
                className="text-red-500 hover:text-red-700"
                title="Delete"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
};

// ============================================================
// Main Component
// ============================================================
const CustomDraggableTable: React.FC<CustomDraggableTableProps> = ({
  tableId = 'draggable-table',
  columns,
  data,
  rowKey = 'id',
  onReorder,
  onEdit,
  onView,
  onDelete,
  showActions = true,
  className = '',
  rowClassName = '',
  cellClassName = '',
}) => {
  // Internal state for the ordered list
  const [items, setItems] = useState(data);

  // Update internal state when prop data changes (if parent controls)
  React.useEffect(() => {
    setItems(data);
  }, [data]);

  const moveRow = (dragIndex: number, hoverIndex: number) => {
    const newItems = [...items];
    const [draggedItem] = newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, draggedItem);
    setItems(newItems);
    if (onReorder) {
      onReorder(newItems);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`w-full overflow-x-auto ${className}`}>
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {/* Drag handle column header */}
              <th className="p-2 text-left text-sm font-semibold text-gray-600 w-10">
                <span className="sr-only">Drag</span>
              </th>
              {columns.map((col) => (
                <th key={col.key} className="p-2 text-left text-sm font-semibold text-gray-600">
                  {col.header}
                </th>
              ))}
              {showActions && (
                <th className="p-2 text-center text-sm font-semibold text-gray-600 w-24">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((row, index) => (
              <DraggableRow
                key={row[rowKey] || index}
                row={row}
                index={index}
                moveRow={moveRow}
                columns={columns}
                rowKey={rowKey}
                showActions={showActions}
                onEdit={onEdit}
                onView={onView}
                onDelete={onDelete}
                rowClassName={rowClassName}
                cellClassName={cellClassName}
              />
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={columns.length + 2} className="p-4 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DndProvider>
  );
};

export default CustomDraggableTable;