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
import {makeAuthInfoBytes, makeEthPubkeyFromByte} from "../types/Auth"
import {makeSendMsg} from "../types/Msg"
import {makeTxBodyBytes} from "../types/Tx"





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

    this.createSignDoc = this.createSignDoc.bind(this);
  }
  fromHexString = (hexString) =>{
    new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  }
  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  // encodeEthPubkey = (pubkeyBytes) => {
  //   const pubkeyProto = PubKey.fromPartial({
  //     key: pubkeyBytes,
  //   });
  //   return Any.fromPartial({
  //     typeUrl: "/cosmos.crypto.ethsecp256k1.PubKey",
  //     value: Uint8Array.from(PubKey.encode(pubkeyProto).finish()),
  //   });
  // }

  getTxBodyBytesForSend = (fromAddress, toAddress, amount, memo) => {

    // const registry = new Registry()
    // let encodeObject =  {
    //   typeUrl: "/cosmos.tx.v1beta1.TxBody",
    //   value: {
    //     messages: [
    //       {
    //         typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    //         value: {
    //           fromAddress: fromAddress,
    //           toAddress: toAddress,
    //           amount: [
    //             {
    //               denom: process.env.NEXT_PUBLIC_DENOM,
    //               amount: amount,
    //             },
    //           ],
    //         },
    //       },
    //     ],
    //     memo: memo,
    //   },
    // }
    // console.log("mmm")
    // console.log(encodeObject)
    // const ans = registry.encode(encodeObject)
    // return ans
    const registry = new Registry();
    let txBodyFields = {
      typeUrl: "/cosmos.tx.v1beta1.TxBody",
      value: {
        messages: [
          {
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: {
              fromAddress: "abc",
              toAddress: ":abc",
              amount: [
                {
                  denom: "ucosm",
                  amount: "1234567",
                },
              ],
            },
          },
        ],
      },
    };
    const txBodyBytes = registry.encode(txBodyFields);
    return txBodyBytes

  }

  makesignedTx = (
    pubkey,
    sequence,
    fee,
    bodyBytes,
    signatures,
  ) => {
    const mode = "SIGN_MODE_EIP191_LEGACY_JSON"
    const authInfoBytes = makeAuthInfoBytes(fee, pubkey, mode, sequence);
    const signedTx = TxRaw.fromPartial({
      authInfoBytes: authInfoBytes,
      bodyBytes: bodyBytes,
      signatures: signatures,
    });
  
    return signedTx;
  };
  
  createSignDoc = (toAddress, amount, fee) => {
    const msg = makeSendMsg(this.props.address, toAddress, amount, process.env.NEXT_PUBLIC_DENOM)

    console.log(this.props.state)
    return makeSignDocJsonString(msg, fee, "dig-1", this.state.memo, this.props.accountOnChain.accountNumber, this.props.accountOnChain.sequence)
  };

  
  handleCreate = async () => {
    if (this.state.toAddress.length === 42) {
      const fee = {
        amount: coins(2000, process.env.NEXT_PUBLIC_DENOM),
        gas: this.state.gas.toString(),
      };

      this.setState({ processing: true });
      const signDoc = this.createSignDoc(
        this.state.toAddress,
        this.state.amount,
        fee
      );

      // send to metamask to sign
      let from = this.props.address
      let msgParams = signDoc
      let params = [from, msgParams];
      let method = 'personal_sign';

      console.log("from is " + from);
      var pubKey = null;
      var signature_metamask = null;

      this.props.web3.currentProvider.send(
        {
          method,
          params,
          from,
        },
        function (err, result) {
          if (err) return console.dir(err);
          if (result.error) {
            alert(result.error.message);
          }
          if (result.error) return console.error('ERROR', result);
          console.log('TYPED SIGNED:' + JSON.stringify(result.result));
          console.log(pubKey)

          // get pubKey
          pubKey = getUint8ArrayPubKey({
            data: msgParams,
            signature: result.result
          })
          console.log(pubKey)

          // verify signer
          const recovered = recoverPersonalSignature({
            data: msgParams,
            signature: result.result,
          });
          signature_metamask = result.result
        
          if (
            toChecksumAddress(recovered) === toChecksumAddress(from)
          ) {
            alert('Successfully recovered signer as ' + from);
          } else {
            alert(
              'Failed to verify signer when comparing ' + result + ' to ' + from
            );
          }
        }
      ).then(()=>{
        const bodyBytes = this.getTxBodyBytesForSend(from, this.state.toAddress, this.state.amount, this.state.memo)
        const signatures = this.fromHexString(signature_metamask)
        console.log(signatures)
        const signedTx = this.makesignedTx(
          makeEthPubkeyFromByte(pubKey),
          this.sequence,
          fee,
          bodyBytes,
          signatures
        )
        console.log("abc")
        console.log(signedTx)
        console.log(decodeTxRaw(signedTx))
        StargateClient.connect(process.env.NEXT_PUBLIC_NODE_ADDRESS).then(
          (broadcaster) => {
            const ans = broadcaster.broadcastTx(
              Uint8Array.from(TxRaw.encode(signedTx).finish())
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
