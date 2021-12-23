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
import {makeAuthInfoBytes, makeEthPubkeyFromByte, makePubKey} from "../types/Auth";
import {makeSendMsg} from "../types/Msg"
import {makeTxBodyBytes, makeRawTxBytes, getTxBodyBytesForSend} from "../types/Tx"





import {
  Registry,
  coins,
  decodeTxRaw,
  encodePubkey
} from "@cosmjs/proto-signing";

function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ((byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

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
      const fromAddress = "0x3325a78425F17a7E487Eb5666b2bFd93aBb06c70"
      const toAddress = this.state.toAddress
      const amount = parseInt(this.state.amount)
      const denom = process.env.NEXT_PUBLIC_DENOM

      // auth info
      const mode = 191
      const accountNumber = this.props.accountOnChain.accountNumber
      const sequence = this.props.accountOnChain.sequence

      // bank send msg and fee and memo
      const [msg, signDocMsg]  = makeSendMsg(fromAddress, toAddress, amount, process.env.NEXT_PUBLIC_DENOM)
      const gasLimit = this.state.gas.toString()
      const stdFeeToPutIntoSignDoc = {
        amount: [],
        gas: gasLimit,
      };
      const fee = {
        amount: [],
        gasLimit: gasLimit,
      }
      const memo = this.state.memo

      this.setState({ processing: true });

      // make signdoc and sign it with metamask
      const signDocJsonString = makeSignDocJsonString(signDocMsg, stdFeeToPutIntoSignDoc, chainId, memo, accountNumber, sequence)

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
        const ethPubKey = makePubKey(pubKeyBytes)
        console.log(pubKeyBytes)
        console.log("sadfasldkj")
        console.log(toHexString(ethPubKey))
        console.log(signature_metamask)
        const bodyBytes = getTxBodyBytesForSend(msg, memo, registry) 
        const authInfoBytes = makeAuthInfoBytes(fee, ethPubKey, mode, sequence)
        let signature = this.fromHexString(signature_metamask)
        signature[64] = 0


        const txRawBytes = makeRawTxBytes(authInfoBytes, bodyBytes, [signature])
        const txTestRaw = this.fromHexString("7b22626f6479223a7b226d65737361676573223a5b7b224074797065223a222f636f736d6f732e62616e6b2e763162657461312e4d736753656e64222c2266726f6d5f61646472657373223a22307866623932613430333939313936316133313031363937646364376131393066636633616536376636222c22746f5f61646472657373223a22307835303530613466346233663933333863333437326463633031613837633736613134346233633963222c22616d6f756e74223a5b7b2264656e6f6d223a227374616b65222c22616d6f756e74223a2239227d5d7d5d2c226d656d6f223a22222c2274696d656f75745f686569676874223a2230222c22657874656e73696f6e5f6f7074696f6e73223a5b5d2c226e6f6e5f637269746963616c5f657874656e73696f6e5f6f7074696f6e73223a5b5d7d2c22617574685f696e666f223a7b227369676e65725f696e666f73223a5b7b227075626c69635f6b6579223a7b224074797065223a222f636f736d6f732e63727970746f2e657468736563703235366b312e5075624b6579222c226b6579223a22416a37616b77484c67485762475a2b585339556d694b483271636e79553136717a64654f557272656f4f4371227d2c226d6f64655f696e666f223a7b2273696e676c65223a7b226d6f6465223a225349474e5f4d4f44455f444952454354227d7d2c2273657175656e6365223a2239227d5d2c22666565223a7b22616d6f756e74223a5b5d2c226761735f6c696d6974223a22323030303030222c227061796572223a22222c226772616e746572223a22227d7d2c227369676e617475726573223a5b2249376746382b614a30704154707a7131574d62765369536e65746c61356e42476c43616a5344765a4e73566f7a6d4839786c5063317047616a4e5141732b4243754e6e6b38677568516b5a633239364f427a30623167453d225d7d")

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
