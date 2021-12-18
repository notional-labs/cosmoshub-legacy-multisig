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
          <div style={{ display: 'flex', direction: 'row', justifyContent: 'center' }}>
            <img style={{ width: 50, height: 50, marginRight: '10px', }} src="https://digchain.org/wp-content/uploads/2018/09/DIG.png" />
            <h1 style={{ color: '#424242', }} className="title">
              <div style={{ marginTop: '10px', fontSize: '25px' }}>
                Dig conversion tool
              </div>
            </h1>
          </div>
        </StackableContainer>
        {walletConnected ? (
          <AddressForm
            web3={web3}
            address={address}
            accountOnChain={{
              accountNumber: 0,
              sequence: 0
            }}
            holdings={balance}
          />
        ) : (
          <FindMultisigForm
            onSuccess={(web3, address, balance) => {
              setWalletConnected(true);
              setWeb3(web3);
              setAddress(address);
              setBalance(balance);
            }}
            onFailure={
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
