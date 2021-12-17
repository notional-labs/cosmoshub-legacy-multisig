import axios from "axios";
import { coins } from "@cosmjs/launchpad";
import React from "react";
import { withRouter } from "next/router";

import Button from "../../components/inputs/Button";
import Input from "../../components/inputs/Input";
import StackableContainer from "../layout/StackableContainer";

import { fromBase64 } from "@cosmjs/encoding"

import { recoverPersonalSignature } from '@metamask/eth-sig-util'
import { toChecksumAddress } from 'ethereumjs-util'

import { getUint8ArrayPubKey } from '../../lib/metamaskHelpers'
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

    this.createTransaction = this.createTransaction.bind(this);
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  createTransaction = (toAddress, amount, gas) => {
    const msgSend = {
      fromAddress: this.props.address,
      toAddress: toAddress,
      amount: coins(amount * 1000000, process.env.NEXT_PUBLIC_DENOM),
    };
    const msg = {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: msgSend,
    };
    const gasLimit = gas;
    const fee = {
      amount: coins(6000, process.env.NEXT_PUBLIC_DENOM),
      gas: gasLimit.toString(),
    };

    return {
      accountNumber: this.props.accountOnChain.accountNumber,
      sequence: this.props.accountOnChain.sequence,
      chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
      msgs: [msg],
      fee: fee,
      memo: this.state.memo,
    };
  };

  handleCreate = async () => {
    if (this.state.toAddress.length === 42) {
      this.setState({ processing: true });
      const tx = this.createTransaction(
        this.state.toAddress,
        this.state.amount,
        this.state.gas
      );
      console.log(tx);

      // send to metamask to sign
      let from = this.props.address
      let msgParams = JSON.stringify(tx)
      let params = [from, msgParams];
      let method = 'personal_sign';

      console.log("from is " + from);

      this.props.web3.currentProvider.sendAsync(
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

          // get pubKey
          const pubKey = getUint8ArrayPubKey({
            data: msgParams,
            signature: result.result
          })

          /*
          console.log("pubkey = " + pubKey)
          console.log("cosmos pubkey = " + fromBase64("A7lEP4eu1Hh+bySk/H3wlX7VcelIYNVu7/gO+Uo3c1wi"))
          */

          // verify signer
          const recovered = recoverPersonalSignature({
            data: msgParams,
            signature: result.result,
          });
    
          if (
            toChecksumAddress(recovered) === toChecksumAddress(from)
          ) {
            alert('Successfully recovered signer as ' + from);
          } else {
            alert(
              'Failed to verify signer when comparing ' + result + ' to ' + from
            );
          }

          // send transaction
          /*
          const broadcaster = await StargateClient.connect(NEXT_PUBLIC_NODE_ADDRESS);
          const result = await broadcaster.broadcastTx(
            Uint8Array.from(TxRaw.encode(signedTx).finish())
          );
          */
        }
      );
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
