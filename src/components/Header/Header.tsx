import React from "react";
import Asynchronous from "../Autocomplete/Autocomplete";
import './Header.scss'
import CryptoType from "../../types/CryptoType";

interface HeaderProps {
  onSelectCrypto: (crypto: CryptoType) => void;
}

const Header = ({ onSelectCrypto }: HeaderProps) => {
    return (
        <header className="header">
            <div className="header-inner">
                <a className="header-brand" href="/Crypto-Graph" aria-label="CryptoGraph home">
                    <span className="header-mark" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <rect x="4" y="9" width="4" height="8" rx="1.2" />
                            <path d="M6 5.5v3.5M6 17v1.5" strokeLinecap="round" />
                            <rect x="16" y="6" width="4" height="7" rx="1.2" />
                            <path d="M18 3v3M18 13v5.5" strokeLinecap="round" />
                        </svg>
                    </span>
                    <span className="header-wordmark">
                        Crypto<span className="header-wordmark-accent">Graph</span>
                    </span>
                </a>

                <div className="header-search">
                    <Asynchronous onSelectCrypto={onSelectCrypto} />
                </div>
            </div>
        </header>
    )
}

export default Header;
