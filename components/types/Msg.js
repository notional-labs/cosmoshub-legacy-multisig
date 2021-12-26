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
    const signDocMsg = {type:"cosmos-sdk/MsgSend",value:{amount:[{amount:amount.toString(),denom:denom}],from_address:"0xa296C23809E4E5f1AA53520883e2D5Ea559c60b2",to_address:"0xa296C23809E4E5f1AA53520883e2D5Ea559c60b2"}}
    return [msg, signDocMsg]
}

export function makeDelegateMsg (fromAddress, valAddress, amount, denom) {
    //fucking no 
}