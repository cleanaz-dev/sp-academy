"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { useState, useCallback } from "react";

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
        className="h-4 w-4"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="h-4 w-4"
      />
    ),
  }),

  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue() || "N/A",
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => info.getValue(),
  }),
];

const EmailUserTable = ({ users, selectedUsers, onSelectionChange }) => {
  // Initialize rowSelection based on selectedUsers
  const [rowSelection, setRowSelection] = useState(() => {
    return selectedUsers.reduce((acc, user) => {
      const rowIndex = users.findIndex((u) => u.id === user.id);
      if (rowIndex !== -1) {
        acc[rowIndex] = true;
      }
      return acc;
    }, {});
  });

  // Memoize the selection change handler
  const handleSelectionChange = useCallback(
    (updatedSelection) => {
      const selectedUsers = Object.keys(updatedSelection)
        .filter((index) => updatedSelection[index])
        .map((index) => users[parseInt(index)]);
      onSelectionChange(selectedUsers);
    },
    [users, onSelectionChange],
  );

  const table = useReactTable({
    data: users,
    columns,
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      handleSelectionChange(newSelection);
    },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={row.getToggleSelectedHandler()}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="whitespace-nowrap px-6 py-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmailUserTable;
