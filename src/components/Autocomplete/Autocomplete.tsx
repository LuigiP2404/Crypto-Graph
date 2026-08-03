import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import api from '../../api';
import { useEffect, useState } from 'react';
import './Autocomplete.scss';
import { useAlert } from '../AlertContext/AlertContext';
import CryptoType from '../../types/CryptoType';
import { formatPrice, formatPercent } from '../../utils/format';

const MIN_QUERY_LENGTH = 3;
const MAX_RESULTS = 10;

interface SearchCoin {
    id: string;
}

const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.2-3.2" />
    </svg>
);

interface AsynchronousProps {
    onSelectCrypto: (crypto: CryptoType) => void;
}
const Asynchronous: React.FC<AsynchronousProps> = ({ onSelectCrypto }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState<CryptoType[]>([]);
    const [selectedOption, setSelectedOption] = useState<CryptoType | null>(null);
    const { showAlert } = useAlert();

    const handleOpen = () => {
        setOpen(true);
    };

    const fetchCryptos = async () => {
        try {
            // /coins/markets only filters by exact name, so the prefix search goes
            // through /search first and the market data is fetched by id.
            const search = await api.get('search?query=' + encodeURIComponent(inputValue));
            const ids = (search.data?.coins ?? [])
                .slice(0, MAX_RESULTS)
                .map((coin: SearchCoin) => coin.id)
                .join(',');

            if (!ids) {
                setOptions([]);
                return;
            }

            const response = await api.get('coins/markets?vs_currency=usd&ids=' + ids);
            if (response.data) {
                setOptions(response.data.map((coin: CryptoType) => ({
                    name: coin.name,
                    symbol: coin.symbol,
                    id: coin.id,
                    current_price: coin.current_price,
                    market_cap_rank: coin.market_cap_rank,
                    high_24h: coin.high_24h,
                    low_24h: coin.low_24h,
                    image: coin.image,
                    price_change_percentage_24h: coin.price_change_percentage_24h,
                })));
            }
        } catch (error) {
            showAlert('Error fetching cryptocurrencies, please try again in a few seconds.', 'error');
        }
    }

    const handleClose = () => {
        setOpen(false);
        setOptions([]);
    };

    useEffect(() => {
        // wait for the user to stop typing to avoid too many requests
        if (inputValue.length < MIN_QUERY_LENGTH) {
            setOptions([]);
            return;
        }
        const timeoutId = setTimeout(() => {
            if (inputValue.length < MIN_QUERY_LENGTH) {
                setOptions([]);
                return;
            } else {
                setLoading(true);
                fetchCryptos().then(() => {
                    setLoading(false);
                });
            }
        }, 500);

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputValue]);

    useEffect(() => {
        if (selectedOption) {
            onSelectCrypto(selectedOption);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOption]);

    return (
        <Autocomplete
            className="cryptoSearch"
            sx={{ width: '100%', maxWidth: 380 }}
            open={open}
            onOpen={handleOpen}
            onClose={handleClose}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            onChange={(event, newValue) => {
                setSelectedOption(newValue);
            }}
            filterOptions={(x) => x}
            isOptionEqualToValue={(option, value) => option.name === value.name}
            getOptionLabel={(option) => option.name}
            options={options}
            loading={loading}
            loadingText="Searching…"
            noOptionsText={
                inputValue.length < MIN_QUERY_LENGTH
                    ? `Type at least ${MIN_QUERY_LENGTH} characters`
                    : 'No cryptocurrency found'
            }
            renderOption={(props, option) => {
                const { key, ...optionProps } = props as React.HTMLAttributes<HTMLLIElement> & { key: React.Key };
                const change = option.price_change_percentage_24h;
                const changeClass =
                    change === null || change === undefined
                        ? 'is-flat'
                        : change >= 0
                            ? 'is-up'
                            : 'is-down';

                return (
                    <li key={key} {...optionProps}>
                        <div className="cryptoOption">
                            <img
                                className="cryptoOption-image"
                                src={option.image}
                                alt=""
                                loading="lazy"
                            />
                            <div className="cryptoOption-main">
                                <span className="cryptoOption-name">{option.name}</span>
                                <span className="cryptoOption-symbol">{option.symbol?.toUpperCase()}</span>
                            </div>
                            <div className="cryptoOption-meta">
                                <span className="cryptoOption-price">{formatPrice(option.current_price)}</span>
                                <span className={`cryptoOption-change ${changeClass}`}>
                                    {formatPercent(change)}
                                </span>
                            </div>
                        </div>
                    </li>
                );
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    placeholder="Search a cryptocurrency…"
                    slotProps={{
                        input: {
                            ...params.InputProps,
                            startAdornment: (
                                <InputAdornment position="start" className="cryptoSearch-icon">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <React.Fragment>
                                    {loading ? <CircularProgress color="inherit" size={18} /> : null}
                                    {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                        },
                    }}
                />
            )}
        />
    );
}

export default Asynchronous;
