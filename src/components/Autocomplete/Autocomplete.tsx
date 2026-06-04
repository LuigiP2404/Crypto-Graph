import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import api from '../../api';
import { useEffect, useState } from 'react';
import './Autocomplete.css';
import { useAlert } from '../AlertContext/AlertContext';
import CryptoType from '../../types/CryptoType';

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

            const response = await api.get('coins/markets?vs_currency=usd&name=' + inputValue);
            if (response.data && response.data) {
                setOptions(response.data.map((coin: CryptoType) => ({
                    name: coin.name,
                    symbol: coin.symbol,
                    id: coin.id,
                    current_price: coin.current_price,
                    market_cap_rank: coin.market_cap_rank,
                    high_24h: coin.high_24h,
                    low_24h: coin.low_24h,
                    image: coin.image,
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
        if (inputValue.length < 3) {
            setOptions([]);
            return;
        }
        const timeoutId = setTimeout(() => {
            if (inputValue.length < 3) {
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
    }, [inputValue]);

    useEffect(() => {
        if (selectedOption) {
            onSelectCrypto(selectedOption);
        }
    }, [selectedOption]);

    useEffect(() => {
        console.log(options);
    }, [options]);

    return (
        <Autocomplete
            sx={{ width: 300 }}
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
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Search Crypto"
                    slotProps={{
                        input: {
                            ...params.InputProps,
                            endAdornment: (
                                <React.Fragment>
                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
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