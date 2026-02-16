'use client'
import React, { useEffect, useState } from 'react';
import './style.css';
import images from '@/assets/images';
import { Line } from 'react-chartjs-2';
const Stats = [
  {
    heading: '182',
    subHeading: 'Total members',
    logo: images.dashboard.userIcon,
    subStatsHeading: '',
    subStatsSubHeading: '',
    subStatsLogo: '',
  },
  {
    heading: '182',
    subHeading: 'Total brands',
    logo: images.dashboard.dollarIcon,
    subStatsHeading: '',
    subStatsSubHeading: '',
    subStatsLogo: '',
  },
  {
    heading: '156',
    subHeading: 'Total redeemed offers',
    logo: images.dashboard.giftIcon,
    subStatsHeading: '4.3%',
    subStatsSubHeading: 'Down from yesterday',
    subStatsLogo: images.dashboard.trendingDownIcon,
  },
  {
    heading: '192',
    subHeading: 'Total rewards claimed',
    logo: images.dashboard.shoppingBagIcon,
    subStatsHeading: '8.3%',
    subStatsSubHeading: 'Up from yesterday',
    subStatsLogo: images.dashboard.trendingUpIcon,
  },
];
const tableData = [
  { brand: 'McDonald\'s', category: 'Food', offers: 28, redemptions: 234, rewards: 178 },
  { brand: 'McDonald\'s', category: 'Food', offers: 28, redemptions: 234, rewards: 178 },
  { brand: 'McDonald\'s', category: 'Food', offers: 28, redemptions: 234, rewards: 178 },
];
const Dashboard2 = () => {
      // Data for Retention Rate Chart
  const retentionRateData = {
    labels: ['Jan', 'Feb', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Retention Rate',
        data: [20, 40, 60, 30, 50, 80],
        fill: true,
        backgroundColor: 'rgba(255, 56, 81, 0.3)', 
        borderColor: '#ff3951', 
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  // Data for Churn Rate Chart
  const churnRateData = {
    labels: ['Jan', 'Feb', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Churn Rate',
        data: [10, 60, 30, 70, 50, 80],
        fill: false,
        borderColor: '#ff3951', 
        borderWidth: 2,
        pointBackgroundColor: '#ff3951', 
        tension:0,
      },
    ],
  };

  // Chart Options
  const chartOptions = {
    plugins: {
      legend: { display: false },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
              borderDash: [4, 4], 
            },
            ticks: {
              color: "#555",
            },
          },
          y: {
            grid: {
              color: "rgba(0, 0, 0, 0.1)", 
              borderDash: [4, 4], 
            },
        }
    },
  };
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URI}/api/dashboard/statistics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch dashboard statistics");
        const data = await res.json();
        setStats(data.data || data); // handle ApiResponse wrapper
      } catch (err: any) {
        setError(err.message || "Error fetching dashboard statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  return (
    <div className="dashboard-container">
      <div className="dashboard-heading">
        <span>Dashboard</span>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : stats ? (
        <div className="dashbord-stats-boxes">
          <div className="dashbord-stats-box">
            <div className="dashboard-stats-row1">
              <div className="stats-box-left">
                <span>{stats.totalUsers}</span>
                <p>Total members</p>
              </div>
              <div className="stats-box-right">
                <img src={images.dashboard.userIcon} alt="stat-logo" />
              </div>
            </div>
          </div>
          <div className="dashbord-stats-box dashbord-stats-box-even">
            <div className="dashboard-stats-row1">
              <div className="stats-box-left">
                <span>{stats.totalBrands}</span>
                <p>Total brands</p>
              </div>
              <div className="stats-box-right stats-box-right-even">
                <img src={images.dashboard.dollarIcon} alt="stat-logo" />
              </div>
            </div>
          </div>
          <div className="dashbord-stats-box">
            <div className="dashboard-stats-row1">
              <div className="stats-box-left">
                <span>{stats.totalRedeemedOffers}</span>
                <p>Total redeemed offers</p>
              </div>
              <div className="stats-box-right">
                <img src={images.dashboard.giftIcon} alt="stat-logo" />
              </div>
            </div>
          </div>
          <div className="dashbord-stats-box dashbord-stats-box-even">
            <div className="dashboard-stats-row1">
              <div className="stats-box-left">
                <span>{stats.totalRewardsClaimed}</span>
                <p>Total rewards claimed</p>
              </div>
              <div className="stats-box-right stats-box-right-even">
                <img src={images.dashboard.shoppingBagIcon} alt="stat-logo" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className="dashboard-charts">
      <div className="dashboard-charts-top">
          {/* Left Chart */}
          <div className="dashboard-chart-left">
            <Line data={retentionRateData} options={chartOptions} />
          </div>

          {/* Right Chart */}
          <div className="dashboard-chart-right">
            <Line data={churnRateData} options={chartOptions} />
          </div>
        </div>
        <div className="offer-popularity">
      <div className="offer-popularity-heading">
        <span>Offer popularity according to Brand</span>
      </div>
      <div className="offer-popularity-table-wrapper">
        <table className="offer-popularity-table">
          <thead>
            <tr>
              <th>Brand</th>
              <th>Category</th>
              <th>Offers available</th>
              <th>Redemptions</th>
              <th>Rewards claimed</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((data, index) => (
              <tr key={index}>
                <td>{data.brand}</td>
                <td>{data.category}</td>
                <td>{data.offers}</td>
                <td>{data.redemptions}</td>
                <td>{data.rewards}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
      </div>
    </div>
  );
};

export default Dashboard2;
