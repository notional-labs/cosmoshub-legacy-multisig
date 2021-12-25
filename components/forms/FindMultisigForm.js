import React from "react";

import Button from "../inputs/Button";
import StackableContainer from "../layout/StackableContainer";
import Input from "../inputs/Input";
import { getWeb3Instance } from "../../lib/metamaskHelpers";
import axios from "axios";

class FindMultisigForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      address: "",
      keyError: "",
      balance: 0,
      querySuccess: false,
      processing: false,
    };
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleQueryBalanceOnRest = async (address) => {
    let url = process.env.NEXT_PUBLIC_REST_ADDRESS + "/cosmos/bank/v1beta1/balances/" + address;
    let axiosRes;
    try{
      axiosRes = await axios.get(url);
    } catch(error){ 
      console.log("error = " + error)
      return null;
    }

    let balance = 0;

    if(axiosRes.data.balances.length > 0){
      balance = axiosRes.data.balances[0].amount/1000000;
    }
    
    let balanceStr = balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return balanceStr;
  }

  handleQuery = async () => {
    const balance = await this.handleQueryBalanceOnRest(this.state.address);
    if(balance){
      this.setState({
        balance : balance,
        querySuccess: true,
      });
    }else alert("Fail to query your balance");
}

  handleConnect = async () => {
    let web3 = await getWeb3Instance();

    const address = (await web3.eth.getAccounts())[0];

    let balance = await this.handleQueryBalanceOnRest(address);
    if(!balance){
      this.props.onFailure();
      return;
    }

    this.props.onSuccess(web3, address, balance);
  };

  handleAddKeplr = () => {
    if (!window.keplr) {
      alert("Please install keplr extension");
      return;
    }

    window.keplr.enable("cosmoshub-4");
    window.keplr.experimentalSuggestChain({
      chainId: "dig",
      chainName: "DIG",
      rpc: process.env.NEXT_PUBLIC_NODE_ADDRESS,
      rest: process.env.NEXT_PUBLIC_REST_ADDRESS,
      bip44: {
          coinType: 118,
      },
      bech32Config: {
          bech32PrefixAccAddr: "dig",
          bech32PrefixAccPub: "dig" + "pub",
          bech32PrefixValAddr: "dig" + "valoper",
          bech32PrefixValPub: "dig" + "valoperpub",
          bech32PrefixConsAddr: "dig" + "valcons",
          bech32PrefixConsPub: "dig" + "valconspub",
      },
      currencies: [ 
          { 
              coinDenom: "dig", 
              coinMinimalDenom: "udig", 
              coinDecimals: 6, 
              coinGeckoId: "dig", 
          }, 
      ],
      feeCurrencies: [
          {
              coinDenom: "dig",
              coinMinimalDenom: "udig",
              coinDecimals: 6,
              coinGeckoId: "dig",
          },
      ],
      stakeCurrency: {
          coinDenom: "dig",
          coinMinimalDenom: "udig",
          coinDecimals: 6,
          coinGeckoId: "dig",
      },
      coinType: 118,
      gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.03,
      },
    });
  }

  render() {
    return (
      <StackableContainer>
        <StackableContainer lessPadding>
          <p style={{color: '#cc4400'}}>
            Already have a 0x address? Enter it below. If it’s a valid
            address, you will be able to transfer your dig from 0x format 
            address to dig1 format address
          </p>
        </StackableContainer>
        <StackableContainer lessPadding lessMargin>
          <Button
            label="Connect Metamask wallet"
            onClick={this.handleConnect}
            primary
          />
        </StackableContainer>
        <StackableContainer lessPadding lessMargin>
          <div className="changeColor">
            <Input
              className="queryInput"
              onChange={this.handleChange}
              value={this.state.address}
              label="Quick query balance for address"
              name="address"
              placeholder=""
            />
           </div>
          <Button
            label="Query"
            onClick={this.handleQuery}
          />
          <br/>
          {this.state.querySuccess ? (
            <p style={{color: '#424242'}}>Your balance is {this.state.balance} dig</p>

          ) : 
          (
            <></>
          )}
        </StackableContainer>
        <StackableContainer lessPadding lessMargin>
            <Button
              label="Add dig to Keplr wallet"
              onClick={this.handleAddKeplr}
            />
        </StackableContainer>
        <style jsx>{`
          .changeMargin {
            margin-top: 0.5em;
            color: #424242;
          }
          .multisig-form {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .error {
            margin-top: 0.5em;
            color: #424242;
            font-size: 0.8em;
            text-align: center;
            margin: 0.5em 0;
          }
          .create-help {
            text-align: center;
          }.feature_name{
            color: #d84800;	
          }
          .queryInput {
            color: #424242;
          }
          .changeColor {
            color: #424242;
          }
        
        `}</style>
      </StackableContainer>
    );
  }
}

export default FindMultisigForm;
