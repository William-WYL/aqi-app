import useAirQualityStore from '../../store/airQualityStore';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ForecastContainer = () => {
  const { forecast } = useAirQualityStore();

  const processForecastData = () => {
    if (!forecast?.pm25 || forecast.pm25.length === 0) {
      return {
        labels: [],
        data: [],
        min: 0,
        max: 0,
      };
    }

    const pm25Data = forecast.pm25.slice(0, 7);
    const labels = pm25Data.map(item => {
      const date = new Date(item.day);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });
    const data = pm25Data.map(item => item.avg);

    return {
      labels,
      data,
      min: Math.min(...data),
      max: Math.max(...data),
    };
  };

  const { labels, data, min, max } = processForecastData();



  // Function to determine color based on PM2.5 value
  const getColorForValue = (value) => {
    if (value <= 50) return '#10B981';    // Green - Good
    if (value <= 100) return '#F59E0B';  // Yellow - Moderate
    if (value <= 150) return '#F97316';  // Orange - Unhealthy for Sensitive Groups
    if (value <= 200) return '#EF4444'; // Red - Unhealthy
    return '#7C3AED';                     // Purple - Very Unhealthy
  };

  // Generate array of background colors with 50% opacity (80 in hex)
  const backgroundColors = data.map(value => `${getColorForValue(value)}80`);

  // Chart data configuration
  const chartData = {
    labels,  // X-axis labels (days of week)
    datasets: [
      {
        label: 'PM2.5 (μg/m³)',  // Legend label
        data,                     // PM2.5 values
        borderColor: '#3b82f6',   // Default line color (blue)
        backgroundColor: backgroundColors,  // Fill colors under line
        borderWidth: 2,           // Line thickness
        tension: 0.3,             // Curve smoothness (0-1)
        fill: true,               // Enable area fill
        segment: {
          // Dynamic line segment coloring based on PM2.5 value
          borderColor: ctx => getColorForValue(ctx.p1.parsed.y)
        }
      }
    ]
  };

  // Chart options configuration
  const chartOptions = {
    responsive: true,            // Enable responsive sizing
    maintainAspectRatio: false, // Disable fixed aspect ratio
    plugins: {
      legend: {
        position: 'top',         // Position legend at top
      },
      tooltip: {
        callbacks: {
          // Custom tooltip label format
          label: (context) => `${context.dataset.label}: ${context.raw} μg/m³`,
        },
      },
    },
    scales: {
      y: {
        min: Math.max(0, min - 5),  // Add padding to y-axis minimum
        max: max + 5,               // Add padding to y-axis maximum
        ticks: {
          // Append units to y-axis labels
          callback: value => `${value} μg/m³`
        }
      }
    }
  };


  const getPM25Level = (value) => {
    if (value <= 50) return 'Good';
    if (value <= 100) return 'Moderate';
    if (value <= 150) return 'Unhealthy for Sensitive Groups';
    if (value <= 200) return 'Unhealthy';
    if (value <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  return (
    <div className="bg-white rounded-lg p-6">
      {forecast?.pm25?.length > 0 ? (
        <div className="flex flex-col md:flex-row gap-6">

          <div className="w-full my-auto md:w-1/2 h-64">
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className="w-full md:w-1/2">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PM2.5</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {forecast.pm25.slice(0, 7).map((day, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(day.day).toLocaleDateString('en-US', { weekday: 'short' })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {day.avg.toFixed(1)} μg/m³
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPM25Level(day.avg) === 'Good' ? 'bg-green-100 text-green-800' :
                          getPM25Level(day.avg) === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                            getPM25Level(day.avg) === 'Unhealthy for Sensitive Groups' ? 'bg-orange-100 text-orange-800' :
                              getPM25Level(day.avg) === 'Unhealthy' ? 'bg-red-100 text-red-800' :
                                getPM25Level(day.avg) === 'Very Unhealthy' ? 'bg-purple-100 text-purple-800' :
                                  'bg-red-800 text-white'
                          }`}>
                          {getPM25Level(day.avg)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No forecast data available. Search for a city to see PM2.5 predictions.
        </div>
      )}
    </div>
  );
};

export default ForecastContainer;