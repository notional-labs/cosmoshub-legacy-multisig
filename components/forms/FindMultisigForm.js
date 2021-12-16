import axios from "axios";
import React from "react";
import { withRouter } from "next/router";

import Button from "../inputs/Button";
import StackableContainer from "../layout/StackableContainer";
import Input from "../inputs/Input";

class FindMultisigForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      address: "",
      keyError: "",
      processing: false,
    };
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleSearch = async () => {
    this.setState({ processing: true });

    this.props.router.push(`/multi/${this.state.address}`);
  };

  render() {
    return (
      <StackableContainer>
        <StackableContainer lessPadding>
          <p>
            Enter your 0x address below
          </p>
        </StackableContainer>
        <StackableContainer>
          <Input
            onChange={this.handleChange}
            value={this.state.address}
            label="Ox Address"
            name="address"
            placeholder="0xffe7aba28065e451c71f4bb317c564bf9f03e1d2"
          />
          <Button
            label="Use this address"
            onClick={this.handleSearch}
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

export default withRouter(FindMultisigForm);
