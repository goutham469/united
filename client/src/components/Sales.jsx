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
    <div style={{padding:"20px",overflowY:"scroll"}}>
      <h3>
        Sales of the year {year && <label>: {year}</label>}
      </h3>
      <div>

        <select 
        onChange={(e) => setYear(e.target.value)}
        style={{width:"150px",backgroundColor:"#dbeafe",padding:"3px",borderRadius:"5px",margin:"5px"}}
        >
          <option value="">Choose a Year</option>
          {Object.keys(data)?.map((item, i) => (
            <option key={item} value={item}>
               {item}
            </option>
          ))}
        </select>


        {year ? (
          <YearSales data={data[year]} />
        ) : (
          <p style={{margin:"20px",color:"red"}}></p>
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
    <div>
 
        <select 
        onChange={(e) => setMonth(e.target.value)}
        style={{width:"150px",backgroundColor:"#dbeafe",padding:"3px",borderRadius:"5px",position:"relative",top:"-30px",right:"-200px"}}
        >
            <option value="">Choose a Month</option>
            {Object.keys(data)?.map((item, idx) => (
            <option key={item} value={item}>
                  {months[item]}
            </option>
            ))}
        </select>
 

      {month ? (
        <div> 
          <div style={{height:"500px",display:"flex",justifyContent:"space-between"}}>
            <TableData data={data[month]} />
            <BarChart data={data[month]} />
          </div>
        </div>
      ) : (
        <b></b>
      )}
    </div>
  );
}





// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function BarChart({ data }) {
    const [processedData, setProcessedData] = useState({});

    useEffect(() => {
        // Preprocess the data to fill missing days
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

    // Extract sales data for the selected month
    const labels = Object.keys(processedData); // Days of the month
    const totalSales = labels.map((day) => processedData[day].totalSales); 

    // Configuration for the chart
    const chartData = {
        labels, // Days of the month
        datasets: [
            {
                label: 'Total Sales',
                data: totalSales,
                backgroundColor: 'rgba(75, 192, 192, 0.6)', // Bar color
                borderColor: 'rgba(75, 192, 192, 1)', // Border color
                borderWidth: 1,
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
                text: 'Sales Data by Day',
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Day of the Month',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Total Sales',
                },
                beginAtZero: true,
            },
        },
    };

    return <Bar data={chartData} options={options} />;
}


function TableData({ data }) {
    const [processedData, setProcessedData] = useState({});

    useEffect(() => {
        // Preprocess the data to fill missing days
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
        <div>
            <b style={{width:"150px",backgroundColor:"#d9ead3",padding:"5px",borderRadius:"5px",position:"relative",top:"-55px",left:"400px",borderRadius:"5px"}}>Total Revenue: {totalRevenue}</b>
            <table style={{border:"1px solid black",borderCollapse:"collapse"}}>
                <thead>
                    <tr> 
                        <th style={{border:"1px solid black",margin:"5px"}}>Date</th>
                        <th style={{border:"1px solid black",margin:"5px"}}>Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(processedData).map((day, idx) => (
                        <tr key={day}  > 
                            <td style={{border:"1px solid black",fontSize:"12px"}}>{day}</td>
                            <td style={{border:"1px solid black",fontSize:"12px"}}>{processedData[day].totalSales}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

