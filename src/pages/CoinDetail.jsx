import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import LoadingSpinner from '../components/LoadingSpinner'

async function fetchCoinDetail(id) {
  const [detailRes, chartRes] = await Promise.all([
    fetch(`https://api.coingecko.com/api/v3/coins/${id}`),
    fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7`)
  ]);

  if (!detailRes.ok || !chartRes.ok) {
    throw new Error('Gagal mengambil data detail koin');
  }

  const detail = await detailRes.json();
  const chart = await chartRes.json();
  return { detail, chart };
}

const formatChartData = (chartData) => {
  return chartData.prices.map(priceEntry => ({
    timestamp: new Date(priceEntry[0]).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    price: priceEntry[1],
  }));
};

function CoinDetail() {
  const { id } = useParams(); 
  const [coin, setCoin] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const { detail, chart } = await fetchCoinDetail(id);
        setCoin(detail);
        setChartData(formatChartData(chart.prices));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;
  if (!coin) return <p>Data koin tidak ditemukan.</p>;

  const descriptionHtml = { __html: coin.description.en.split('. ')[0] + '.' };
  const price = coin.market_data.current_price.usd;
  const change = coin.market_data.price_change_percentage_24h;
  const changeColor = change > 0 ? 'text-green-500' : 'text-red-500';

  return (
    <section className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
      <header className="flex items-center space-x-4">
        <img src={coin.image.large} alt={coin.name} className="w-16 h-16" />
        <div>
          <h1 className="text-4xl font-bold text-white">{coin.name} ({coin.symbol.toUpperCase()})</h1>
          <a 
            href={coin.links.homepage[0]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            {coin.links.homepage[0]}
          </a>
        </div>
      </header>

      <div className="flex items-baseline space-x-4">
        <span className="text-5xl font-bold text-crypto-yellow">${price.toLocaleString()}</span>
        <span className={`text-2xl font-semibold ${changeColor}`}>
          {change.toFixed(2)}% (24j)
        </span>
      </div>

      <div className="h-96 w-full">
        <h3 className="text-xl font-semibold text-white mb-4">Grafik Harga (7 Hari)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="timestamp" stroke="#CBD5E0" />
            <YAxis 
              stroke="#CBD5E0" 
              domain={['dataMin', 'dataMax']}
              tickFormatter={(val) => `$${val.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#2D3748', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#FCD34D' }}
              formatter={(value) => [value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), 'Harga']}
            />
            <Line type="monotone" dataKey="price" stroke="#FCD34D" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Tentang {coin.name}</h3>
        <p 
          className="text-gray-300 leading-relaxed" 
          dangerouslySetInnerHTML={descriptionHtml}
        />
      </div>
    </section>
  )
}

export default CoinDetail