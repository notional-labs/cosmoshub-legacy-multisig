import React from "react";

import Button from "../inputs/Button";
import StackableContainer from "../layout/StackableContainer";

import { getWeb3Instance } from "../../lib/metamaskHelpers";

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

    const balanceMWei = await web3.eth.getBalance(address);
    const balance = web3.utils.fromWei(balanceMWei, 'mwei');

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
