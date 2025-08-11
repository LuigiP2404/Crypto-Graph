import React from "react";
import Asynchronous from "../Autocomplete/Autocomplete";
import './Header.css'
import CryptoType from "../../types/CryptoType";

interface HeaderProps {
  onSelectCrypto: (crypto: CryptoType) => void;
}

const Header = ({ onSelectCrypto }: HeaderProps) => {
    return (
        <div className="header">
            <Asynchronous onSelectCrypto={onSelectCrypto} />
        </div>
    )
}

export default Header;