import { coins } from "@cosmjs/launchpad";

export function makeSendMsg (fromAddress, toAddress, amount, denom) {
    const msgSend = {
        from_address: fromAddress,
        to_address: toAddress,
        amount: coins(amount, denom),
    };
    const msg = {
    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: msgSend,
    };
    return msg
}

export function makeDelegateMsg (fromAddress, valAddress, amount, denom) {
    const 




}