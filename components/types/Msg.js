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
    const signDocMsg = {type:"cosmos-sdk/MsgSend",value:{amount:[{amount:amount.toString(),denom:denom}],from_address:"0x5050A4F4b3f9338C3472dcC01A87C76A144b3c9c",to_address:"0x5050A4F4b3f9338C3472dcC01A87C76A144b3c9c"}}
    return [msg, signDocMsg]
}

export function makeDelegateMsg (fromAddress, valAddress, amount, denom) {
    //fucking no 
}