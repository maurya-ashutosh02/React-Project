import TextField from '@mui/material/TextField';
import { useState } from 'react';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import { WiCloud, WiThermometer, WiHumidity, WiStrongWind } from "react-icons/wi";
import "./SearchBox.css";

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export default function SearchBox() {
  const [city, setCity] = useState("");
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [error, setError] = useState("");
  const [isCelsius, setIsCelsius] = useState(true);

  const toggleTempUnit = () => setIsCelsius(!isCelsius);

  const getTemp = () => {
    if (!weatherInfo) return "";
    return isCelsius
      ? `${weatherInfo.temperature} °C`
      : `${(weatherInfo.temperature * 9 / 5 + 32).toFixed(1)} °F`;
  };

  const getBackgroundImage = (desc) => {
    desc = desc.toLowerCase();
    if (desc.includes("cloud")) return "url('/assets/cloudy.jpg')";
    if (desc.includes("rain")) return "url('/assets/rain.jpg')";
    if (desc.includes("clear")) return "url('/assets/sunny.jpg')";
    if (desc.includes("snow")) return "url('/assets/snow.jpg')";
    return "url('/assets/default.jpg')";
  };

  const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getWeatherInfo = async () => {
    try {
      const response = await fetch(`${API_URL}?q=${city}&appid=${API_KEY}&units=metric`);
      const json = await response.json();

      if (json.cod === 200) {
        setWeatherInfo({
          name: json.name,
          temperature: json.main.temp,
          description: json.weather[0].description,
          humidity: json.main.humidity,
          windSpeed: json.wind.speed
        });
        setError("");
      } else {
        setError("City not found!");
        setWeatherInfo(null);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Something went wrong.");
      setWeatherInfo(null);
    }
  };

  const handleChange = (e) => setCity(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim() !== "") {
      getWeatherInfo();
      setCity("");
    }
  };

  return (
    <div className="SearchBox">
      <h3 style={{ fontSize: "1.8rem", marginBottom: "20px" }}>🌍 Search for the Weather</h3>

      <form onSubmit={handleSubmit}>
        <TextField
          id="city"
          label="City Name"
          variant="outlined"
          required
          value={city}
          onChange={handleChange}
        /><br /><br />
        <Button variant="contained" endIcon={<SendIcon />} type="submit">
          Get Weather
        </Button>
      </form>

      {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}

      {weatherInfo && (
        <div
          className="weather-result"
          style={{
            backgroundImage: getBackgroundImage(weatherInfo.description),
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "#fff",
            borderRadius: "12px",
            marginTop: "20px",
            padding: "20px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          }}
        >
          <h4>{weatherInfo.name}</h4>
          <p style={{ fontStyle: "italic", fontSize: "0.9rem" }}>{getFormattedDate()}</p>
          <p>
            <WiThermometer size={30} /> Temperature: {getTemp()}
            <button
              onClick={toggleTempUnit}
              style={{
                marginLeft: "10px",
                padding: "2px 8px",
                borderRadius: "5px",
                fontSize: "0.8rem",
                cursor: "pointer"
              }}
            >
              {isCelsius ? "Show °F" : "Show °C"}
            </button>
          </p>
          <p><WiCloud size={30} /> Condition: {weatherInfo.description}</p>
          <p><WiHumidity size={30} /> Humidity: {weatherInfo.humidity}%</p>
          <p><WiStrongWind size={30} /> Wind: {weatherInfo.windSpeed} m/s</p>
        </div>
      )}
    </div>
  );
}
