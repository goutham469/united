import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    PointElement
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { baseURL } from '../common/SummaryApi';

export const Client_URL = import.meta.env.VITE_CLIENT_URL;

// Register additional chart components
ChartJS.register(
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend, 
    ArcElement,
    LineElement,
    PointElement
);

function ProductMetrics() {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(30); // 30 seconds default

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${baseURL}/api/survey/all-product-view-metrics`);
            const data = await response.json();
            setMetrics(data.message || []);
        } catch (error) {
            console.error('Error fetching metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, refreshInterval * 1000);
        return () => clearInterval(interval);
    }, [refreshInterval]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Product Analytics Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <select 
                            value={refreshInterval}
                            onChange={(e) => setRefreshInterval(Number(e.target.value))}
                            className="px-3 py-2 border rounded-lg text-sm"
                        >
                            <option value={15}>Refresh: 15s</option>
                            <option value={30}>Refresh: 30s</option>
                            <option value={60}>Refresh: 1m</option>
                        </select>
                        <button 
                            onClick={fetchMetrics}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                            Refresh Now
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        <SummaryStats metrics={metrics} />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <ViewsPieChart metrics={metrics} />
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
            <ProductBarChart metrics={metrics} />
                            </div>
                            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                                <ViewsTimelineChart metrics={metrics} />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <MetricsTable metrics={metrics} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ProductMetrics;

function ViewsTimelineChart({ metrics }) {
    const sortedMetrics = [...metrics].sort((a, b) => 
        new Date(a.updatedAt) - new Date(b.updatedAt)
    );

    const data = {
        labels: sortedMetrics.map(item => new Date(item.updatedAt).toLocaleDateString()),
        datasets: [{
            label: 'Views Over Time',
            data: sortedMetrics.map(item => item.views),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Product Views Timeline',
                font: { size: 16 }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    return <Line data={data} options={options} />;
}

function ViewsPieChart({ metrics }) {
    const [collapse, setCollapse] = useState(false);
    
    // Sort metrics by views and take top 5
    const topMetrics = [...metrics]
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

    const data = {
        labels: topMetrics.map(item => item.productId),
        datasets: [{
            data: topMetrics.map(item => item.views),
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(251, 191, 36, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(139, 92, 246, 0.8)'
            ],
            borderWidth: 1
        }]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    boxWidth: 15,
                    padding: 15,
                    font: { size: 12 }
                }
            },
            title: {
                display: true,
                text: 'Top 5 Products by Views',
                font: { size: 16 }
            }
        }
    };

    return (
        <div className="chart-container">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Views Distribution</h2>
                <button 
                    onClick={() => setCollapse(!collapse)}
                    className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                >
                    {collapse ? 'Show Chart' : 'Hide Chart'}
                </button>
            </div>
            
            {!collapse && <Pie data={data} options={options} />}
        </div>
    );
}

function ProductBarChart({ metrics }) {
    const [collapse, setCollapse] = useState(false);
    const [sortBy, setSortBy] = useState('views'); // 'views' or 'upTime'

    const sortedMetrics = [...metrics].sort((a, b) => 
        sortBy === 'views' ? b.views - a.views : b.upTime - a.upTime
    ).slice(0, 10);

    const data = {
        labels: sortedMetrics.map(item => item.productId),
        datasets: [{
            label: sortBy === 'views' ? 'Views' : 'Uptime (seconds)',
            data: sortedMetrics.map(item => 
                sortBy === 'views' ? item.views : (item.upTime / 1000).toFixed(2)
            ),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            borderRadius: 4
        }]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: `Top 10 Products by ${sortBy === 'views' ? 'Views' : 'Uptime'}`,
                font: { size: 16 }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    return (
        <div className="chart-container">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-800">Product Performance</h2>
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-1 text-sm border rounded-lg"
                    >
                        <option value="views">By Views</option>
                        <option value="upTime">By Uptime</option>
                    </select>
                </div>
                <button 
                    onClick={() => setCollapse(!collapse)}
                    className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                >
                    {collapse ? 'Show Chart' : 'Hide Chart'}
                </button>
            </div>
            
            {!collapse && <Bar data={data} options={options} />}
        </div>
    );
}

function MetricsTable({ metrics }) {
    const [sortConfig, setSortConfig] = useState({ key: 'views', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');

    const sortedMetrics = [...metrics].sort((a, b) => {
        if (sortConfig.key === 'updatedAt') {
            return sortConfig.direction === 'asc' 
                ? new Date(a.updatedAt) - new Date(b.updatedAt)
                : new Date(b.updatedAt) - new Date(a.updatedAt);
        }
        return sortConfig.direction === 'asc'
            ? a[sortConfig.key] - b[sortConfig.key]
            : b[sortConfig.key] - a[sortConfig.key];
    });

    const filteredMetrics = sortedMetrics.filter(item =>
        item.productId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    return (
                <div>
            <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Detailed Metrics</h2>
                    <input
                        type="text"
                        placeholder="Search by Product ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded-lg text-sm w-64"
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('productId')}>
                                Product ID {sortConfig.key === 'productId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('views')}>
                                Views {sortConfig.key === 'views' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Users
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('upTime')}>
                                Uptime {sortConfig.key === 'upTime' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('updatedAt')}>
                                Last Updated {sortConfig.key === 'updatedAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredMetrics.map((item) => (
                            <tr key={item._id.$oid} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                                    <a href={`/product/${item.productId}`} target="_blank" rel="noopener noreferrer">
                                        {item.productId}
                                    </a>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.views.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.users.length.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {(item.upTime / 1000).toFixed(2)}s
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(item.updatedAt).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SummaryStats({ metrics }) {
    if (!metrics || metrics.length === 0) return null;

    const totalViews = metrics.reduce((sum, item) => sum + item.views, 0);
    const totalProducts = metrics.length;
    const totalViewedTime = metrics.reduce((sum, item) => sum + item.upTime, 0) / 1000;
    const avgViewedTime = totalViewedTime / totalProducts;

    const userIds = new Set();
    metrics.forEach((obj) => {
        obj.users.forEach((user) => {
            userIds.add(user.userId);
        });
    });

    const stats = [
        {
            title: 'Total Products ',
            value: totalProducts.toLocaleString(),
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            title: 'Live ADD-TO-CART Users',
            value: userIds.size.toLocaleString(),
            bgColor: 'bg-green-50',
            textColor: 'text-green-600'
        },
        {
            title: 'Total Views',
            value: totalViews.toLocaleString(),
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600'
        },
        {
            title: 'Avg. View Time',
            value: `${avgViewedTime.toFixed(2)}s`,
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600'
        },
        {
            title: 'Total View Time',
            value: `${totalViewedTime.toFixed(2)}s`,
            bgColor: 'bg-pink-50',
            textColor: 'text-pink-600'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {stats.map((stat, index) => (
                <div key={index} className={`${stat.bgColor} rounded-xl p-6 shadow-sm`}>
                    <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                    <p className={`text-2xl font-bold ${stat.textColor} mt-2`}>{stat.value}</p>
            </div>
            ))}
        </div>
    );
}
