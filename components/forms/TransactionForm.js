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

import { getUint8ArrayPubKey } from '../../lib/metamaskHelpers'
import { makeSignDoc } from '@cosmjs/amino';
import { Any } from "cosmjs-types/google/protobuf/any";
import { PubKey } from "cosmjs-types/cosmos/crypto/secp256k1/keys";
import Long from "long";
import {makeSignDocJsonString} from "../types/Sign"
import {makeAuthInfoBytes, makeEthPubkeyFromByte} from "../types/Auth";
import {makeSendMsg} from "../types/Msg"
import {makeTxBodyBytes, makeRawTxBytes, getTxBodyBytesForSend} from "../types/Tx"





import {
  Registry,
  coins,
  decodeTxRaw,
  encodePubkey
} from "@cosmjs/proto-signing";

class TransactionForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      toAddress: "",
      amount: 0,
      memo: "",
      gas: 200000,
      processing: false,
      addressError: "",
    };
  }
  fromHexString = (hexString) =>{
    if (hexString.slice(0,2) == "0x") {
      return Uint8Array.from(Buffer.from(hexString.slice(2), 'hex'));
    }
    return Uint8Array.from(Buffer.from(hexString, 'hex'));
  }
  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  
  
  handleCreate = async () => {
    if (this.state.toAddress.length === 42) {
      const registry = new Registry();

      // node to broadcast to
      const node = process.env.NEXT_PUBLIC_NODE_ADDRESS

      // sign doc params
      const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
      
      // msg send params
      const fromAddress = "0x5050A4F4b3f9338C3472dcC01A87C76A144b3c9c"
      const toAddress = this.state.toAddress
      const amount = parseInt(this.state.amount)
      const denom = process.env.NEXT_PUBLIC_DENOM

      // auth info
      const mode = "SIGN_MODE_EIP191_LEGACY_JSON"
      const accountNumber = this.props.accountOnChain.accountNumber
      const sequence = this.props.accountOnChain.sequence

      // bank send msg and fee and memo
      const msg = makeSendMsg(fromAddress, toAddress, amount, process.env.NEXT_PUBLIC_DENOM)
      const gasLimit = this.state.gas.toString()
      const stdFeeToPutIntoSignDoc = {
        amount: coins(2000, denom),
        gas: gasLimit,
      };
      const fee = {
        amount: [],
        gasLimit: gasLimit,
      }
      const memo = this.state.memo

      this.setState({ processing: true });

      // make signdoc and sign it with metamask
      const signDocJsonString = makeSignDocJsonString(msg, stdFeeToPutIntoSignDoc, chainId, mode, accountNumber, sequence)

      let params = [fromAddress, signDocJsonString];
      let method = 'personal_sign';

      console.log("from is " + fromAddress);
      var pubKeyBytes = null;
      var signature_metamask = null;

      this.props.web3.currentProvider.send(
        {
          method,
          params,
          fromAddress,
        },
        function (err, result) {
          if (err) return console.dir(err);
          if (result.error) {
            alert(result.error.message);
          }
          if (result.error) return console.error('ERROR', result);
          console.log('TYPED SIGNED:' + JSON.stringify(result.result));
          console.log(pubKeyBytes)

          // get pubKey bytes
          pubKeyBytes = getUint8ArrayPubKey({
            data: signDocJsonString,
            signature: result.result
          })
          console.log(pubKeyBytes)

          // verify signer
          const recovered = recoverPersonalSignature({
            data: signDocJsonString,
            signature: result.result,
          });
          signature_metamask = result.result
          
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
        const ethPubKey = makeEthPubkeyFromByte(pubKeyBytes)
        console.log(pubKeyBytes)
        console.log("pubkey")
        console.log(ethPubKey)
        const bodyBytes = getTxBodyBytesForSend(msg, memo, registry) 
        const authInfoBytes = makeAuthInfoBytes(fee, ethPubKey, mode, sequence)
        const signature = this.fromHexString(signature_metamask)

        const txRawBytes = makeRawTxBytes(authInfoBytes, bodyBytes, [signature])
        
        console.log(txRawBytes)
        console.log(decodeTxRaw(txRawBytes))
        StargateClient.connect(node).then(
          (broadcaster) => {
            const ans = broadcaster.broadcastTx(
              Uint8Array.from(txRawBytes)
            );
            console.log(ans)
          }
        );        
      })
        
    } else {
      this.setState({ addressError: "Use a valid address" });
    }

    };

  render() {
    return (
      <StackableContainer lessPadding>
        <button className="remove" onClick={this.props.closeForm}>
          ✕
        </button>
        <h2>Create New transaction</h2>
        <div className="form-item">
          <Input
            label="To Address"
            name="toAddress"
            value={this.state.toAddress}
            onChange={this.handleChange}
            error={this.state.addressError}
            placeholder="dig166tktdgrzk8d7kl03ymm046v7jxma5cuvpa6g0"
          />
        </div>
        <div className="form-item">
          <Input
            label="Amount (dig)"
            name="amount"
            type="number"
            value={this.state.amount}
            onChange={this.handleChange}
          />
        </div>
        <div className="form-item">
          <Input
            label="Gas Limit (UDIG)"
            name="gas"
            type="number"
            value={this.state.gas}
            onChange={this.handleChange}
          />
        </div>
        <div className="form-item">
          <Input
            label="Memo"
            name="memo"
            type="text"
            value={this.state.memo}
            onChange={this.handleChange}
          />
        </div>
        <Button label="Convert" onClick={this.handleCreate} />
        <style jsx>{`
          p {
            margin-top: 15px;
          }
          .form-item {
            margin-top: 1.5em;
          }
          button.remove {
            background: rgba(255, 255, 255, 0.2);
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: none;
            color: white;
            position: absolute;
            right: 10px;
            top: 10px;
          }
        `}</style>
      </StackableContainer>
    );
  }
}

export default withRouter(TransactionForm);
