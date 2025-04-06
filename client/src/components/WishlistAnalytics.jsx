import React, { useState } from 'react';
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

// Helper function to generate MongoDB-style IDs
function generateMongoId() {
    const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
    const randomPart = Math.random().toString(16).substr(2, 18);
    return timestamp + randomPart.padStart(18, '0');
}

// Dummy data for demonstration
const DUMMY_DATA = {
    wishlistData: Array.from({ length: 20 }, (_, i) => ({
        productId: generateMongoId(),
        userId: generateMongoId(),
        updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    })),
    combinedStats: {
        totalWishlistProducts: 45,
        activeUsers: 128,
        totalWishlistItems: 256,
        conversionRate: 35.8,
        avgItemsPerUser: 2.4,
        userEngagement: {
            high: 25,
            medium: 48,
            low: 55
        },
        userActivity: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: Math.floor(Math.random() * 50 + 30)
        })),
        userDetails: Array.from({ length: 15 }, (_, i) => ({
            userId: generateMongoId(),
            wishlistCount: Math.floor(Math.random() * 10 + 1),
            activity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
            lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        }))
    }
};

function WishlistAnalytics() {
    const [timeRange, setTimeRange] = useState('all');
    const [refreshInterval, setRefreshInterval] = useState(30);

    // Using dummy data directly
    const wishlistData = DUMMY_DATA.wishlistData;
    const combinedStats = DUMMY_DATA.combinedStats;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Wishlist & User Analytics Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <select 
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-3 py-2 border rounded-lg text-sm"
                        >
                            <option value="all">All Time</option>
                            <option value="day">Last 24 Hours</option>
                            <option value="week">Last Week</option>
                            <option value="month">Last Month</option>
                        </select>
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                            Refresh Now
                        </button>
                    </div>
                </div>

                <CombinedStats combinedStats={combinedStats} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <WishlistDistributionChart wishlistData={wishlistData} />
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <UserActivityChart combinedStats={combinedStats} />
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <TopProductsChart wishlistData={wishlistData} />
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <UserEngagementChart combinedStats={combinedStats} />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <WishlistTable wishlistData={wishlistData} />
                    </div>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <UserActivityTable combinedStats={combinedStats} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function CombinedStats({ combinedStats }) {
    const stats = [
        {
            title: 'Total Products in Wishlist',
            value: combinedStats.totalWishlistProducts.toLocaleString(),
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            title: 'Active Users',
            value: combinedStats.activeUsers.toLocaleString(),
            bgColor: 'bg-green-50',
            textColor: 'text-green-600'
        },
        {
            title: 'Total Wishlist Items',
            value: combinedStats.totalWishlistItems.toLocaleString(),
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600'
        },
        {
            title: 'Conversion Rate',
            value: `${combinedStats.conversionRate.toFixed(1)}%`,
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600'
        },
        {
            title: 'Avg Items per User',
            value: combinedStats.avgItemsPerUser.toFixed(1),
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

function UserActivityChart({ combinedStats }) {
    const data = {
        labels: combinedStats.userActivity.map(item => item.date),
        datasets: [{
            label: 'Active Users',
            data: combinedStats.userActivity.map(item => item.count),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: true,
                text: 'User Activity Over Time',
                font: { size: 16 }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    return <Line data={data} options={options} />;
}

function UserEngagementChart({ combinedStats }) {
    const data = {
        labels: ['High', 'Medium', 'Low'],
        datasets: [{
            data: [
                combinedStats.userEngagement.high,
                combinedStats.userEngagement.medium,
                combinedStats.userEngagement.low
            ],
            backgroundColor: [
                'rgba(16, 185, 129, 0.8)',
                'rgba(251, 191, 36, 0.8)',
                'rgba(239, 68, 68, 0.8)'
            ],
            borderWidth: 1
        }]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
                labels: { font: { size: 12 } }
            },
            title: {
                display: true,
                text: 'User Engagement Distribution',
                font: { size: 16 }
            }
        }
    };

    return <Pie data={data} options={options} />;
}

function WishlistDistributionChart({ wishlistData }) {
    const productCounts = {};
    wishlistData.forEach(item => {
        productCounts[item.productId] = (productCounts[item.productId] || 0) + 1;
    });

    const topProducts = Object.entries(productCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    const data = {
        labels: topProducts.map(([id]) => id.substring(id.length - 6)),  // Show last 6 characters of ID
        datasets: [{
            data: topProducts.map(([, count]) => count),
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
                labels: { font: { size: 12 } }
            },
            title: {
                display: true,
                text: 'Top 5 Products in Wishlists',
                font: { size: 16 }
            }
        }
    };

    return <Pie data={data} options={options} />;
}

function TopProductsChart({ wishlistData }) {
    const productStats = {};
    wishlistData.forEach(item => {
        if (!productStats[item.productId]) {
            productStats[item.productId] = {
                count: 0,
                users: new Set()
            };
        }
        productStats[item.productId].count++;
        productStats[item.productId].users.add(item.userId);
    });

    const topProducts = Object.entries(productStats)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 10);

    const data = {
        labels: topProducts.map(([id]) => id.substring(id.length - 6)),  // Show last 6 characters of ID
        datasets: [{
            label: 'Wishlist Count',
            data: topProducts.map(([, stats]) => stats.count),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            borderRadius: 4
        }]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: true,
                text: 'Top 10 Products by Wishlist Count',
                font: { size: 16 }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    return <Bar data={data} options={options} />;
}

function WishlistTable({ wishlistData }) {
    const [sortConfig, setSortConfig] = useState({ key: 'count', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');

    const processedData = Object.entries(
        wishlistData.reduce((acc, item) => {
            if (!acc[item.productId]) {
                acc[item.productId] = {
                    productId: item.productId,
                    count: 0,
                    users: new Set(),
                    lastUpdated: item.updatedAt
                };
            }
            acc[item.productId].count++;
            acc[item.productId].users.add(item.userId);
            if (new Date(item.updatedAt) > new Date(acc[item.productId].lastUpdated)) {
                acc[item.productId].lastUpdated = item.updatedAt;
            }
            return acc;
        }, {})
    ).map(([, data]) => ({
        ...data,
        userCount: data.users.size
    }));

    const sortedData = [...processedData].sort((a, b) => {
        if (sortConfig.key === 'lastUpdated') {
            return sortConfig.direction === 'asc'
                ? new Date(a.lastUpdated) - new Date(b.lastUpdated)
                : new Date(b.lastUpdated) - new Date(a.lastUpdated);
        }
        return sortConfig.direction === 'asc'
            ? a[sortConfig.key] - b[sortConfig.key]
            : b[sortConfig.key] - a[sortConfig.key];
    });

    const filteredData = sortedData.filter(item =>
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
                    <h2 className="text-lg font-semibold text-gray-800">Wishlist Details</h2>
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
                                onClick={() => handleSort('count')}>
                                Wishlist Count {sortConfig.key === 'count' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('userCount')}>
                                User Count {sortConfig.key === 'userCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('lastUpdated')}>
                                Last Updated {sortConfig.key === 'lastUpdated' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.map((item) => (
                            <tr key={item.productId} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                                    <a href={`/product/${item.productId}`} target="_blank" rel="noopener noreferrer">
                                        {item.productId}
                                    </a>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.count.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.userCount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(item.lastUpdated).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function UserActivityTable({ combinedStats }) {
    const [sortConfig, setSortConfig] = useState({ key: 'activity', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');

    const sortedData = [...combinedStats.userDetails].sort((a, b) => {
        if (sortConfig.key === 'lastActive') {
            return sortConfig.direction === 'asc'
                ? new Date(a.lastActive) - new Date(b.lastActive)
                : new Date(b.lastActive) - new Date(a.lastActive);
        }
        return sortConfig.direction === 'asc'
            ? a[sortConfig.key] - b[sortConfig.key]
            : b[sortConfig.key] - a[sortConfig.key];
    });

    const filteredData = sortedData.filter(item =>
        item.userId.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h2 className="text-lg font-semibold text-gray-800">User Activity Details</h2>
                    <input
                        type="text"
                        placeholder="Search by User ID..."
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
                                onClick={() => handleSort('userId')}>
                                User ID {sortConfig.key === 'userId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('wishlistCount')}>
                                Wishlist Items {sortConfig.key === 'wishlistCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('activity')}>
                                Activity Level {sortConfig.key === 'activity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('lastActive')}>
                                Last Active {sortConfig.key === 'lastActive' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.map((item) => (
                            <tr key={item.userId} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                    {item.userId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.wishlistCount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        item.activity === 'high' ? 'bg-green-100 text-green-800' :
                                        item.activity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {item.activity.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(item.lastActive).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default WishlistAnalytics;