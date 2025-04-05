import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale, // Needed for "category" scale
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement, // Needed for Pie charts
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2'; // Import required chart components
import { baseURL } from '../common/SummaryApi'; // Import the baseURL from your API utilities

export const Client_URL = import.meta.env.VITE_CLIENT_URL;

// Register the components with Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function ProductMetrics() {
    const [metrics, setMetrics] = useState([]);

    useEffect(() => {
        fetch(`${baseURL}/api/survey/all-product-view-metrics`) // Replace with your API endpoint
            .then((response) => response.json())
            .then((data) => setMetrics(data.message || []))
            .catch((error) => console.error('Error fetching metrics:', error));
    }, []);

    return (
        <div className="p-4 space-y-8">
            <SummaryStats metrics={metrics} />
            <hr/>
            <MetricsTable metrics={metrics} />
            <hr/>
            <center>
                <div style={{width:"500px"}}>
                    <ViewsPieChart metrics={metrics} />
                </div>
            </center>
            <hr/>
            <ProductBarChart metrics={metrics} />
        </div>
    );
}

export default ProductMetrics;

// **MetricsTable Component**
function MetricsTable({ metrics }) {
    return (
        <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border px-4 py-2">Product ID</th>
                        <th className="border px-4 py-2">Views</th>
                        <th className="border px-4 py-2">Users</th>
                        <th className="border px-4 py-2">Total Uptime (sec)</th>
                        <th className="border px-4 py-2">Last Updated</th>
                    </tr>
                </thead>
                <tbody style={{fontSize:"12px"}}>
                    {metrics.map((item) => (
                        <tr key={item._id.$oid} className="hover:bg-gray-100">
                            <td className="border px-4 py-2">
                                <a href={`${Client_URL}/product/${item.productId}`}   target="_blank">{item.productId}</a>
                            </td>
                            <td className="border px-4 py-2">{item.views}</td>
                            <td className="border px-4 py-2">{item.users.length}</td>
                            <td className="border px-4 py-2">{(item.upTime / 1000).toFixed(2)}</td>
                            <td className="border px-4 py-2">{new Date(item.updatedAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// **ViewsPieChart Component**
function ViewsPieChart({ metrics }) {
    
    const [collapse , setCollapse] = useState(true);


    const data = {
        labels: metrics.map((item) => item.productId),
        datasets: [
            {
                data: metrics.map((item) => item.views),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    return (
        <div className="chart-container">
            <h2 className="text-xl font-bold mb-4">Views Distribution (Pie Chart)</h2>
            
            {
                collapse ?
                <div>
                    <button onClick={()=>setCollapse(collapse?false:true)}   className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"  >Show Pie Chart</button>
                </div>
                :
                <div>
                    <button onClick={()=>setCollapse(collapse?false:true)}   className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"  >Collapse</button>
                    <Pie data={data} options={options} />
                </div>
            }

        </div>
    );
}

// **ProductBarChart Component**
function ProductBarChart({ metrics }) {

    const [collapse , setCollapse] = useState(true);


    const data = {
        labels: metrics.map((item) => item.productId),
        datasets: [
            {
                label: 'Views',
                data: metrics.map((item) => item.views),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Product Views (Bar Chart)',
            },
        },
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index; // Get the index of the clicked label
                const productId = metrics[index].productId; // Get the associated productId
                const url = `/product/${productId}`;
                window.open(url, '_blank'); // Open the link in a new tab
            }
        },
    };

    return (
        <div className="chart-container">
            <h2 className="text-xl font-bold mb-4">Product Views (Bar Chart)</h2>
         

            {
                collapse ?
                <div>
                    <button onClick={()=>setCollapse(collapse?false:true)}   className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"  >Show Bar Chart</button>
                </div>
                :
                <div>
                    <button onClick={()=>setCollapse(collapse?false:true)}   className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"  >Collapse</button>
                    <Bar data={data} options={options} />
                </div>
            }

        </div>
    );
}

// **SummaryStats Component**
function SummaryStats({ metrics }) {
    if (!metrics || metrics.length === 0) return null; // Handle empty metrics gracefully

    const totalViews = metrics.reduce((sum, item) => sum + item.views, 0);
    const totalProducts = metrics.length;
    const totalViewedTime = metrics.reduce((sum, item) => sum + item.upTime, 0) / 1000;
    const avgViewedTime = totalViewedTime / totalProducts ;

    const userIds = new Set()
    metrics.forEach((obj)=>{
        obj.users.forEach((user)=>{
            userIds.add(user.userId)
        })
    }) 

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="stat-card p-4 bg-blue-100 rounded shadow">
                <h3 className="text-lg font-bold">Total Products visited</h3>
                <p className="text-2xl">{totalProducts}</p>
            </div>
            <div className="stat-card p-4 bg-blue-100 rounded shadow">
                <h3 className="text-lg font-bold">Active cart users</h3>
                <p className="text-2xl">{userIds.size}</p>
            </div>
            <div className="stat-card p-4 bg-green-100 rounded shadow">
                <h3 className="text-lg font-bold">Total Views</h3>
                <p className="text-2xl">{totalViews}</p>
            </div>
            <div className="stat-card p-4 bg-yellow-100 rounded shadow">
                <h3 className="text-lg font-bold">Avg Viewed Time (uptime/no.of pro)</h3>
                <p className="text-2xl">{avgViewedTime.toFixed(2)} seconds</p>
            </div>
            <div className="stat-card p-4 bg-yellow-100 rounded shadow">
                <h3 className="text-lg font-bold">Total Viewed Time (uptime)</h3>
                <p className="text-2xl">{totalViewedTime.toFixed(2)} seconds</p>
            </div>
        </div>
    );
}
