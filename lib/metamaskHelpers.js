import Web3 from 'web3';

import { extractPublicKey } from '@metamask/eth-sig-util'
import { fromHex } from "@cosmjs/encoding"

/**
 * 
 * @returns {Web3} web3 instance
 */
async function getWeb3Instance(){
    // Empty web3 instance
    if (typeof window.ethereum === 'undefined') {
        window.alert("Meta mask is not present");
        return null;
    }
  
    // Instance web3 with the provided information from the MetaMask provider information
    let web3 = new Web3(window.ethereum);
    try {
        // Request account access
        await window.ethereum.enable();
    } catch (e) {
        // Handle user denied access
        return null;
    }

    return web3;
}

function getUint8ArrayPubKey(data){
    const pubKey = extractPublicKey({
        data: data.data,
        signature: data.signature
    });

    const unit8PubKey = Array.from(fromHex(pubKey.slice(2)));
    unit8PubKey.unshift(3);
    return Uint8Array.from(unit8PubKey.slice(0, 33));
}

export { getWeb3Instance, getUint8ArrayPubKey };