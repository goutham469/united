import React, { useEffect, useState } from 'react';
import { baseURL } from '../App';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

function Sales() {
  const [data, setData] = useState({});
  const [year, setYear] = useState(null);

  async function getData() {
    let response = await fetch(`${baseURL}/api/order/sales`);
    if (response.ok) {
      response = await response.json();
      setData(response.data);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <div style={{
      padding: "40px",
      overflowY: "scroll",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      fontFamily: "'Inter', sans-serif"
    }}>
      <h3 style={{
        fontSize: "28px",
        fontWeight: "600",
        color: "#1e293b",
        marginBottom: "24px"
      }}>
        Sales Analysis {year && <span style={{ color: "#3b82f6" }}>• {year}</span>}
      </h3>
      <div>
        <select 
          onChange={(e) => setYear(e.target.value)}
          style={{
            width: "200px",
            backgroundColor: "#ffffff",
            padding: "10px 16px",
            borderRadius: "8px",
            margin: "5px",
            border: "1px solid #e2e8f0",
            fontSize: "15px",
            color: "#334155",
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
            transition: "all 0.2s ease",
            outline: "none"
          }}
        >
          <option value="">Select Year</option>
          {Object.keys(data)?.map((item, i) => (
            <option key={item} value={item}>
               {item}
            </option>
          ))}
        </select>

        {year ? (
          <YearSales data={data[year]} />
        ) : (
          <div style={{
            margin: "40px 0",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "16px"
          }}>
            Please select a year to view sales data
          </div>
        )}
      </div>
    </div>
  );
}

export default Sales;

function YearSales({ data }) {
  const [month, setMonth] = useState(null);

  const months = {
    1:'January',
    2:'February',
    3:'March',
    4:'April',
    5:'May',
    6:'June',
    7:'July',
    8:'August',
    9:'September',
    10:'October',
    11:'November',
    12:'December'
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "24px"
      }}>
        <select 
          onChange={(e) => setMonth(e.target.value)}
          style={{
            width: "200px",
            backgroundColor: "#ffffff",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            fontSize: "15px",
            color: "#334155",
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
            transition: "all 0.2s ease",
            outline: "none"
          }}
        >
          <option value="">Select Month</option>
          {Object.keys(data)?.map((item, idx) => (
            <option key={item} value={item}>
              {months[item]}
            </option>
          ))}
        </select>
      </div>

      {month ? (
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        }}> 
          <div style={{
            minHeight: "600px",
            display: "flex",
            gap: "40px",
            justifyContent: "space-between"
          }}>
            <TableData data={data[month]} />
            <div style={{ flex: 1 }}>
              <BarChart data={data[month]} />
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "16px",
          marginTop: "20px"
        }}>
          Select a month to view detailed sales data
        </div>
      )}
    </div>
  );
}

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function BarChart({ data }) {
    const [processedData, setProcessedData] = useState({});

    useEffect(() => {
        const preprocessData = (monthData) => {
            const filledData = {};
            for (let day = 1; day <= 31; day++) {
                filledData[day] = monthData[day] || { totalSales: 0, sales: [] };
            }
            return filledData;
        };

        const filledData = preprocessData(data);
        setProcessedData(filledData);
    }, [data]);

    const labels = Object.keys(processedData);
    const totalSales = labels.map((day) => processedData[day].totalSales);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Total Sales',
                data: totalSales,
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgba(59, 130, 246, 0.8)',
                borderWidth: 2,
                borderRadius: 4,
                barThickness: 16,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    },
                    padding: 20
                }
            },
            title: {
                display: true,
                text: 'Daily Sales Distribution',
                font: {
                    family: "'Inter', sans-serif",
                    size: 16,
                    weight: '600'
                },
                padding: { bottom: 30 }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Day of the Month',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 13
                    }
                },
                grid: {
                    display: false
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Total Sales',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 13
                    }
                },
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            }
        }
    };

    return (
        <div style={{ height: "100%", width: "100%" }}>
            <Bar data={chartData} options={options} />
        </div>
    );
}

function TableData({ data }) {
    const [processedData, setProcessedData] = useState({});

    useEffect(() => {
        const preprocessData = (monthData) => {
            const filledData = {};
            for (let day = 1; day <= 31; day++) {
                filledData[day] = monthData[day] || { totalSales: 0, sales: [] };
            }
            return filledData;
        };

        const filledData = preprocessData(data);
        setProcessedData(filledData);
    }, [data]);

    const totalRevenue = Object.keys(processedData).reduce(
        (sum, day) => sum + processedData[day].totalSales,
        0
    );

    return (
        <div style={{ width: "300px" }}>
            <div style={{
                backgroundColor: "#f0fdf4",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "24px",
                border: "1px solid #86efac"
            }}>
                <div style={{ fontSize: "14px", color: "#166534", marginBottom: "4px" }}>Total Revenue</div>
                <div style={{ fontSize: "24px", fontWeight: "600", color: "#166534" }}>${totalRevenue.toLocaleString()}</div>
            </div>
            <div style={{
                maxHeight: "500px",
                overflowY: "auto",
                borderRadius: "8px",
                border: "1px solid #e2e8f0"
            }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr> 
                            <th style={{
                                padding: "12px",
                                backgroundColor: "#f8fafc",
                                borderBottom: "1px solid #e2e8f0",
                                textAlign: "left",
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#475569"
                            }}>Date</th>
                            <th style={{
                                padding: "12px",
                                backgroundColor: "#f8fafc",
                                borderBottom: "1px solid #e2e8f0",
                                textAlign: "right",
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#475569"
                            }}>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(processedData).map((day, idx) => (
                            <tr key={day} style={{
                                backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc"
                            }}> 
                                <td style={{
                                    padding: "12px",
                                    fontSize: "14px",
                                    color: "#64748b"
                                }}>Day {day}</td>
                                <td style={{
                                    padding: "12px",
                                    fontSize: "14px",
                                    color: "#64748b",
                                    textAlign: "right"
                                }}>${processedData[day].totalSales.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

