import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import api from "../../api";
import './CryptoGraph.scss';
import { useAlert } from "../AlertContext/AlertContext";
import CryptoType from "../../types/CryptoType";
import {
    formatCompactPrice,
    formatPercent,
    formatPrice,
    rangePosition,
} from "../../utils/format";

const RANGES = [
    { label: '24H', days: 1 },
    { label: '7D', days: 7 },
    { label: '30D', days: 30 },
    { label: '90D', days: 90 },
    { label: '1Y', days: 365 },
];

const formatAxisDate = (timestamp: number, days: number) => {
    const date = new Date(timestamp);
    if (days <= 1) {
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
    if (days >= 365) {
        return date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
    }
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

const buildOptions = (days: number): ApexOptions => ({
    chart: {
        type: 'candlestick',
        background: 'transparent',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        animations: { enabled: true, speed: 400 },
        toolbar: {
            show: true,
            offsetX: 0,
            offsetY: -8,
            tools: {
                download: false,
                selection: false,
                zoom: false,
                zoomin: true,
                zoomout: true,
                pan: true,
                reset: true,
            },
            autoSelected: 'pan',
        },
    },
    theme: { mode: 'dark' },
    grid: {
        borderColor: 'rgba(255, 255, 255, 0.06)',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        padding: { top: 0, right: 8, bottom: 0, left: 4 },
    },
    plotOptions: {
        candlestick: {
            colors: { upward: '#2ee6a8', downward: '#ff5a72' },
            wick: { useFillColor: true },
        },
    },
    xaxis: {
        type: 'datetime',
        axisBorder: { show: false },
        axisTicks: { color: 'rgba(255, 255, 255, 0.08)' },
        tooltip: { enabled: false },
        labels: {
            datetimeUTC: false,
            rotate: 0,
            hideOverlappingLabels: true,
            style: { colors: '#8a94a8', fontSize: '11px', fontWeight: 500 },
            formatter: (value: string) => {
                const timestamp = Number(value);
                if (!Number.isFinite(timestamp)) return value;
                return formatAxisDate(timestamp, days);
            },
        },
    },
    yaxis: {
        opposite: true,
        tooltip: { enabled: true },
        labels: {
            style: { colors: '#8a94a8', fontSize: '11px', fontWeight: 500 },
            formatter: (value: number) => formatCompactPrice(value),
        },
    },
    tooltip: {
        theme: 'dark',
        x: { format: days <= 1 ? 'dd MMM HH:mm' : 'dd MMM yyyy' },
    },
});

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
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);
    const { showAlert } = useAlert();

    const fetchData = useCallback(async (id: string, range: number) => {
        setLoading(true);
        try {
            const response = await api.get(`coins/${id}/ohlc?vs_currency=usd&days=${range}`);
            const points = response.data.map((d: number[]) => ({
                x: new Date(d[0]),
                y: [d[1], d[2], d[3], d[4]]
            })) as ChartDataPoint[];
            setData([{ data: points }]);
        } catch (error) {
            setData([]);
            showAlert('Error fetching data for ' + id + ', please try again in a few seconds.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showAlert]);

    useEffect(() => {
        if (!selectedCrypto) return;
        fetchData(selectedCrypto.id, days);
    }, [selectedCrypto, days, fetchData]);

    const options = useMemo(() => buildOptions(days), [days]);

    const change = selectedCrypto.price_change_percentage_24h;
    const isUp = (change ?? 0) >= 0;
    const changeClass =
        change === null || change === undefined ? 'is-flat' : isUp ? 'is-up' : 'is-down';
    const position = rangePosition(
        selectedCrypto.low_24h,
        selectedCrypto.high_24h,
        selectedCrypto.current_price
    );

    return (
        <section className="cryptoGraph">
            <div className="cryptoGraph-hero">
                <div className="cryptoGraph-identity">
                    <div className="cryptoGraph-avatar">
                        <img
                            src={selectedCrypto.image}
                            alt={selectedCrypto.name}
                            className="cryptoGraph-image"
                        />
                    </div>
                    <div className="cryptoGraph-titles">
                        <h1 className="cryptoGraph-name">{selectedCrypto.name}</h1>
                        <div className="cryptoGraph-tags">
                            <span className="cryptoGraph-symbol">
                                {selectedCrypto.symbol?.toUpperCase()}
                            </span>
                            {selectedCrypto.market_cap_rank ? (
                                <span className="cryptoGraph-rank">
                                    Rank #{selectedCrypto.market_cap_rank}
                                </span>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="cryptoGraph-priceBlock">
                    <span className="cryptoGraph-price">
                        {formatPrice(selectedCrypto.current_price)}
                    </span>
                    <span className={`cryptoGraph-change ${changeClass}`}>
                        <span className="cryptoGraph-arrow" aria-hidden="true">
                            {isUp ? '▲' : '▼'}
                        </span>
                        {formatPercent(change)}
                        <span className="cryptoGraph-changeLabel">24h</span>
                    </span>
                </div>
            </div>

            <div className="cryptoGraph-stats">
                <div className="cryptoGraph-stat">
                    <span className="cryptoGraph-statLabel">Current price</span>
                    <span className="cryptoGraph-statValue">
                        {formatPrice(selectedCrypto.current_price)}
                    </span>
                </div>
                <div className="cryptoGraph-stat">
                    <span className="cryptoGraph-statLabel">24h high</span>
                    <span className="cryptoGraph-statValue is-up">
                        {formatPrice(selectedCrypto.high_24h)}
                    </span>
                </div>
                <div className="cryptoGraph-stat">
                    <span className="cryptoGraph-statLabel">24h low</span>
                    <span className="cryptoGraph-statValue is-down">
                        {formatPrice(selectedCrypto.low_24h)}
                    </span>
                </div>
                <div className="cryptoGraph-stat">
                    <span className="cryptoGraph-statLabel">Market cap rank</span>
                    <span className="cryptoGraph-statValue">
                        {selectedCrypto.market_cap_rank ? `#${selectedCrypto.market_cap_rank}` : '—'}
                    </span>
                </div>
            </div>

            {position !== null && (
                <div className="cryptoGraph-rangeBar">
                    <span className="cryptoGraph-rangeEdge">{formatPrice(selectedCrypto.low_24h)}</span>
                    <div className="cryptoGraph-track">
                        <div className="cryptoGraph-trackFill" style={{ width: `${position}%` }} />
                        <div className="cryptoGraph-thumb" style={{ left: `${position}%` }} />
                    </div>
                    <span className="cryptoGraph-rangeEdge">{formatPrice(selectedCrypto.high_24h)}</span>
                </div>
            )}

            <div className="cryptoGraph-card">
                <div className="cryptoGraph-cardHeader">
                    <div>
                        <h2 className="cryptoGraph-cardTitle">Price chart</h2>
                        <p className="cryptoGraph-cardSubtitle">
                            OHLC candles · {RANGES.find((r) => r.days === days)?.label ?? `${days}D`}
                        </p>
                    </div>
                    <div className="cryptoGraph-ranges" role="group" aria-label="Chart time range">
                        {RANGES.map((range) => (
                            <button
                                key={range.days}
                                type="button"
                                className={`cryptoGraph-rangeBtn${days === range.days ? ' is-active' : ''}`}
                                aria-pressed={days === range.days}
                                onClick={() => setDays(range.days)}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="cryptoGraph-chart">
                    {loading ? (
                        <div className="cryptoGraph-skeleton" role="status" aria-label="Loading chart">
                            {[38, 62, 45, 78, 55, 88, 66, 42, 72, 58, 84, 50].map((h, i) => (
                                <span
                                    key={i}
                                    className="cryptoGraph-skeletonBar"
                                    style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }}
                                />
                            ))}
                        </div>
                    ) : data.length > 0 && data[0].data.length > 0 ? (
                        <Chart options={options} series={data} type="candlestick" height="100%" />
                    ) : (
                        <div className="cryptoGraph-noData">No chart data available for this range.</div>
                    )}
                </div>
            </div>
        </section>
    )
}

export default CryptoGraph;
