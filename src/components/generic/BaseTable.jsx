import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './BaseTable.css';

const BaseTable = ({
    data,
    columns,
    onRowClick,
    onEdit,
    onDelete,
    isLoading,
    error,
    emptyMessage = 'Нет данных для отображения'
}) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = React.useMemo(() => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [data, sortConfig]);

    if (isLoading) {
        return <div className="base-table-loading">Загрузка...</div>;
    }

    if (error) {
        return <div className="base-table-error">Ошибка: {error}</div>;
    }

    if (!data || data.length === 0) {
        return <div className="base-table-empty">{emptyMessage}</div>;
    }

    return (
        <div className="base-table-container">
            <table className="base-table">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                onClick={() => column.sortable && handleSort(column.key)}
                                className={column.sortable ? 'sortable' : ''}
                            >
                                {column.title}
                                {sortConfig.key === column.key && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                        ))}
                        {(onEdit || onDelete) && <th>Действия</th>}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((row, index) => (
                        <tr
                            key={row.id || index}
                            onClick={() => onRowClick && onRowClick(row)}
                            className={onRowClick ? 'clickable' : ''}
                        >
                            {columns.map((column) => (
                                <td key={column.key}>
                                    {column.render ? column.render(row) : row[column.key]}
                                </td>
                            ))}
                            {(onEdit || onDelete) && (
                                <td className="actions-cell">
                                    {onEdit && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(row);
                                            }}
                                            className="action-button edit"
                                        >
                                            Редактировать
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(row);
                                            }}
                                            className="action-button delete"
                                        >
                                            Удалить
                                        </button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

BaseTable.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            render: PropTypes.func,
            sortable: PropTypes.bool
        })
    ).isRequired,
    onRowClick: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    isLoading: PropTypes.bool,
    error: PropTypes.string,
    emptyMessage: PropTypes.string
};

export default BaseTable; 