"use client"
import React, { useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Enhanced type definitions
interface DataPoint {
  [key: string]: string | number;
}

// interface TopOffer {
//   businessName: string;
//   category: string;
//   subCategory1: string;
//   subCategory2: string;
//   offerType: string;
//   offerAmount: string;
//   redemptionRate: string;
//   topRedeemingTribe: string;
// }

interface ChartProps {
  data: DataPoint[];
  xKey: string;
  yKey: string;
  title?: string;
}

interface PieChartProps {
  data: { label: string; value: number }[];
  title?: string;
}

// Chart data creation utility
const createChartData = (data: DataPoint[], xKey: string, yKey: string) => ({
  labels: data.map(d => String(d[xKey])),
  datasets: [
    {
      label: yKey,
      data: data.map(d => Number(d[yKey])),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      tension: 0.3, // Smooth line
    }
  ]
});

// Line Chart component
export const LineChart: React.FC<ChartProps> = ({ data, xKey, yKey, title }) => {
  const chartData = createChartData(data, xKey, yKey);
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: !!title,
        text: title
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: xKey
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: yKey
        }
      }
    }
  };
  return <Line data={chartData} options={options} />;
};

// Bar Chart component
export const BarChart: React.FC<ChartProps> = ({ data, xKey, yKey, title }) => {
  const chartData = createChartData(data, xKey, yKey);
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: !!title,
        text: title
      }
    }
  };
  return <Bar data={chartData} options={options} />;
};

// Pie Chart component
export const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        data: data.map(d => d.value),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const, // Ensure this is one of the allowed values ('top', 'left', etc.)
      },
      title: {
        display: !!title,
        text: title
      }
    }
  };

  return <Pie data={chartData} options={options} />;
};

