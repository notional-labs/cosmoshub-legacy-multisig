import React, { useState } from "react";
import { StargateClient } from "@cosmjs/stargate";
import { useRouter } from "next/router";

import Button from "../../../components/inputs/Button";
import { getMultisigAccount } from "../../../lib/multisigHelpers";
import HashView from "../../../components/dataViews/HashView";
import MultisigHoldings from "../../../components/dataViews/MultisigHoldings";
import MultisigMembers from "../../../components/dataViews/MultisigMembers";
import Page from "../../../components/layout/Page";
import StackableContainer from "../../../components/layout/StackableContainer";
import TransactionForm from "../../../components/forms/TransactionForm";
import TransactionList from "../../../components/dataViews/TransactionList";
import ConnectWallet from "../../../components/forms/ConnectWallet";

export async function getServerSideProps(context) {
  let holdings;
  try {
    const client = await StargateClient.connect(
      process.env.NEXT_PUBLIC_NODE_ADDRESS
    );
    const multisigAddress = context.params.address;
    holdings = await client.getBalance(
      multisigAddress,
      process.env.NEXT_PUBLIC_DENOM
    );
    const accountOnChain = await getMultisigAccount(multisigAddress, client);

    return {
      props: { accountOnChain, holdings: holdings.amount / 1000000 },
    };
  } catch (error) {
    console.log(error);
    return {
      props: { error: error.message, holdings: 0 },
    };
  }
}

function ConnectWalletKeplr(){
  console.log("vuong")
}

const multipage = (props) => {
  const [showTxForm, setShowTxForm] = useState(false);
  const router = useRouter();
  const { address } = router.query;
  return (
    <Page>
      <StackableContainer base>
        <StackableContainer>
          <label>Multisig Address</label>
          <h1>
            <HashView hash={address} />
          </h1>
        </StackableContainer>
        {props.error && (
          <StackableContainer>
            <div className="multisig-error">
              <p>
                Not available address
              </p>
              <p>
                Please use right address
              </p>
            </div>
          </StackableContainer>
        )}
        {showTxForm ? (
          <TransactionForm
            address={address}
            accountOnChain={props.accountOnChain}
            holdings={props.holdings}
            closeForm={() => {
              setShowTxForm(false);
            }}
          />
        ) : (
          <div className="interfaces">
            <div className="col-1">
              <MultisigHoldings holdings={props.holdings} />
            </div>
            <div className="col-2">
            </div>
          </div>
        )}
      </StackableContainer>
      <style jsx>{`
        .interfaces {
          display: flex;
          justify-content: space-between;
          margin-top: 50px;
        }
        .col-1 {
          flex: 1;
          padding-right: 50px;
        }
        .col-2 {
          flex: 1;
        }
        label {
          font-size: 12px;
          font-style: italic;
        }
        p {
          margin-top: 15px;
        }
        .multisig-error p {
          max-width: 550px;
          color: red;
          font-size: 16px;
          line-height: 1.4;
        }
        .multisig-error p:first-child {
          margin-top: 0;
        }
      `}</style>
    </Page>
  );
};

export default multipage;
