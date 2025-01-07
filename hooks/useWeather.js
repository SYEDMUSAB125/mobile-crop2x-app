import { useState, useEffect } from "react";

const useWeather = (url) => {
  const [ weatherData, setData] = useState(null);
  const [weatherError, setError] = useState(null);
  const [weatherLoading, setLoading] = useState(false);

  useEffect(() => {
    if (!url) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { weatherData, weatherError, weatherLoading };
};

export default useWeather;
