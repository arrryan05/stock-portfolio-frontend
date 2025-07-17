'use client';

import React, { useState } from 'react';
import {
    useTable,
    useSortBy,
    Column,
    Row,
    TableOptions,
} from 'react-table';
import { TableData } from '@/types/stock';

export interface SectorTotals {
    investment: number;
    presentValue: number;
    gainLoss: number;
}

export interface SectorGroup {
    sector: string;
    rows: TableData[];
    totals: SectorTotals;
}

interface Props {
    groups: SectorGroup[];
}

export default function GroupedPortfolioTable({ groups }: Props) {
    // Define columns once
    const columns = React.useMemo<Column<TableData>[]>(
        () => [
            { Header: 'Particulars', accessor: 'name' },
            { Header: 'Purchase Price', accessor: 'purchasePrice' },
            { Header: 'Qty', accessor: 'qty' },
            { Header: 'Investment', accessor: 'investment' },
            { Header: 'Portfolio %', accessor: 'portfolioPct' },
            { Header: 'Exchange', accessor: 'exchange' },
            { Header: 'CMP', accessor: 'cmp' },
            { Header: 'Present Value', accessor: 'presentValue' },
            {
                Header: 'Gain/Loss',
                accessor: 'gainLoss',
                Cell: ({ value }) =>
                    typeof value === 'number' ? (
                        <span className={value >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {value.toFixed(2)}
                        </span>
                    ) : (
                        <span className="text-gray-400">–</span>
                    ),

            },
            { Header: 'P/E Ratio', accessor: 'peRatio' },
            { Header: 'Latest Earnings', accessor: 'latestEarnings' },
        ],
        []
    );

    return (
        <div className="space-y-6">
            {groups.map((group) => (
                <SectorSection
                    key={group.sector}
                    group={group}
                    columns={columns}
                />
            ))}
        </div>
    );
}

interface SectorSectionProps {
    group: SectorGroup;
    columns: Column<TableData>[];
}

function SectorSection({ group, columns }: SectorSectionProps) {
    const [open, setOpen] = useState(true);

    // react-table hook
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable<TableData>(
        { columns, data: group.rows } as TableOptions<TableData>,
        useSortBy
    );

    return (
        <div className="border rounded">
            {/* Header */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full px-4 py-2 bg-gray-100 flex justify-between items-center"
            >
                <span className="font-semibold">{group.sector}</span>
                <span>
                    {open ? '▼' : '▲'}{' '}
                    <span className="ml-4 text-sm">
                        Inv: {group.totals.investment.toFixed(2)} · PV:{' '}
                        {group.totals.presentValue.toFixed(2)} · Gain:{' '}
                        <span
                            className={
                                group.totals.gainLoss >= 0
                                    ? 'text-green-600'
                                    : 'text-red-600'
                            }
                        >
                            {group.totals.gainLoss.toFixed(2)}
                        </span>
                    </span>
                </span>
            </button>

            {/* Table */}
            {open && (
                <div className="overflow-x-auto">
                    <table
                        {...getTableProps()}
                        className="min-w-full divide-y divide-gray-200"
                    >
                        <thead className="bg-gray-50">
                            {headerGroups.map((hg) => (
                                <tr {...hg.getHeaderGroupProps()}>
                                    {hg.headers.map((column) => (
                                        <th
                                            {...column.getHeaderProps(
                                                // @ts-ignore
                                                column.getSortByToggleProps()
                                            )}
                                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {column.render('Header')}
                                            <span>
                                                {/* @ts-ignore */}
                                                {column.isSorted
                                                    ? // @ts-ignore
                                                    column.isSortedDesc
                                                        ? ' 🔽'
                                                        : ' 🔼'
                                                    : ''}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody
                            {...getTableBodyProps()}
                            className="bg-white divide-y divide-gray-200"
                        >
                            {rows.map((row: Row<TableData>) => {
                                prepareRow(row);
                                return (
                                    <tr {...row.getRowProps()}>
                                        {row.cells.map((cell) => (
                                            <td
                                                {...cell.getCellProps()}
                                                className="px-4 py-2 whitespace-nowrap text-sm text-gray-700"
                                            >
                                                {cell.render('Cell')}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