// Dashboard component
export const Dashboard = () => {
  // State for active tab
  const [activeRetentionTab, setActiveRetentionTab] = useState('weekly');

  // Sample data
  const memberData = {
    daily: [
      { date: '2024-01-01', members: 100, newMembers: 10, retentionRate: 0.95 },
      { date: '2024-01-02', members: 110, newMembers: 15, retentionRate: 0.96 },
      { date: '2024-01-03', members: 125, newMembers: 20, retentionRate: 0.97 },
    ],
    weekly: [
      { week: '2024-W01', retentionRate: 0.92 },
      { week: '2024-W02', retentionRate: 0.93 },
      { week: '2024-W03', retentionRate: 0.94 },
    ],
    monthly: [
      { month: '2024-01', retentionRate: 0.90 },
      { month: '2024-02', retentionRate: 0.91 },
      { month: '2024-03', retentionRate: 0.92 },
    ],
  };

  const businessData = [
    { date: '2024-01-01', businesses: 50, newBusinesses: 5, revenue: 1000, retentionRate: 0.85 },
    { date: '2024-01-02', businesses: 55, newBusinesses: 3, revenue: 1500, retentionRate: 0.88 },
    { date: '2024-01-03', businesses: 58, newBusinesses: 4, revenue: 1800, retentionRate: 0.90 },
  ];

  const offerData = [
    { date: '2024-01-01', totalOffersSent: 100, redeemedOffers: 60, redemptionRate: 0.6 },
    { date: '2024-01-02', totalOffersSent: 120, redeemedOffers: 72, redemptionRate: 0.6 },
    { date: '2024-01-03', totalOffersSent: 150, redeemedOffers: 90, redemptionRate: 0.6 },
  ];

  // const topOffers: TopOffer[] = [
  //   { 
  //     businessName: "Business A", 
  //     category: "Food", 
  //     subCategory1: "Fast Food", 
  //     subCategory2: "Burgers", 
  //     offerType: "Discount", 
  //     offerAmount: "$5 off", 
  //     redemptionRate: "15%", 
  //     topRedeemingTribe: "Students" 
  //   },
  //   { 
  //     businessName: "Business B", 
  //     category: "Retail", 
  //     subCategory1: "Clothing", 
  //     subCategory2: "T-shirts", 
  //     offerType: "BOGO", 
  //     offerAmount: "Buy 1 Get 1 Free", 
  //     redemptionRate: "20%", 
  //     topRedeemingTribe: "Young Professionals" 
  //   }
  //   // More top offers...
  // ];

  // Utility function to get latest value from data
  const getLatestValue = (data: DataPoint[], key: string): string | number => {
    return data && data.length > 0 
      ? data[data.length - 1][key] 
      : 'N/A';
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800">Tribe Me Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Member Growth Graph */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Member Insights</h2>
          <LineChart 
            data={memberData.daily} 
            xKey="date" 
            yKey="members" 
            title="Member Growth"
          />
          <p className="mt-2 text-sm text-gray-600">
            New members today: {getLatestValue(memberData.daily, 'newMembers')}
          </p>
        </div>

        {/* Member Retention Graph */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Member Retention</h2>
          <div className="mb-4">
            {['daily', 'weekly', 'monthly'].map(period => (
              <button 
                key={period}
                className={`mr-2 px-3 py-1 rounded ${activeRetentionTab === period ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setActiveRetentionTab(period)}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          
          {activeRetentionTab === 'daily' && (
            <LineChart 
              data={memberData.daily} 
              xKey="date" 
              yKey="retentionRate" 
            />
          )}
          {activeRetentionTab === 'weekly' && (
            <LineChart 
              data={memberData.weekly} 
              xKey="week" 
              yKey="retentionRate" 
            />
          )}
          {activeRetentionTab === 'monthly' && (
            <LineChart 
              data={memberData.monthly} 
              xKey="month" 
              yKey="retentionRate" 
            />
          )}
        </div>

        {/* Business Growth Graph */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Business Growth</h2>
          <LineChart 
            data={businessData} 
            xKey="date" 
            yKey="businesses" 
            title="Business Growth"
          />
          <p className="mt-2 text-sm text-gray-600">
            New businesses today: {getLatestValue(businessData, 'newBusinesses')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Tribe Me Revenue Graph */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Total Tribe Me Revenue</h2>
          <LineChart 
            data={businessData} 
            xKey="date" 
            yKey="revenue" 
            title="Total Revenue"
          />
        </div>

        {/* Business Retention Rate Graph */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Business Retention Rate</h2>
          <LineChart 
            data={businessData} 
            xKey="date" 
            yKey="retentionRate" 
            title="Business Retention Rate"
          />
        </div>

        {/* Offer Redemption Rate Graph */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Offer Redemption Rate</h2>
          <LineChart 
            data={offerData} 
            xKey="date" 
            yKey="redemptionRate" 
            title="Offer Redemption Rate"
          />
        </div>

        {/* Total Redeemed Offers Graph */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Total Redeemed Offers</h2>
          <LineChart 
            data={offerData} 
            xKey="date" 
            yKey="redeemedOffers" 
            title="Total Redeemed Offers"
          />
        </div>

        {/* Average Member Rewards Amount Claimed Graph */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Average Member Rewards Claimed</h2>
          <BarChart 
            data={memberData.daily} 
            xKey="date" 
            yKey="retentionRate" 
            title="Average Member Rewards Claimed"
          />
        </div>

        {/* Average # Likes Per Member Graph */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Average # Likes Per Member</h2>
          <BarChart 
            data={memberData.daily} 
            xKey="date" 
            yKey="members" 
            title="Average Likes Per Member"
          />
        </div>

        {/* Total # Offers Shared Graph */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Total # Offers Shared</h2>
          <LineChart 
            data={offerData} 
            xKey="date" 
            yKey="totalOffersSent" 
            title="Total # Offers Shared"
          />
        </div>

        {/* Total # of 1st Degree Referrals Joined Graph */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Total # of 1st Degree Referrals Joined</h2>
          <LineChart 
            data={memberData.daily} 
            xKey="date" 
            yKey="newMembers" 
            title="1st Degree Referrals Joined"
          />
        </div>

        {/* Total # of 2nd Degree Referrals Joined Graph */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Total # of 2nd Degree Referrals Joined</h2>
          <LineChart 
            data={memberData.daily} 
            xKey="date" 
            yKey="newMembers" 
            title="2nd Degree Referrals Joined"
          />
        </div>
      </div>
    </div>
  );
};

// "use client"
// import React, { useState } from 'react';
// import { 
//   Chart as ChartJS, 
//   CategoryScale, 
//   LinearScale, 
//   PointElement, 
//   LineElement, 
//   BarElement, 
//   ArcElement, 
//   Title, 
//   Tooltip, 
//   Legend 
// } from 'chart.js';
// import { Line, Bar, Pie } from 'react-chartjs-2';

// // Register Chart.js components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend
// );

// // Enhanced type definitions
// interface DataPoint {
//   [key: string]: string | number;
// }

// interface TopOffer {
//   businessName: string;
//   category: string;
//   subCategory1: string;
//   subCategory2: string;
//   offerType: string;
//   offerAmount: string;
//   redemptionRate: string;
//   topRedeemingTribe: string;
// }

// interface ChartProps {
//   data: DataPoint[];
//   xKey: string;
//   yKey: string;
//   title?: string;
// }

// interface PieChartProps {
//   data: { label: string; value: number }[];
//   title?: string;
// }

// // Chart data creation utility
// const createChartData = (data: DataPoint[], xKey: string, yKey: string) => ({
//   labels: data.map(d => String(d[xKey])),
//   datasets: [
//     {
//       label: yKey,
//       data: data.map(d => Number(d[yKey])),
//       borderColor: 'rgb(75, 192, 192)',
//       backgroundColor: 'rgba(75, 192, 192, 0.6)',
//       tension: 0.3, // Smooth line
//     }
//   ]
// });

// // Line Chart component
// export const LineChart: React.FC<ChartProps> = ({ data, xKey, yKey, title }) => {
//   const chartData = createChartData(data, xKey, yKey);
//   const options = {
//     responsive: true,
//     plugins: {
//       title: {
//         display: !!title,
//         text: title
//       }
//     },
//     scales: {
//       x: {
//         title: {
//           display: true,
//           text: xKey
//         }
//       },
//       y: {
//         beginAtZero: true,
//         title: {
//           display: true,
//           text: yKey
//         }
//       }
//     }
//   };
//   return <Line data={chartData} options={options} />;
// };

// // Bar Chart component
// export const BarChart: React.FC<ChartProps> = ({ data, xKey, yKey, title }) => {
//   const chartData = createChartData(data, xKey, yKey);
//   const options = {
//     responsive: true,
//     plugins: {
//       title: {
//         display: !!title,
//         text: title
//       }
//     }
//   };
//   return <Bar data={chartData} options={options} />;
// };

// // Pie Chart component
// export const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
//   const chartData = {
//     labels: data.map(d => d.label),
//     datasets: [
//       {
//         data: data.map(d => d.value),
//         backgroundColor: [
//           'rgba(255, 99, 132, 0.6)',
//           'rgba(54, 162, 235, 0.6)',
//           'rgba(255, 206, 86, 0.6)',
//           'rgba(75, 192, 192, 0.6)',
//           'rgba(153, 102, 255, 0.6)',
//         ],
//       }
//     ]
//   };

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top' as const, // Ensure this is one of the allowed values ('top', 'left', etc.)
//       },
//       title: {
//         display: !!title,
//         text: title
//       }
//     }
//   };

//   return <Pie data={chartData} options={options} />;
// };

// // Dashboard component
// export const Dashboard = () => {
//   // State for active tab
//   const [activeRetentionTab, setActiveRetentionTab] = useState('weekly');

//   // Sample data
//   const memberData = {
//     daily: [
//       { date: '2024-01-01', members: 100, newMembers: 10, retentionRate: 0.95 },
//       { date: '2024-01-02', members: 110, newMembers: 15, retentionRate: 0.96 },
//       { date: '2024-01-03', members: 125, newMembers: 20, retentionRate: 0.97 },
//     ],
//     weekly: [
//       { week: '2024-W01', retentionRate: 0.92 },
//       { week: '2024-W02', retentionRate: 0.93 },
//       { week: '2024-W03', retentionRate: 0.94 },
//     ],
//     monthly: [
//       { month: '2024-01', retentionRate: 0.90 },
//       { month: '2024-02', retentionRate: 0.91 },
//       { month: '2024-03', retentionRate: 0.92 },
//     ],
//   };

//   const businessData = [
//     { date: '2024-01-01', businesses: 50, newBusinesses: 5 },
//     { date: '2024-01-02', businesses: 55, newBusinesses: 3 },
//     { date: '2024-01-03', businesses: 58, newBusinesses: 4 },
//   ];

//   const topOffers: TopOffer[] = [
//     { 
//       businessName: "Business A", 
//       category: "Food", 
//       subCategory1: "Fast Food", 
//       subCategory2: "Burgers", 
//       offerType: "Discount", 
//       offerAmount: "$5 off", 
//       redemptionRate: "15%", 
//       topRedeemingTribe: "Students" 
//     },
//     { 
//       businessName: "Business B", 
//       category: "Retail", 
//       subCategory1: "Clothing", 
//       subCategory2: "T-shirts", 
//       offerType: "BOGO", 
//       offerAmount: "Buy 1 Get 1 Free", 
//       redemptionRate: "20%", 
//       topRedeemingTribe: "Young Professionals" 
//     }
//     // More top offers...
//   ];

//   // Utility function to get latest value from data
//   const getLatestValue = (data: DataPoint[], key: string): string | number => {
//     return data && data.length > 0 
//       ? data[data.length - 1][key] 
//       : 'N/A';
//   };

//   return (
//     <div className="p-8 space-y-8 max-w-7xl mx-auto">
//       <h1 className="text-3xl font-bold text-gray-800">Tribe Me Dashboard</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {/* Member Growth Graph */}
//         <div className="bg-white shadow rounded-lg p-4">
//           <h2 className="text-xl font-semibold mb-4">Member Insights</h2>
//           <LineChart 
//             data={memberData.daily} 
//             xKey="date" 
//             yKey="members" 
//             title="Member Growth"
//           />
//           <p className="mt-2 text-sm text-gray-600">
//             New members today: {getLatestValue(memberData.daily, 'newMembers')}
//           </p>
//         </div>

//         {/* Member Retention Graph */}
//         <div className="bg-white shadow rounded-lg p-4">
//           <h2 className="text-xl font-semibold mb-4">Member Retention</h2>
//           <div className="mb-4">
//             {['daily', 'weekly', 'monthly'].map(period => (
//               <button 
//                 key={period}
//                 className={`mr-2 px-3 py-1 rounded ${activeRetentionTab === period ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
//                 onClick={() => setActiveRetentionTab(period)}
//               >
//                 {period.charAt(0).toUpperCase() + period.slice(1)}
//               </button>
//             ))}
//           </div>
          
//           {activeRetentionTab === 'daily' && (
//             <LineChart 
//               data={memberData.daily} 
//               xKey="date" 
//               yKey="retentionRate" 
//             />
//           )}
//           {activeRetentionTab === 'weekly' && (
//             <LineChart 
//               data={memberData.weekly} 
//               xKey="week" 
//               yKey="retentionRate" 
//             />
//           )}
//           {activeRetentionTab === 'monthly' && (
//             <LineChart 
//               data={memberData.monthly} 
//               xKey="month" 
//               yKey="retentionRate" 
//             />
//           )}
//         </div>

//         {/* Business Growth Graph */}
//         <div className="bg-white shadow rounded-lg p-4">
//           <h2 className="text-xl font-semibold mb-4">Business Growth</h2>
//           <LineChart 
//             data={businessData} 
//             xKey="date" 
//             yKey="businesses" 
//             title="Business Growth"
//           />
//           <p className="mt-2 text-sm text-gray-600">
//             New businesses today: {getLatestValue(businessData, 'newBusinesses')}
//           </p>
//         </div>
//       </div>

//       {/* Top Offers Table */}
//       <div className="bg-white shadow rounded-lg p-6">
//         <h2 className="text-2xl font-bold mb-4">Top Offers</h2>
//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="p-3 text-left">Business</th>
//                 <th className="p-3 text-left">Category</th>
//                 <th className="p-3 text-left">Offer Type</th>
//                 <th className="p-3 text-left">Redemption Rate</th>
//                 <th className="p-3 text-left">Top Tribe</th>
//               </tr>
//             </thead>
//             <tbody>
//               {topOffers.map((offer, index) => (
//                 <tr key={index}>
//                   <td className="p-3">{offer.businessName}</td>
//                   <td className="p-3">{offer.category}</td>
//                   <td className="p-3">{offer.offerType}</td>
//                   <td className="p-3">{offer.redemptionRate}</td>
//                   <td className="p-3">{offer.topRedeemingTribe}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Average Offers Sent Per Week Graph */}
//       <div className="bg-white shadow rounded-lg p-4">
//         <h2 className="text-xl font-semibold mb-4">Average Offers Sent Per Week</h2>
//         <BarChart 
//           data={memberData.weekly} 
//           xKey="week" 
//           yKey="retentionRate" 
//           title="Average Offers Sent Per Week"
//         />
//       </div>
//     </div>
//   );
// };


