import React from "react";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import api from "../../api";
import './CryptoGraph.css';
import { useAlert } from "../AlertContext/AlertContext";
import CryptoType from "../../types/CryptoType";

const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

const options: ApexOptions = { 
    chart: { 
        type: 'candlestick',
        toolbar: {
            show: true,
            offsetX: 0,
            offsetY: 0,
            tools: {
                download: true,
                selection: true,
                zoom: false,
                zoomin: true,
                zoomout: true,
                pan: true,
                reset: true
            },
            autoSelected: 'pan' 
        }
    },
    xaxis: {
        type: 'datetime',
        labels: {
            formatter: function(value) {
                const date = new Date(value);
                return formatDate(date);
            }
        }
    },
};


interface CryptoGraphProps {
    selectedCrypto: CryptoType;
}

interface ChartDataPoint {
  x: Date;
  y: [number, number, number, number];
}

interface ChartSeries {
  data: ChartDataPoint[];
}

const CryptoGraph: React.FC<CryptoGraphProps> = ({ selectedCrypto }) => {
    const [data, setData] = useState<ChartSeries[]>([]);
    const { showAlert } = useAlert();
    
    const fetchData = async (id: string) => {
        try {
            const response = await api.get('coins/' + id + '/ohlc?vs_currency=usd&days=30');
            const data = response.data.map((d: number[]) => ({
                x: new Date(d[0]), 
                y: [d[1], d[2], d[3], d[4]]
            })) as ChartDataPoint[];
            const series = [{
                data: data
            }];
            setData(series);
        } catch (error) {
            showAlert('Error fetching data for ' + selectedCrypto.id + ', please try again in a few seconds.','error');
        }
    };
    useEffect(() => {
        if (!selectedCrypto) return;
        fetchData(selectedCrypto.id);
    }, [selectedCrypto]);
    return (
        <div className="cryptoGraph">
            <div className="cryptoGraph-maincontainer">
                <p className="cryptoGraph-title">Showing the last 30 days of data for <strong>{selectedCrypto.id}</strong></p>
            </div>
            <div className="cryptoGraph-details">
                <img src={selectedCrypto.image} alt={selectedCrypto.name} className="cryptoGraph-image" />
                <p className="cryptoGraph-detail">Current Price: <strong>{selectedCrypto.current_price} USD</strong></p>
                <p className="cryptoGraph-detail">Highest value today: <strong>{selectedCrypto.high_24h} USD</strong></p>
                <p className="cryptoGraph-detail">Lowest value today: <strong>{selectedCrypto.low_24h} USD</strong></p>
                <p className="cryptoGraph-detail">Market cap rank: <strong>{selectedCrypto.market_cap_rank}</strong></p>
            </div>
            { data.length > 0 && <div className="cryptoGraph-container">
                <Chart options={options} series={data} type="candlestick" height='100%' />;
            </div>}
        </div>
    )
}

export default CryptoGraph;