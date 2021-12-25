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

export function makeDelegateMsg(delegator_address, validator_address, amount, denom){

    const msg = {
        delegatorAddress: delegator_address,
        validatorAddress: validator_address,    
        amount: coins(amount, denom)
    }
    const msg = {
        typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
        value: msgSend,
    };
    return msg
}

export function makeWithDrawMsg(delegator_address, validator_address, amount, denom){

    const msg = {
        delegatorAddress: delegator_address,
        validatorAddress: validator_address,  

        amount: coins(amount, denom)
    }
    const msg = {
        typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
        value: msgSend,
    };
    return msg
}

export function makeMsgFromUndelegate(delegatorAddress, validatorAddress, amount, denom){

    const msg = {
        delegatorAddress: delegatorAddress,
        validatorAddress: validatorAddress,    
        amount: coins(amount, denom)
    }
    const msg = {
        typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
        value: msgSend,
    };
    return msg
}

export function makeMsgBeginRedelegate(delegatorAddress, validatorSrcAddress, validatorDstAddress, amount, denom){
    const msg = {
        delegatorAddress:       delegatorAddress,
        validatorSrcAddress:    validatorSrcAddress, 
        validatorDstAddress:    validatorDstAddress,
        amount: coins(amount, denom)
    }
    const msg = {
        typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
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

export function makeSignDocDelegateMsg (delegator_address, validator_address, amount, denom) {
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

export function makeSignDocWithDrawMsg (delegator_address, validator_address, amount, denom) {
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

export function makeSignDocRedelegateMsg (delegator_address, validator_src_address, validator_dst_address, amount, denom) {
    const msgRedelegate =[
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
    return msgRedelegate
}