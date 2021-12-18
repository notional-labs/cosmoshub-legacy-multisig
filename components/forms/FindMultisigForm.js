import React from "react";

import Button from "../inputs/Button";
import StackableContainer from "../layout/StackableContainer";

import { getWeb3Instance } from "../../lib/metamaskHelpers";
import { StargateClient } from "@cosmjs/stargate";

class FindMultisigForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      keyError: "",
      processing: false,
    };
  }

  handleConnect = async () => {
    let web3 = await getWeb3Instance();

    const address = (await web3.eth.getAccounts())[0];

    let client;
    let balance;

    try {
      client = await StargateClient.connect(
        process.env.NEXT_PUBLIC_NODE_ADDRESS
      );

      balance = await client.getBalance(
        address,
        process.env.NEXT_PUBLIC_DENOM
      );
    }catch(error){
      console.log("error = " + error)
      this.props.onFailure();
      return;
    }

    this.props.onSuccess(web3, address, balance.amount);
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
