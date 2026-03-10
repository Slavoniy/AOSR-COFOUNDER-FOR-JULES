import React, { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  RowData
} from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';

export interface EstimateDataRow {
  id: string; // Internal id for tracking
  workName: string;
  materials: string;
  quantity: number;
  unit: string;
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
    removeRow: (rowIndex: number) => void;
  }
}

// Editable Cell Component
const EditableCell = ({ getValue, row: { index }, column: { id }, table }: any) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);

  // When the input is blurred, we'll call our table meta's updateData function
  const onBlur = () => {
    table.options.meta?.updateData(index, id, value);
  };

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <input
      value={value as string | number}
      onChange={e => setValue(e.target.value)}
      onBlur={onBlur}
      className="w-full bg-transparent border-0 focus:ring-2 focus:ring-blue-500 rounded p-1"
    />
  );
};

interface EditableActTableProps {
  data: EstimateDataRow[];
  onChange: (data: EstimateDataRow[]) => void;
}

export const EditableActTable: React.FC<EditableActTableProps> = ({ data, onChange }) => {

  const columns = React.useMemo<ColumnDef<EstimateDataRow>[]>(
    () => [
      {
        header: 'Наименование работы',
        accessorKey: 'workName',
        cell: EditableCell,
        size: 300,
      },
      {
        header: 'Материалы',
        accessorKey: 'materials',
        cell: EditableCell,
        size: 300,
      },
      {
        header: 'Ед. изм.',
        accessorKey: 'unit',
        cell: EditableCell,
        size: 100,
      },
      {
        header: 'Кол-во',
        accessorKey: 'quantity',
        cell: EditableCell,
        size: 100,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row, table }) => (
          <button
            onClick={() => table.options.meta?.removeRow(row.index)}
            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
            title="Удалить строку"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ),
        size: 50,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        onChange(
          data.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...data[rowIndex]!,
                [columnId]: value,
              };
            }
            return row;
          })
        );
      },
      removeRow: (rowIndex) => {
        onChange(data.filter((_, index) => index !== rowIndex));
      }
    },
  });

  return (
    <div className="w-full overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white">
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200 uppercase">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-4 py-3 font-medium"
                  style={{ width: header.column.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-4 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          Данные не загружены или отсутствуют
        </div>
      )}
    </div>
  );
};
