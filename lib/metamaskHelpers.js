import Web3 from 'web3';

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

export { getWeb3Instance};