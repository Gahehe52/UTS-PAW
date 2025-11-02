import { useState, useEffect, useMemo } from 'react'
import CryptoTable from '../components/CryptoTable'
import PriceFilter from '../components/PriceFilter'
import PortfolioCalculator from '../components/PortfolioCalculator'
import LoadingSpinner from '../components/LoadingSpinner'

async function fetchCoinData() {
  const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false');
  if (!response.ok) {
    throw new Error('Failed to fetch data from CoinGecko');
  }
  const data = await response.json();
  return data;
}

function Home() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCoinData();
      setCoins(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCoins = useMemo(() => {
    return coins.filter(coin => {
      const { current_price, name } = coin;
      const searchLower = filters.search.toLowerCase();
      
      const nameMatch = name.toLowerCase().includes(searchLower);
      
      const minPriceMatch = filters.minPrice === '' || current_price >= parseFloat(filters.minPrice);
      const maxPriceMatch = filters.maxPrice === '' || current_price <= parseFloat(filters.maxPrice);

      return nameMatch && minPriceMatch && maxPriceMatch;
    });
  }, [coins, filters]);

  const handleRefresh = () => {
    loadData();
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }
    if (error) {
      return <p className="text-red-500 text-center">Error: {error}</p>;
    }
    return (
      <CryptoTable 
        coins={filteredCoins} 
        handleRefresh={handleRefresh}
        isLoading={loading}
      />
    );
  };

  return (
    <div className="space-y-8">
      <PriceFilter setFilters={setFilters} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {renderContent()}
        </div>
        <div>
          <PortfolioCalculator coins={coins} />
        </div>
      </div>
    </div>
  )
}

export default Home