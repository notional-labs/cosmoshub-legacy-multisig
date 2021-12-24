import axios from "axios";
import React from "react";
import { withRouter } from "next/router";
import { encode, decode } from "uint8-to-base64";
import Button from "../../components/inputs/Button";
import Input from "../../components/inputs/Input";
import StackableContainer from "../layout/StackableContainer";
import { AuthInfo, TxBody, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { StargateClient, defaultRegistryTypes } from "@cosmjs/stargate";
import { fromBase64,toBase64 } from "@cosmjs/encoding"
import { recoverPersonalSignature } from '@metamask/eth-sig-util'
import { toChecksumAddress } from 'ethereumjs-util'

import { getUint8ArrayPubKeyFromSignatureData, getWeb3Instance } from '../../lib/metamaskHelpers'
import { makeSignDoc } from '@cosmjs/amino';
import { Any } from "cosmjs-types/google/protobuf/any";
import { PubKey } from "cosmjs-types/cosmos/crypto/secp256k1/keys";
import Long from "long";
import {makeSignDocJsonString} from "./Sign"
import {makeAuthInfoBytes, makeEthPubkeyFromByte, makePubKey} from "./Auth";
import {makeSendMsg, makeSignDocSendMsg} from "./Msg"
import {makeTxBodyBytes, makeRawTxBytes, getTxBodyBytesForSend} from "./Tx"
import {fromHexString} from "../util"




import {
  Registry,
  decodeTxRaw,
} from "@cosmjs/proto-signing";



export function getAccountNumber(address) {
    return 512
}

export function getAccountSequence(address) {
    return 512
} 


export function test(){  
      // registry use to encode tx body into bytes
      const registry = new Registry();

      // node to broadcast to
      const node = "0.0.0.0:26657"

      // sign doc is a json string that will be processed and then signed by priv keys, this process out put a signature for the tx 
      // chainId to be put into sign doc
      const chainId = "test-1"
      
      // msg send params
      const fromAddress = "0x5050A4F4b3f9338C3472dcC01A87C76A144b3c9c"
      const toAddress = "0x5050A4F4b3f9338C3472dcC01A87C76A144b3c9c"
      const amount = 1
      const denom = "stake"

      // auth info params, accNum and sequence will also be put into signdoc
      const mode = 191
      const accountNumber = getAccountNumber()
      const sequence = getAccountSequence()

      // gas fee to be put in fee and signdoc fee
      const gasLimit = "200000"

      // bank send msg and memo to be put into tx body
      const sendMsg  = makeSendMsg(fromAddress, toAddress, amount, denom)
      const memo = "some memo"

      // sign doc send msg to be put into sign doc
      const signDocSendMsg = makeSignDocSendMsg(fromAddress, toAddress, amount, denom)
 

      // fee that will be put into signdoc fee, let's call it signdoc fee
      const stdFeeToPutIntoSignDoc = {
        amount: [],
        gas: gasLimit,
      };

      // fee that will be put into auth info, let's call it fee
      // fee and signdoc fee is basically the same, but also not the same
      const fee = {
        amount: [],
        gasLimit: gasLimit,
      }

      // make signdoc in json string format and put it into signParams to sign it with metamask
      const signDocJsonString = makeSignDocJsonString(signDocSendMsg, stdFeeToPutIntoSignDoc, chainId, memo, accountNumber, sequence)

      const signParams = [fromAddress, signDocJsonString];
      const method = 'personal_sign';

      var pubKeyBytes = null;
      var signature_metamask_hex = null;
      
      // metamask signing bla bla
      const web3 = getWeb3Instance()
      web3.currentProvider.send(
        {
          method,
          signParams,
          fromAddress,
        },
        function (err, result) {
          if (err) return console.dir(err);
          if (result.error) {
            alert(result.error.message);
          }
          if (result.error) return console.error('ERROR', result);

          // get compressed pubKey bytes
          pubKeyBytes = getUint8ArrayPubKeyFromSignatureData({
            data: signDocJsonString,
            signature: result.result
          })

          // verify signer
          const recovered = recoverPersonalSignature({
            data: signDocJsonString,
            signature: result.result,
          });
          signature_metamask_hex = result.result
          
          if (
            toChecksumAddress(recovered) === toChecksumAddress(fromAddress)
          ) {
            alert('Successfully recovered signer as ' + fromAddress);
          } else {
            alert(
              'Failed to verify signer when comparing ' + result + ' to ' + fromAddress
            );
          }
        }
      ).then(()=>{
        // make auth info bytes
        const ethPubKey = makeEthPubkeyFromByte(pubKeyBytes)
        const authInfoBytes = makeAuthInfoBytes(fee, ethPubKey, mode, sequence)

        // make body bytes
        const bodyBytes = getTxBodyBytesForSend(sendMsg, memo, registry) 

        const signature_bytes = fromHexString(signature_metamask_hex)

        const txRawBytes = makeRawTxBytes(authInfoBytes, bodyBytes, [signature_bytes])

        StargateClient.connect(node).then(
          (broadcaster) => {
            const ans = broadcaster.broadcastTx(
              Uint8Array.from(txRawBytes)
            );
          }
        );        
      })
};


export default withRouter(TransactionForm);
