import { coins } from "@cosmjs/launchpad";

export function makeSendMsg (fromAddress, toAddress, amount, denom) {
    const msgSend = {
        fromAddress: fromAddress,
        toAddress: toAddress,
        amount: coins(amount, denom),
    };
    const msg = {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: msgSend,
    };
    return msg
}

export function makeSignDocSendMsg (fromAddress, toAddress, amount, denom) {
    const signDocMsg = {
        type:"cosmos-sdk/MsgSend",
        value:{
            amount:[
                {
                    amount:amount.toString(),
                    denom:denom
                }
            ],
            from_address:fromAddress,
            to_address:toAddress
        }
    }
    return signDocMsg
}

export function makeDelegateMsg (delegator_address, validator_address, amount, denom) {
    const signDocDelegate = {
        type:"cosmos-sdk/MsgDelegate",
        value:{
            amount:[
                {
                    amount:amount.toString(),
                    denom:denom
                }
            ],
            delegator_address: delegator_address,
            validator_address: validator_address,    
     
        }
    }
    return signDocDelegate
}

export function makeWithDrawMsg (delegator_address, validator_address, amount, denom) {
    const signDocDelegate = {
        type:"cosmos-sdk/MsgWithdrawDelegationReward",
        value:{
            amount:[
                {
                    amount:amount.toString(),
                    denom:denom
                }
            ],
            delegator_address: delegator_address,
            validator_address: validator_address,    
     
        }
    }
    return signDocDelegate
}

export function makeRedelegateMsg (delegator_address, validator_src_address, validator_dst_address, amount, denom) {
    const msgDelegate =[
        {
          "type": "cosmos-sdk/MsgBeginRedelegate",
          "value": {
            delegator_address: delegator_address,
            validator_src_address: validator_src_address,
            validator_dst_address: validator_dst_address,
            amount: {
               denom: denom,
              amount: amount.toString(),
            }
          }
        }
      ],
}