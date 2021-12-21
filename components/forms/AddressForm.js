import React from "react";

import Button from "../inputs/Button";
import HashView from "../dataViews/HashView";
import MultisigHoldings from "../dataViews/MultisigHoldings";
import Page from "../layout/Page";
import StackableContainer from "../layout/StackableContainer";
import TransactionForm from "./TransactionForm";

class AddressForm extends React.Component {

    constructor(props){
      super(props);

      this.state = {
        showTxForm: false
      }
    }

    render() {
        return (
              <StackableContainer base>
                <StackableContainer>
                  <label>Dig Address</label>
                  <h1>
                    <HashView hash={this.props.address} />
                  </h1>
                </StackableContainer>
                {this.props.error && (
                  <StackableContainer>
                    <div className="multisig-error">
                      <p>
                        This multisig address's pubkeys are not available, and so it
                        cannot be used with this tool.
                      </p>
                      <p>
                        You can recreate it with this tool here, or sign and broadcast a
                        transaction with the tool you used to create it. Either option
                        will make the pubkeys accessible and will allow this tool to use
                        this multisig fully.
                      </p>
                    </div>
                  </StackableContainer>
                )}
                {this.state.showTxForm ? (
                  <TransactionForm
                    address={this.props.address}
                    accountOnChain={this.props.accountOnChain}
                    web3={this.props.web3}
                    holdings={this.props.holdings}
                    pubKey={this.props.pubKey}
                    closeForm={() => {
                      this.setState({showTxForm : false})
                    }}
                  />
                ) : (
                  <div className="interfaces">
                    <div className="col-1">
                      <MultisigHoldings holdings={this.props.holdings} />
                    </div>
                    <div className="col-2">
                      <StackableContainer lessPadding>
                        <h2>Conversion (Under construction)</h2>
                        <p>
                          Transfer dig from BSC wallet to DIG wallet
                        </p>
                        <Button
                          label="Convert"
                          onClick={() => {
                            this.setState({showTxForm : true})
                          }}
                        />
                      </StackableContainer>
                    </div>
                  </div>
                )}
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
              </StackableContainer>
        );
    }
}

export default AddressForm;