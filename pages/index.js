import React, { useState } from "react";
import FindMultisigForm from "../components/forms/FindMultisigForm";
import Page from "../components/layout/Page";
import StackableContainer from "../components/layout/StackableContainer";
import AddressForm from "../components/forms/AddressForm";

export default () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState('0');

  return (
    <Page>
      <StackableContainer base>
        <StackableContainer lessPadding>
          <h1 className="title">Dig conversion tool</h1>
        </StackableContainer>
          {walletConnected ? (
              <AddressForm
                web3 = { web3 }
                address = { address }
                accountOnChain = { {
                  accountNumber : 0,
                  sequence : 0
                } }
                holdings = { balance }
              />
            ): (
              <FindMultisigForm 
                onSuccess = {(web3, address, balance) => {
                  setWalletConnected(true);
                  setWeb3(web3);
                  setAddress(address);
                  setBalance(balance);
                }}
                onFailure = {
                  () => {
                    alert("fail to fetch your account");
                  }
                }
              />
            )
          }
      </StackableContainer>
    </Page>
  )
};
