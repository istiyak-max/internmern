import { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [totalSales, setTotalSales] = useState(0);
  const [totalSoldItems, setTotalSoldItems] = useState(0);
  const [totalNotSoldItems, setTotalNotSoldItems] = useState(0);

  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  async function getdata() {
    const response = await fetch('http://localhost:3001/api/getdata');
    const jsonData = await response.json();
    setData(jsonData);
    setFilteredData(jsonData);
    calculateStatistics(jsonData);
    updateChartData(jsonData);
  }

  useEffect(function () {
    getdata();
  }, []);

  function handleSearchChange(event) {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    filterData(value, selectedMonth);
  }

  function handleMonthChange(event) {
    const month = event.target.value;
    setSelectedMonth(month);
    filterData(searchTerm, month);
  }

  function filterData(searchTerm, month) {
    const filtered = data.filter(transaction => {
      const matchesSearch = transaction.title.toLowerCase().includes(searchTerm) || 
                            transaction.description.toLowerCase().includes(searchTerm);
      const matchesMonth = month === "" || 
                           new Date(transaction.dateOfSale).toLocaleString('default', { month: 'long' }) === month;

      return matchesSearch && matchesMonth;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
    calculateStatistics(filtered);
    updateChartData(filtered);
  }

  function calculateStatistics(transactions) {
    const soldItems = transactions.filter(item => item.sold);
    const totalSalesAmount = soldItems.reduce((sum, item) => sum + item.price, 0);
    
    setTotalSales(totalSalesAmount);
    setTotalSoldItems(soldItems.length);
    setTotalNotSoldItems(transactions.length - soldItems.length);
  }

  function updateChartData(transactions) {
    const priceRanges = {
      '0-100': 0,
      '101-200': 0,
      '201-300': 0,
      '301-400': 0,
      '401-500': 0,
      '501-600': 0,
      '601-700': 0,
      '701-800': 0,
      '801-900': 0,
      '901+': 0,
    };

    transactions.forEach(transaction => {
      const price = transaction.price;
      if (price <= 100) priceRanges['0-100']++;
      else if (price <= 200) priceRanges['101-200']++;
      else if (price <= 300) priceRanges['201-300']++;
      else if (price <= 400) priceRanges['301-400']++;
      else if (price <= 500) priceRanges['401-500']++;
      else if (price <= 600) priceRanges['501-600']++;
      else if (price <= 700) priceRanges['601-700']++;
      else if (price <= 800) priceRanges['701-800']++;
      else if (price <= 900) priceRanges['801-900']++;
      else priceRanges['901+']++;
    });

    setChartData({
      labels: Object.keys(priceRanges),
      datasets: [
        {
          label: 'Number of Items',
          data: Object.values(priceRanges),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    });
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="container mt-4">
      <div className="row mb-3">
        <div className="col-6">
          <input 
            type='text' 
            className="form-control" 
            placeholder="Search transaction" 
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="col-6">
          <select className="form-select" value={selectedMonth} onChange={handleMonthChange}>
            <option value="">Select Month</option>
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Total Sales</h5>
              <p className="card-text">${totalSales.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Total Sold Items</h5>
              <p className="card-text">{totalSoldItems}</p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Total Not Sold Items</h5>
              <p className="card-text">{totalNotSoldItems}</p>
            </div>
          </div>
        </div>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Category</th>
            <th>Sold</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {currentItems && currentItems.length > 0 ? (
            currentItems.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.id}</td>
                <td>{transaction.title}</td>
                <td>{transaction.description}</td>
                <td>${transaction.price}</td>
                <td>{transaction.category}</td>
                <td>{transaction.sold ? 'Yes' : 'No'}</td>
                <td>
                  {transaction.image ? (
                    <img
                      src={transaction.image}
                      alt={transaction.title}
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                  ) : (
                    'No Image'
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
      <nav>
        <ul className="pagination justify-content-center">
          <li className="page-item">
            <button 
              className="page-link" 
              onClick={() => setCurrentPage(1)} 
              disabled={currentPage === 1}
            >
              First
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, index) => (
            <li 
              key={index} 
              className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
            >
              <button 
                className="page-link" 
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            </li>
          ))}
          <li className="page-item">
            <button 
              className="page-link" 
              onClick={() => setCurrentPage(totalPages)} 
              disabled={currentPage === totalPages}
            >
              Last
            </button>
          </li>
        </ul>
      </nav>

      <div className="row mb-3">
        <div className="col">
          <h3>Transactions Bar Chart</h3>
          <Bar data={chartData} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
}
