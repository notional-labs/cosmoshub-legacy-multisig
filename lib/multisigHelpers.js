import axios from "axios";
import { createMultisigThresholdPubkey, pubkeyToAddress } from "@cosmjs/amino";
import { StargateClient } from "@cosmjs/stargate";

import { getMultisig } from "./graphqlHelpers";

/**
 * Turns array of compressed Secp256k1 pubkeys
 * into a multisig using comsjs
 *
 * @param {array} compressedPubkeys Must be an array of compressed Secp256k1 pubkeys (e.g 'A8B5KVhRz1oQuV1dguzFdGBhHrIU/I+R/QfBZcbZFWVG').
 * @param {number} threshold the number of signers required to sign messages from this multisig
 * @return {string} The multisig address.
 */
const createMultisigFromCompressedSecp256k1Pubkeys = async (
  compressedPubkeys,
  threshold
) => {
  try {
    let pubkeys = compressedPubkeys.map((compressedPubkey) => {
      return {
        type: "tendermint/PubKeySecp256k1",
        value: compressedPubkey,
      };
    });
    const multisigPubkey = createMultisigThresholdPubkey(pubkeys, threshold);
    const multisigAddress = pubkeyToAddress(multisigPubkey, "cosmos");

    // save multisig to fauna
    const multisig = {
      address: multisigAddress,
      pubkeyJSON: JSON.stringify(multisigPubkey),
    };
    const res = await axios.post("/api/multisig", multisig);
    console.log(res.data);
    return res.data.address;
  } catch (error) {
    throw error;
  }
};

/**
 * This gets a multisigs account (pubkey, sequence, account number, etc) from
 * a node and/or the faunadb if the multisig was made on this app
 *
 * @param {string} address The multisig address
 * @param client A connected stargate cosmoshub client
 * @return {object} The multisig account.
 */
const getMultisigAccount = async (address, client) => {
  // we need the multisig pubkeys to create transactions, if the multisig
  // is new, and has never submitted a transaction its pubkeys will not be
  // available from a node. If the multisig was created with this instance
  // of this tool its pubkey will be available in the fauna datastore
  let accountOnChain = await client.getAccount(address);
  console.log("accountOnChain = " + accountOnChain);

  if (!accountOnChain || !accountOnChain.pubkey) {
    console.log("No pubkey on chain for: ", address);
    const res = await getMultisig(address);

    if (!res.data.data.getMultisig) {
      throw new Error(
        "Multisig has no pubkey on node, and was not created using this tool."
      );
    }
    const pubkey = JSON.parse(res.data.data.getMultisig.pubkeyJSON);

    if (!accountOnChain) {
      accountOnChain = {}; 
    }
    accountOnChain.pubkey = pubkey;
  }
  return accountOnChain;
};


const fetch_address = async (address) => {
  let url = `http://62.171.175.214:1317/auth/accounts/${address}`;
  return await axios.get(url, { "headers": { 'Access-Control-Allow-Origin': 'true', }})
};


const fetchAccount = async (address) => {
  // get account
  try {
    const accountOnChain = await fetch_address(address);
    console.log(accountOnChain)
    return accountOnChain

  } catch (err) {
    const accountOnChain = null
    console.log(err);
    return accountOnChain
  }
}

export { createMultisigFromCompressedSecp256k1Pubkeys, getMultisigAccount, fetchAccount};
