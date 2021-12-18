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
    let axiosRes = await axios.get(url);
    return axiosRes.data.balances[0].amount;
  }

  handleQuery = async () => {
    const balance = await this.handleQueryBalanceOnRest(this.state.address);
    if(balance){
      this.setState({
        balance : balance,
        querySuccess: true,
      });
    }
  }

  handleConnect = async () => {
    let web3 = await getWeb3Instance();

    const address = (await web3.eth.getAccounts())[0];

    let balance;

    try {
      balance = await this.handleQueryBalanceOnRest(address);
    }catch(error){
      console.log("error = " + error)
      this.props.onFailure();
      return;
    }

    this.props.onSuccess(web3, address, balance);
  };

  render() {
    return (
      <StackableContainer>
        <StackableContainer lessPadding>
          <p>
            Already have a 0x address? Enter it below. If it’s a valid
            address, you will be able to transfer your dig from 0x format 
            address to dig1 format address
          </p>
        </StackableContainer>
        <StackableContainer lessPadding lessMargin>
          <Button
            label="Connect wallet"
            onClick={this.handleConnect}
            primary
          />
        </StackableContainer>
        <StackableContainer lessPadding lessMargin>
          <Input
            onChange={this.handleChange}
            value={this.state.address}
            label="Quick query balance for address"
            name="address"
            placeholder=""
          />
          <Button
            label="Query"
            onClick={this.handleQuery}
          />
          <br/>
          {this.state.querySuccess ? (
            <p>Your balance is {this.state.balance}</p>
          ) : 
          (
            <></>
          )}
        </StackableContainer>
        <style jsx>{`
          .multisig-form {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .error {
            color: coral;
            font-size: 0.8em;
            text-align: left;
            margin: 0.5em 0;
          }
          .create-help {
            text-align: center;
          }
        `}</style>
      </StackableContainer>
    );
  }
}

export default FindMultisigForm;
